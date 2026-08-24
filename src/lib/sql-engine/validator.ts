import { QueryExecutionResult } from '../../types/database';
import { ValidationRule } from '../../types/curriculum';
import { parseSql } from './parser';

export interface ValidationOutcome {
  passed: boolean;
  feedback: string;
  hintLevelToUnlock?: number;
}

export function validateTaskSolution(
  userSql: string,
  result: QueryExecutionResult,
  rule: ValidationRule
): ValidationOutcome {
  if (!result.success) {
    return {
      passed: false,
      feedback: `SQL syntax or execution error: ${result.error}`,
    };
  }

  const parsed = parseSql(userSql);

  // 1. Check Target Table
  if (rule.targetTable) {
    const fromTable = parsed.fromTable?.toLowerCase() || parsed.insertTable?.toLowerCase() || parsed.updateTable?.toLowerCase() || parsed.deleteTable?.toLowerCase();
    if (!fromTable || fromTable !== rule.targetTable.toLowerCase()) {
      return {
        passed: false,
        feedback: `You are querying the table '${fromTable || 'unknown'}', but this task requires querying the '${rule.targetTable}' table.`,
      };
    }
  }

  // 2. Check Required Columns
  if (rule.requiredColumns && rule.requiredColumns.length > 0) {
    const resultCols = result.columns.map(c => c.toLowerCase());
    for (const reqCol of rule.requiredColumns) {
      if (!resultCols.includes(reqCol.toLowerCase())) {
        return {
          passed: false,
          feedback: `Missing column '${reqCol}'. Your query results currently include: [${result.columns.join(', ')}].`,
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
          feedback: `You're querying the correct table, but you're returning more columns than the task asks for (found '${forb}'). Specify only the requested columns.`,
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

  // 5. Check LIMIT
  if (rule.requireLimit !== undefined) {
    if (typeof rule.requireLimit === 'number') {
      if (parsed.limit !== rule.requireLimit) {
        return {
          passed: false,
          feedback: `Almost there! This task specifically requires a LIMIT of ${rule.requireLimit}.`,
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

  // 6. Check OFFSET
  if (rule.requireOffset !== undefined) {
    if (parsed.offset !== rule.requireOffset) {
      return {
        passed: false,
        feedback: `This task requires an OFFSET of ${rule.requireOffset} (e.g. LIMIT ... OFFSET ${rule.requireOffset}).`,
      };
    }
  }

  // 7. Check ORDER BY
  if (rule.requireOrderBy && rule.requireOrderBy.length > 0) {
    if (!parsed.orderBy || parsed.orderBy.length === 0) {
      return {
        passed: false,
        feedback: `Remember to order the results using the ORDER BY clause.`,
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

  // 8. Check DISTINCT
  if (rule.requireDistinct) {
    if (!parsed.isDistinct && !userSql.toUpperCase().includes('DISTINCT')) {
      return {
        passed: false,
        feedback: `This task requires returning distinct (unique) rows. Use the DISTINCT keyword after SELECT.`,
      };
    }
  }

  // 9. Check WHERE
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

  // 10. Check Expected Row Count
  if (rule.expectedRowCount !== undefined) {
    if (typeof rule.expectedRowCount === 'number') {
      if (result.rowCount !== rule.expectedRowCount) {
        return {
          passed: false,
          feedback: `Your query returned ${result.rowCount} row(s), but ${rule.expectedRowCount} row(s) were expected. Check your WHERE condition or LIMIT.`,
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

  // 11. Custom Validator
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
