import { QueryExecutionResult } from '../../types/database';
import { ValidationRule } from '../../types/curriculum';
import { parseSql } from './parser';
import { DATABASE_SCHEMAS } from '../../content/database/schema';

export interface ValidationOutcome {
  passed: boolean;
  feedback: string;
  hintLevelToUnlock?: number;
}

// Levenshtein distance for fuzzy typo suggestion
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export function validateTaskSolution(
  userSql: string,
  result: QueryExecutionResult,
  rule: ValidationRule
): ValidationOutcome {
  const cleanSql = userSql.trim();

  // Check Trailing Semicolon Hint
  if (!cleanSql.endsWith(';')) {
    // We don't fail just for a missing semicolon, but we can give feedback if something else fails
  }

  // Check Common Aggregate in WHERE Trap (only within the WHERE clause and not part of a subquery or HAVING)
  const whereMatch = cleanSql.match(/\bWHERE\b((?:(?!\bSELECT\b)[\s\S])*?)(?:\bGROUP\s+BY\b|\bHAVING\b|\bORDER\s+BY\b|\bLIMIT\b|\)|;|$)/i);
  if (whereMatch && whereMatch[1]) {
    const whereText = whereMatch[1];
    if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(whereText)) {
      return {
        passed: false,
        feedback: `⚠️ Syntax Trap: Aggregate functions like COUNT() or SUM() cannot be used directly in a WHERE clause. Filter aggregates using the HAVING clause after GROUP BY instead.`,
      };
    }
  }

  // Check Missing Quotes around text literals in WHERE (excluding column comparisons like p2.cat_id = p1.cat_id)
  const unquotedMatch = cleanSql.match(/\bWHERE\b\s+([a-zA-Z0-9_.]+)\s*(=|!=|LIKE)\s*([a-zA-Z][a-zA-Z0-9_]*)(?!\s*[\(.])/i);
  if (unquotedMatch) {
    const rhs = unquotedMatch[3].toUpperCase();
    const isKeywordOrNumber = ['NULL', 'TRUE', 'FALSE', 'SELECT', 'AS', 'AND', 'OR', 'NOT'].includes(rhs) || /^\d+$/.test(rhs);
    // Don't flag if it's a known table alias or table column
    const isTableAlias = ['P1', 'P2', 'P', 'C', 'O', 'OI', 'S', 'R', 'CAT', 'AC'].includes(rhs);
    if (!isKeywordOrNumber && !isTableAlias) {
      return {
        passed: false,
        feedback: `💡 Quote Reminder: Text values in SQL must be enclosed in single quotes (e.g., '${unquotedMatch[3]}' instead of ${unquotedMatch[3]}).`,
      };
    }
  }

  if (!result.success) {
    return {
      passed: false,
      feedback: `SQL Error: ${result.error}`,
    };
  }

  const parsed = parseSql(userSql);

  // 1. Check Target Table
  if (rule.targetTable) {
    let fromTable = parsed.fromTable?.toLowerCase() || parsed.insertTable?.toLowerCase() || parsed.updateTable?.toLowerCase() || parsed.deleteTable?.toLowerCase();
    
    if (parsed.type === 'CTE' && parsed.cteQuery) {
      const cteParsed = parseSql(parsed.cteQuery);
      const mainParsed = parseSql(parsed.mainQuery || '');
      if (
        cteParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase() ||
        mainParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase() ||
        cleanSql.toLowerCase().includes(rule.targetTable.toLowerCase())
      ) {
        fromTable = rule.targetTable.toLowerCase();
      }
    } else if (parsed.type === 'EXPLAIN' && parsed.explainTarget) {
      const expParsed = parseSql(parsed.explainTarget);
      if (expParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase()) {
        fromTable = rule.targetTable.toLowerCase();
      }
    } else if (parsed.type === 'DDL') {
      if (cleanSql.toLowerCase().includes(rule.targetTable.toLowerCase())) {
        fromTable = rule.targetTable.toLowerCase();
      }
    }

    if (!fromTable || fromTable !== rule.targetTable.toLowerCase()) {
      return {
        passed: false,
        feedback: `You are querying the table '${fromTable || 'unknown'}', but this task requires querying the '${rule.targetTable}' table. Check your FROM clause.`,
      };
    }
  }

  // 2. Check Required Columns & provide typo suggestions
  if (rule.requiredColumns && rule.requiredColumns.length > 0) {
    const resultCols = result.columns.map(c => c.toLowerCase());
    for (const reqCol of rule.requiredColumns) {
      if (!resultCols.includes(reqCol.toLowerCase())) {
        // Look for possible typo in returned columns
        const typoCandidates = result.columns.filter(c => levenshtein(c.toLowerCase(), reqCol.toLowerCase()) <= 2);
        let typoHint = '';
        if (typoCandidates.length > 0) {
          typoHint = ` Did you mean '${reqCol}' instead of '${typoCandidates[0]}'?`;
        }

        return {
          passed: false,
          feedback: `Missing column '${reqCol}'.${typoHint} Your query currently outputs: [${result.columns.join(', ')}].`,
        };
      }
    }
  }

  // 3. Check Forbidden Columns (e.g. user ran SELECT * when specific columns were requested)
  if (rule.forbiddenColumns && rule.forbiddenColumns.length > 0) {
    const resultCols = result.columns.map(c => c.toLowerCase());
    for (const forb of rule.forbiddenColumns) {
      if (resultCols.includes(forb.toLowerCase())) {
        return {
          passed: false,
          feedback: `You're querying the correct table, but returning extra columns (found '${forb}'). Explicitly specify only the requested columns in your SELECT clause.`,
        };
      }
    }
  }

  // 4. Check Required Aliases (e.g., AS customer_name)
  if (rule.requiredAliases) {
    for (const [orig, alias] of Object.entries(rule.requiredAliases)) {
      const aliasFound = result.columns.some(c => c.toLowerCase() === alias.toLowerCase());
      if (!aliasFound) {
        return {
          passed: false,
          feedback: `Make sure to alias '${orig}' to '${alias}' using the AS keyword (e.g., SELECT ${orig} AS ${alias}).`,
        };
      }
    }
  }

  // 5. Check JOIN requirements
  if (rule.requireJoin && !parsed.joins?.length && !cleanSql.toUpperCase().includes('JOIN')) {
    return {
      passed: false,
      feedback: `This task requires joining multiple tables using the JOIN keyword (e.g. FROM table_a JOIN table_b ON table_a.id = table_b.a_id).`,
    };
  }

  // 6. Check GROUP BY requirements
  if (rule.requireGroupBy && !parsed.groupBy?.length && !cleanSql.toUpperCase().includes('GROUP BY')) {
    return {
      passed: false,
      feedback: `This task requires aggregating rows by categories or entities using the GROUP BY clause.`,
    };
  }

  // 7. Check HAVING requirements
  if (rule.requireHaving && !parsed.havingClause && !cleanSql.toUpperCase().includes('HAVING')) {
    return {
      passed: false,
      feedback: `This task requires filtering aggregated groups using the HAVING clause after GROUP BY.`,
    };
  }

  // 8. Check LIMIT
  if (rule.requireLimit !== undefined) {
    if (typeof rule.requireLimit === 'number') {
      if (parsed.limit !== rule.requireLimit) {
        return {
          passed: false,
          feedback: `Almost there! This task specifically requires a LIMIT of ${rule.requireLimit}. Currently LIMIT is ${parsed.limit ?? 'not set'}.`,
        };
      }
    } else {
      if (rule.requireLimit.exact && parsed.limit !== rule.requireLimit.exact) {
        return {
          passed: false,
          feedback: `This task requires LIMIT ${rule.requireLimit.exact}. Currently LIMIT is ${parsed.limit || 'not specified'}.`,
        };
      }
    }
  }

  // 9. Check OFFSET
  if (rule.requireOffset !== undefined) {
    if (parsed.offset !== rule.requireOffset) {
      return {
        passed: false,
        feedback: `This task requires an OFFSET of ${rule.requireOffset} (e.g. LIMIT ... OFFSET ${rule.requireOffset}).`,
      };
    }
  }

  // 10. Check ORDER BY
  if (rule.requireOrderBy && rule.requireOrderBy.length > 0) {
    if (!parsed.orderBy || parsed.orderBy.length === 0) {
      return {
        passed: false,
        feedback: `Remember to sort the results using the ORDER BY clause.`,
      };
    }
    for (const reqOrd of rule.requireOrderBy) {
      const match = parsed.orderBy.find(o => o.column.toLowerCase() === reqOrd.column.toLowerCase());
      if (!match) {
        return {
          passed: false,
          feedback: `Make sure to sort by '${reqOrd.column}'.`,
        };
      }
      if (reqOrd.direction && match.direction !== reqOrd.direction) {
        return {
          passed: false,
          feedback: `Sort direction for '${reqOrd.column}' should be ${reqOrd.direction} (e.g. ORDER BY ${reqOrd.column} ${reqOrd.direction}).`,
        };
      }
    }
  }

  // 11. Check DISTINCT
  if (rule.requireDistinct) {
    if (!parsed.isDistinct && !userSql.toUpperCase().includes('DISTINCT')) {
      return {
        passed: false,
        feedback: `This task requires returning distinct (unique) rows. Use the DISTINCT keyword after SELECT.`,
      };
    }
  }

  // 12. Check WHERE
  if (rule.requireWhere) {
    if (!parsed.whereClause && !parsed.havingClause) {
      return {
        passed: false,
        feedback: `This task requires filtering with a WHERE clause.`,
      };
    }
    if (rule.whereContainsTerms) {
      const upperSql = userSql.toUpperCase();
      for (const term of rule.whereContainsTerms) {
        if (!upperSql.includes(term.toUpperCase())) {
          return {
            passed: false,
            feedback: `Your filter should use '${term}' to check the condition.`,
          };
        }
      }
    }
  }

  // 13. Check Expected Row Count
  if (rule.expectedRowCount !== undefined) {
    if (typeof rule.expectedRowCount === 'number') {
      if (result.rowCount !== rule.expectedRowCount) {
        return {
          passed: false,
          feedback: `Your query returned ${result.rowCount} row(s), but ${rule.expectedRowCount} row(s) were expected. Check your WHERE condition, JOINs, or LIMIT.`,
        };
      }
    } else {
      if (rule.expectedRowCount.min !== undefined && result.rowCount < rule.expectedRowCount.min) {
        return {
          passed: false,
          feedback: `Your query returned too few rows (${result.rowCount}). Check your filtering logic.`,
        };
      }
      if (rule.expectedRowCount.max !== undefined && result.rowCount > rule.expectedRowCount.max) {
        return {
          passed: false,
          feedback: `Your query returned too many rows (${result.rowCount}). Check your filtering conditions or LIMIT.`,
        };
      }
    }
  }

  // 14. Custom Validator
  if (rule.customValidator) {
    const custom = rule.customValidator(parsed, result);
    if (!custom.valid) {
      return {
        passed: false,
        feedback: custom.message || 'The query result does not match all required criteria.',
      };
    }
  }

  return {
    passed: true,
    feedback: 'Success! Your query produced the expected results and meets all criteria.',
  };
}

