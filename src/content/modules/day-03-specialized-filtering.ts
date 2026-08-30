import { ModuleData } from '../../types/curriculum';

export const Day_03_MODULE: ModuleData = {
  id: "day-03",
  slug: "specialized-filtering",
  day: 3,
  title: "Day 3 — Specialized Filtering",
  shortTitle: "Specialized Filtering",
  type: "module",
  milestoneId: "milestone-1",
  description:
    "Master advanced filtering: compound logic (AND, OR, NOT, Parentheses), discrete sets (IN), continuous intervals (BETWEEN), wildcard patterns (LIKE with % and _), and NULL safety (IS NULL / IS NOT NULL).",
  estimatedMinutes: 60,
  completionLearnings: [
    "Narrow down query results using AND intersection logic",
    "Expand candidate results using OR union logic",
    "Invert boolean conditions safely using NOT (condition)",
    "Enforce evaluation order and avoid operator precedence bugs with parentheses",
    "Filter inclusive intervals on numbers and dates using BETWEEN ... AND ...",
    "Replace verbose chained OR equality checks with clean IN (...) lists",
    "Perform partial string searches using LIKE with % (any length) and _ (single character)",
    "Safely detect missing data with IS NULL and IS NOT NULL without = NULL failures",
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1a: Combining Conditions with AND (Intersection)
    // =========================================================================
    {
      id: "where-and-intersection",
      order: 1,
      title: "1. Combining Conditions with AND (Intersection)",
      shortDescription:
        "How to require multiple conditions to be TRUE simultaneously.",
      theory: {
        summary:
          "In real applications, decisions depend on multiple conditions simultaneously. What if we want CSE students who are also 21 years old?",
        introTable: {
          tableName: "students",
          description: "Original students table stored in database (5 records)",
          columns: ["id", "name", "age", "department", "city"],
          rows: [
            [1, "Rahim", 21, "CSE", "Dhaka"],
            [2, "Karim", 22, "EEE", "Gazipur"],
            [3, "Ayesha", 20, "CSE", "Dhaka"],
            [4, "Sumaiya", 23, "BBA", "Chattogram"],
            [5, "Tanvir", 21, "CSE", "Rajshahi"],
          ],
        },
        explanation: [
          "`AND` narrows down your results. A row survives only if **every condition** evaluates to `TRUE`.",
          "### 1. AND Logic Table\n• `TRUE AND TRUE` ---> **TRUE** ✅\n• `TRUE AND FALSE` ---> **FALSE** ❌\n• `FALSE AND TRUE` ---> **FALSE** ❌\n• `FALSE AND FALSE` ---> **FALSE** ❌",
          "Let's see how SQL checks each student against both criteria simultaneously.",
        ],
        targetQuery: {
          sql: "SELECT name, age, department\nFROM students\nWHERE department = 'CSE' AND age = 21;",
          explanation:
            "Find students who are BOTH in the CSE department AND 21 years old.",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM students (Find all students)",
            sqlSnippet: "FROM students",
            explanation: "SQL visits the students table containing 5 records.",
            tableData: {
              tableName: "students (Source Table)",
              columns: ["id", "name", "age", "department"],
              rows: [
                [1, "Rahim", 21, "CSE"],
                [2, "Karim", 22, "EEE"],
                [3, "Ayesha", 20, "CSE"],
                [4, "Sumaiya", 23, "BBA"],
                [5, "Tanvir", 21, "CSE"],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: "Step 2: WHERE department = 'CSE' AND age = 21",
            sqlSnippet: "WHERE department = 'CSE' AND age = 21",
            explanation:
              "1. Rahim: (CSE = TRUE) AND (21 = TRUE) ➔ TRUE ✅\n2. Karim: (EEE = FALSE) ➔ FALSE ❌\n3. Ayesha: (CSE = TRUE) AND (20 = FALSE) ➔ FALSE ❌\n4. Sumaiya: (BBA = FALSE) ➔ FALSE ❌\n5. Tanvir: (CSE = TRUE) AND (21 = TRUE) ➔ TRUE ✅",
            tableData: {
              tableName: "Surviving Rows (CSE & 21)",
              columns: ["name", "age", "department"],
              highlightedRows: [0, 1],
              rows: [
                ["Rahim", 21, "CSE"],
                ["Tanvir", 21, "CSE"],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "AND syntax",
            sql: "SELECT name, age, department\nFROM students\nWHERE department = 'CSE' AND age = 21;",
            description:
              "Returns rows where both department equals CSE and age equals 21.",
          },
        ],
        keyTakeaway:
          "AND requires all specified conditions to evaluate to TRUE.",
        exampleQuery:
          "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
        exampleQueryExplanation:
          "Returns students who are both in CSE and aged 21.",
        liveDemoSql:
          "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
        liveDemoNotes: "Returns Rahim and Tanvir.",
        mcqs: [
          {
            question:
              "A table has 4 students: 2 in CSE, 3 aged >= 21, and only 1 student who is BOTH in CSE and aged >= 21. How many rows does `WHERE department = 'CSE' AND age >= 21` return?",
            options: ["A. 1 row", "B. 2 rows", "C. 3 rows", "D. 4 rows"],
            correctIndex: 0,
            explanation:
              "AND requires both conditions to be TRUE simultaneously, matching only the 1 student who meets both criteria.",
          },
        ],
      },
      masteryPoints: [
        "Use AND when all criteria must be TRUE",
        "Understand that adding AND conditions narrows down the result set",
      ],
      tasks: [
        {
          id: "day03-c1a-t1",
          title: "Task 1: CSE Students Aged 21",
          description:
            "Show name, age, and department for students in CSE who are exactly 21 years old.",
          instructions: [
            "Select `name`, `age`, and `department` from `students`.",
            "Filter where `department = 'CSE' AND age = 21`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "students",
          initialSql: "-- Write your SQL query here\n",
          solutionSql:
            "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
          solutionExplanation:
            "Returns Rahim and Tanvir (both in CSE and 21 years old).",
          hints: [
            { level: 1, text: "Add `21` after `age =`." },
            {
              level: 2,
              text: "`SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;`",
            },
          ],
          validation: {
            targetTable: "students",
            requiredColumns: ["name", "age", "department"],
            requireWhere: true,
            whereContainsTerms: ["department", "CSE", "AND", "age", "21"],
            expectedRowCount: 2,
          },
          successMessage: "Great job! You combined conditions using AND.",
        },
        {
          id: "day03-c1a-t2",
          title: "Task 2: High-Price & High-Stock Items",
          description:
            "Find products priced over $50.00 with quantity_in_stock greater than 10.",
          instructions: [
            "Query the `products` table.",
            "Select `name`, `price`, and `quantity_in_stock`.",
            "Filter where `price > 50 AND quantity_in_stock > 10`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql: "-- High price and high stock items\n",
          solutionSql:
            "SELECT name, price, quantity_in_stock FROM products WHERE price > 50 AND quantity_in_stock > 10;",
          solutionExplanation:
            "Extracts Mechanical Keyboard ($65.00, stock 12) and Stainless Steel Pan Set ($55.00, stock 15).",
          hints: [
            {
              level: 1,
              text: "Use `WHERE price > 50 AND quantity_in_stock > 10;`",
            },
          ],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "price", "quantity_in_stock"],
            requireWhere: true,
            whereContainsTerms: [
              "price",
              ">",
              "50",
              "AND",
              "quantity_in_stock",
              ">",
              "10",
            ],
            expectedRowCount: 2,
          },
          successMessage:
            "Perfect! You applied multi-attribute filtering on the catalog.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1b: Combining Conditions with OR (Union)
    // =========================================================================
    {
      id: "where-or-union",
      order: 2,
      title: "2. Combining Conditions with OR (Union)",
      shortDescription:
        "How to retrieve rows where at least one condition is TRUE.",
      theory: {
        summary:
          "What if we want students from Dhaka OR Gazipur? Either location is acceptable.",
        introTable: {
          tableName: "students",
          description: "Students snapshot across cities",
          columns: ["id", "name", "age", "department", "city"],
          rows: [
            [1, "Rahim", 21, "CSE", "Dhaka"],
            [2, "Karim", 22, "EEE", "Gazipur"],
            [3, "Ayesha", 20, "CSE", "Dhaka"],
            [4, "Sumaiya", 23, "BBA", "Chattogram"],
            [5, "Tanvir", 21, "CSE", "Rajshahi"],
          ],
        },
        explanation: [
          "`OR` broadens your results. A row survives if **at least one** condition passes (either condition 1, condition 2, or both).",
          "### 1. OR Logic Table\n• `TRUE OR TRUE` ---> **TRUE** ✅\n• `TRUE OR FALSE` ---> **TRUE** ✅\n• `FALSE OR TRUE` ---> **TRUE** ✅\n• `FALSE OR FALSE` ---> **FALSE** ❌",
        ],
        targetQuery: {
          sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka' OR city = 'Gazipur';",
          explanation:
            "Find students who live in Dhaka OR Gazipur (either location is acceptable).",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM students (Find all students)",
            sqlSnippet: "FROM students",
            explanation: "SQL scans the students table.",
            tableData: {
              tableName: "students (Source Table)",
              columns: ["name", "city"],
              rows: [
                ["Rahim", "Dhaka"],
                ["Karim", "Gazipur"],
                ["Ayesha", "Dhaka"],
                ["Sumaiya", "Chattogram"],
                ["Tanvir", "Rajshahi"],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle:
              "Step 2: WHERE city = 'Dhaka' OR city = 'Gazipur' (Evaluate either location)",
            sqlSnippet: "WHERE city = 'Dhaka' OR city = 'Gazipur'",
            explanation:
              "1. Rahim: ('Dhaka' = TRUE) ➔ TRUE ✅\n2. Karim: ('Gazipur' = TRUE) ➔ TRUE ✅\n3. Ayesha: ('Dhaka' = TRUE) ➔ TRUE ✅\n4. Sumaiya: ('Chattogram' = FALSE) ➔ FALSE ❌\n5. Tanvir: ('Rajshahi' = FALSE) ➔ FALSE ❌",
            tableData: {
              tableName: "Surviving Rows (Dhaka or Gazipur)",
              columns: ["name", "city"],
              highlightedRows: [0, 1, 2],
              rows: [
                ["Rahim", "Dhaka"],
                ["Karim", "Gazipur"],
                ["Ayesha", "Dhaka"],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "OR syntax",
            sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka' OR city = 'Gazipur';",
            description: "Returns rows where city is either Dhaka or Gazipur.",
          },
        ],
        keyTakeaway:
          "OR returns rows matching any of the specified conditions.",
        exampleQuery:
          "SELECT name, city FROM students WHERE city = 'Dhaka' OR city = 'Gazipur';",
        exampleQueryExplanation: "Finds students living in Dhaka or Gazipur.",
        liveDemoSql:
          "SELECT name, city FROM students WHERE city = 'Dhaka' OR city = 'Gazipur';",
        liveDemoNotes: "Returns Rahim, Karim, and Ayesha.",
        mcqs: [
          {
            question:
              "A table has 5 students: 2 in Dhaka, 2 in Sylhet, and 1 in Chittagong. How many rows does `WHERE city = 'Dhaka' OR city = 'Sylhet'` return?",
            options: ["A. 2 rows", "B. 4 rows", "C. 5 rows", "D. 0 rows"],
            correctIndex: 1,
            explanation:
              "OR combines both sets (2 Dhaka + 2 Sylhet = 4 total rows).",
          },
        ],
      },
      masteryPoints: [
        "Use OR when at least one condition must be TRUE",
        "Understand that adding OR conditions expands the result set",
      ],
      tasks: [
        {
          id: "day03-c1b-t1",
          title: "Task 1: Students in Dhaka or Gazipur",
          description:
            "Show name and city of students who live in Dhaka or Gazipur.",
          instructions: [
            "Select `name` and `city` from `students`.",
            "Filter where `city = 'Dhaka' OR city = 'Gazipur'`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "students",
          initialSql: "-- Students in Dhaka or Gazipur\n",
          solutionSql:
            "SELECT name, city FROM students WHERE city = 'Dhaka' OR city = 'Gazipur';",
          solutionExplanation: "Returns Rahim, Karim, and Ayesha.",
          hints: [
            {
              level: 1,
              text: "Write `WHERE city = 'Dhaka' OR city = 'Gazipur';`",
            },
          ],
          validation: {
            targetTable: "students",
            requiredColumns: ["name", "city"],
            requireWhere: true,
            whereContainsTerms: ["city", "Dhaka", "OR", "Gazipur"],
            expectedRowCount: 3,
          },
          successMessage: "Great job! You expanded query candidates with OR.",
        },
        {
          id: "day03-c1b-t2",
          title: "Task 2: Bargain Items or High-Stock Items",
          description:
            "Find products priced under $10.00 OR with quantity_in_stock greater than 50.",
          instructions: [
            "Query the `products` table.",
            "Select `name`, `price`, and `quantity_in_stock`.",
            "Filter where `price < 10 OR quantity_in_stock > 50`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql: "-- Products under $10 OR stock over 50\n",
          solutionSql:
            "SELECT name, price, quantity_in_stock FROM products WHERE price < 10 OR quantity_in_stock > 50;",
          solutionExplanation:
            "Captures bargain accessories under $10 and surplus stock items over 50 units (5 items).",
          hints: [
            {
              level: 1,
              text: "Use `WHERE price < 10 OR quantity_in_stock > 50;`",
            },
          ],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "price", "quantity_in_stock"],
            requireWhere: true,
            whereContainsTerms: [
              "price",
              "<",
              "10",
              "OR",
              "quantity_in_stock",
              ">",
              "50",
            ],
            expectedRowCount: 5,
          },
          successMessage:
            "Well done! You filtered rows matching either condition.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1c: Negating Conditions with NOT
    // =========================================================================
    {
      id: "where-not-negation",
      order: 3,
      title: "3. Negating Conditions with NOT",
      shortDescription:
        "How to invert boolean evaluations using NOT (condition).",
      theory: {
        summary:
          "How do we select all rows that do NOT satisfy a given condition?",
        introTable: {
          tableName: "students",
          description: "Students snapshot",
          columns: ["id", "name", "department", "city"],
          rows: [
            [1, "Rahim", "CSE", "Dhaka"],
            [2, "Karim", "EEE", "Gazipur"],
            [3, "Ayesha", "CSE", "Dhaka"],
            [4, "Sumaiya", "BBA", "Chattogram"],
            [5, "Tanvir", "CSE", "Rajshahi"],
          ],
        },
        explanation: [
          "The `NOT` operator inverts the boolean evaluation of a condition.",
          "### 1. The Parenthesized NOT Pattern\nWriting `WHERE NOT (condition)` makes the mental model explicit:\n1. First, SQL evaluates the inner condition: `(city = 'Dhaka')` ---> `TRUE` or `FALSE`.\n2. Second, `NOT` inverts that result: `NOT (TRUE)` becomes `FALSE`, and `NOT (FALSE)` becomes `TRUE`.",
        ],
        targetQuery: {
          sql: "SELECT name, city\nFROM students\nWHERE NOT (city = 'Dhaka');",
          explanation: "Find all students who do NOT live in Dhaka.",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM students (Find all students)",
            sqlSnippet: "FROM students",
            explanation: "SQL visits the students table.",
            tableData: {
              tableName: "students (Source Table)",
              columns: ["name", "city"],
              rows: [
                ["Rahim", "Dhaka"],
                ["Karim", "Gazipur"],
                ["Ayesha", "Dhaka"],
                ["Sumaiya", "Chattogram"],
                ["Tanvir", "Rajshahi"],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: "Step 2: WHERE NOT (city = 'Dhaka') (Invert matches)",
            sqlSnippet: "WHERE NOT (city = 'Dhaka')",
            explanation:
              "1. Rahim: NOT ('Dhaka' = 'Dhaka') ➔ NOT (TRUE) ➔ FALSE ❌\n2. Karim: NOT ('Gazipur' = 'Dhaka') ➔ NOT (FALSE) ➔ TRUE ✅\n3. Ayesha: NOT ('Dhaka' = 'Dhaka') ➔ NOT (TRUE) ➔ FALSE ❌\n4. Sumaiya: NOT ('Chattogram' = 'Dhaka') ➔ NOT (FALSE) ➔ TRUE ✅\n5. Tanvir: NOT ('Rajshahi' = 'Dhaka') ➔ NOT (FALSE) ➔ TRUE ✅",
            tableData: {
              tableName: "Surviving Rows (city NOT Dhaka)",
              columns: ["name", "city"],
              highlightedRows: [0, 1, 2],
              rows: [
                ["Karim", "Gazipur"],
                ["Sumaiya", "Chattogram"],
                ["Tanvir", "Rajshahi"],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "NOT negation syntax",
            sql: "SELECT name, city\nFROM students\nWHERE NOT (city = 'Dhaka');",
            description: "Returns rows where city is not Dhaka.",
          },
        ],
        keyTakeaway:
          "NOT inverts boolean results. Parenthesizing NOT (condition) makes the scope crystal clear.",
        exampleQuery:
          "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');",
        exampleQueryExplanation:
          "Retrieves all students who do not reside in Dhaka.",
        liveDemoSql:
          "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');",
        liveDemoNotes: "Returns Karim, Sumaiya, and Tanvir.",
        mcqs: [
          {
            question: "Recall from Day 2: which operator would you use to find products priced ABOVE 50, including exactly 50.00?",
            options: [
              'A. > (strict - excludes the boundary)',
              'B. >= (inclusive - includes the boundary)',
              'C. != (excludes only 50.00)',
              'D. = (matches only 50.00)',
            ],
            correctIndex: 1,
            explanation: 'Day 2\'s boundary distinction: strict > excludes 50.00, inclusive >= keeps it. NOT inverts the result of the whole condition - knowing which rows survive still starts with the boundary rule.',
          },
          {
            question: "What does `WHERE NOT (price < 50)` evaluate to?",
            options: [
              "A. WHERE price = 50",
              "B. WHERE price > 50",
              "C. WHERE price >= 50",
              "D. WHERE price <= 50",
            ],
            correctIndex: 2,
            explanation:
              "The logical inverse of strictly less than (< 50) is greater than or equal to (>= 50).",
          },
        ],
      },
      masteryPoints: [
        "Use NOT (condition) to invert boolean evaluations",
        "Recognize that NOT (A < B) is equivalent to A >= B",
      ],
      tasks: [
        {
          id: "day03-c1c-t1",
          title: "Task 1: Students not living in Dhaka",
          description:
            "Show name and city of all students who do not live in Dhaka using NOT.",
          instructions: [
            "Select `name` and `city` from `students`.",
            "Filter where `NOT (city = 'Dhaka')`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "students",
          initialSql: "-- Students not in Dhaka\n",
          solutionSql:
            "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');",
          solutionExplanation:
            "Returns Karim (Gazipur), Sumaiya (Chattogram), and Tanvir (Rajshahi).",
          hints: [{ level: 1, text: "Write `WHERE NOT (city = 'Dhaka');`" }],
          validation: {
            targetTable: "students",
            requiredColumns: ["name", "city"],
            requireWhere: true,
            whereContainsTerms: ["NOT", "city", "Dhaka"],
            expectedRowCount: 3,
          },
          successMessage: "Great job! You inverted conditions using NOT.",
        },
        {
          id: "day03-c1c-t2",
          title: "Task 2: Products outside Category 1",
          description:
            "Select name and category_id for all products not in category 1 (Electronics).",
          instructions: [
            "Query the `products` table.",
            "Select `name` and `category_id`.",
            "Filter where `NOT (category_id = 1)`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql: "-- Products outside category 1\n",
          solutionSql:
            "SELECT name, category_id FROM products WHERE NOT (category_id = 1);",
          solutionExplanation:
            "Returns all 22 catalog products in categories other than 1.",
          hints: [{ level: 1, text: "Use `WHERE NOT (category_id = 1);`" }],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "category_id"],
            requireWhere: true,
            whereContainsTerms: ["NOT", "category_id", "1"],
            expectedRowCount: 21,
          },
          successMessage:
            "Well done! You applied boolean negation to category filtering.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1d: Evaluation Order & Parentheses
    // =========================================================================
    {
      id: "where-parentheses-precedence",
      order: 4,
      title: "4. Evaluation Order & Parentheses",
      shortDescription:
        "How to control operator precedence when combining AND and OR.",
      theory: {
        summary:
          "In SQL, AND has higher precedence than OR. Mixing them without parentheses causes subtle bugs.",
        introTable: {
          tableName: "products",
          description: "Products snapshot",
          columns: ["product_id", "name", "category_id", "price"],
          rows: [
            [4, "Mechanical Keyboard", 1, 65.0],
            [6, "Stainless Steel Pan Set", 2, 55.0],
            [7, "Ceramic Mixing Bowls", 2, 22.3],
            [14, "Office Chair", 3, 120.0],
          ],
        },
        explanation: [
          "Just like multiplication comes before addition in math, **`AND` is evaluated before `OR` in SQL**.",
          "### 1. The Precedence Trap\nConsider this query without parentheses:\n`WHERE price > 50 AND category_id = 1 OR category_id = 2`\nBecause `AND` binds first, SQL accidentally includes **every** product in category 2 regardless of its price!",
          "### 2. The Solution: Explicit Parentheses\nWrap your `OR` clauses in parentheses to force SQL to evaluate the union first:\n`WHERE price > 50 AND (category_id = 1 OR category_id = 2)`",
        ],
        targetQuery: {
          sql: "SELECT name, category_id, price\nFROM products\nWHERE price > 50 AND (category_id = 1 OR category_id = 2);",
          explanation:
            "Find products priced over $50 that belong to category 1 or category 2.",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: Without Parentheses (Precedence Bug)",
            sqlSnippet:
              "WHERE price > 50 AND category_id = 1 OR category_id = 2",
            explanation:
              "Binds category 2 without price filter: returns cheap category 2 items by mistake.",
            tableData: {
              tableName: "Buggy Output (Without Parentheses)",
              columns: ["name", "category_id", "price"],
              rows: [
                ["Mechanical Keyboard", 1, 65.0],
                ["Stainless Steel Pan Set", 2, 55.0],
                ["Ceramic Mixing Bowls", 2, 22.3],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: "Step 2: With Parentheses (Correct Logic)",
            sqlSnippet:
              "WHERE price > 50 AND (category_id = 1 OR category_id = 2)",
            explanation:
              "Forces price > 50 across both categories: excludes cheap mixing bowls.",
            tableData: {
              tableName: "Correct Output (With Parentheses)",
              columns: ["name", "category_id", "price"],
              highlightedRows: [0, 1],
              rows: [
                ["Mechanical Keyboard", 1, 65.0],
                ["Stainless Steel Pan Set", 2, 55.0],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "Parenthesized compound condition",
            sql: "SELECT name, category_id, price\nFROM products\nWHERE price > 50 AND (category_id = 1 OR category_id = 2);",
            description:
              "Forces evaluation of the OR group before applying the price filter.",
          },
        ],
        keyTakeaway:
          "Always wrap OR conditions in parentheses when combining them with AND.",
        exampleQuery:
          "SELECT name, category_id, price FROM products WHERE price > 50 AND (category_id = 1 OR category_id = 2);",
        exampleQueryExplanation:
          "Filters for items priced above $50 in categories 1 or 2.",
        liveDemoSql:
          "SELECT name, category_id, price FROM products WHERE price > 50 AND (category_id = 1 OR category_id = 2);",
        liveDemoNotes:
          "Returns Keyboard ($65 in cat 1) and Pan Set ($55 in cat 2).",
        mcqs: [
          {
            question:
              "In the expression `WHERE a AND b OR c`, which part does SQL evaluate first by default?",
            options: [
              "A. b OR c",
              "B. a AND b",
              "C. It evaluates from right to left",
              "D. It randomly chooses",
            ],
            correctIndex: 1,
            explanation:
              "AND has higher operator precedence than OR, so `a AND b` is evaluated first.",
          },
        ],
      },
      masteryPoints: [
        "Remember that AND binds more tightly than OR",
        "Use parentheses to enforce explicit evaluation order",
      ],
      tasks: [
        {
          id: "day03-c1d-t1",
          title: "Task 1: Premium items in Category 1 or 2",
          description:
            "Show name, category_id, and price for products priced over $50.00 that belong to category 1 or category 2.",
          instructions: [
            "Select `name`, `category_id`, and `price` from `products`.",
            "Filter where `price > 50 AND (category_id = 1 OR category_id = 2)`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "products",
          initialSql: "-- Premium items in Category 1 or 2\n",
          solutionSql:
            "SELECT name, category_id, price FROM products WHERE price > 50 AND (category_id = 1 OR category_id = 2);",
          solutionExplanation:
            "Returns Mechanical Keyboard ($65) and Stainless Steel Pan Set ($55).",
          hints: [
            {
              level: 1,
              text: "Wrap `(category_id = 1 OR category_id = 2)` in parentheses.",
            },
          ],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "category_id", "price"],
            requireWhere: true,
            whereContainsTerms: [
              "price",
              ">",
              "50",
              "category_id",
              "1",
              "OR",
              "2",
            ],
            expectedRowCount: 2,
          },
          successMessage:
            "Great job! You enforced operator precedence using parentheses.",
        },
        {
          id: "day03-c1d-t2",
          title: "Task 2: Fix the Precedence Bug",
          description:
            "Fix this buggy query so that it only returns products priced strictly under $20 that belong to category 1 or category 2.",
          instructions: [
            "Query the `products` table.",
            "Select `name`, `category_id`, and `price`.",
            "Add parentheses around the `OR` clause: `WHERE price < 20 AND (category_id = 1 OR category_id = 2)`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql:
            "SELECT name, category_id, price FROM products WHERE price < 20 AND category_id = 1 OR category_id = 2;\n",
          solutionSql:
            "SELECT name, category_id, price FROM products WHERE price < 20 AND (category_id = 1 OR category_id = 2);",
          solutionExplanation:
            "Parentheses restrict the search to products under $20 within categories 1 or 2 (USB-C Cable, Cutting Board Set, Knife Sharpener, Wireless Mouse).",
          hints: [
            {
              level: 1,
              text: "Wrap the OR condition in parentheses: `(category_id = 1 OR category_id = 2)`",
            },
          ],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "category_id", "price"],
            requireWhere: true,
            whereContainsTerms: [
              "price",
              "<",
              "20",
              "category_id",
              "1",
              "OR",
              "2",
            ],
            expectedRowCount: 4,
          },
          successMessage: "Spot on! You fixed the operator precedence bug.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2a: Range Shorthand with BETWEEN
    // =========================================================================
    {
      id: "where-between-range",
      order: 5,
      title: "5. Range Shorthand with BETWEEN",
      shortDescription:
        "How to filter inclusive intervals on numbers and dates.",
      theory: {
        summary:
          "To test if a number falls inside a range, SQL provides the clean BETWEEN operator.",
        introTable: {
          tableName: "products",
          description: "Sample products snapshot",
          columns: ["product_id", "name", "price"],
          rows: [
            [1, "Wireless Mouse", 15.99],
            [2, "Bluetooth Speaker", 45.5],
            [4, "Mechanical Keyboard", 65.0],
            [14, "Office Chair", 120.0],
          ],
        },
        explanation: [
          "`BETWEEN min AND max` is clean shorthand for `col >= min AND col <= max`.",
          "### 1. The Inclusivity Rule\n**BETWEEN is always inclusive.** Both the lower boundary and upper boundary values are included in the result.",
          "An item priced at exactly $25.00 or $100.00 will be included in the output.",
        ],
        targetQuery: {
          sql: "SELECT name, price\nFROM products\nWHERE price BETWEEN 25.00 AND 100.00;",
          explanation:
            "Find all products priced in the $25.00 to $100.00 inclusive range.",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM products (Scan candidates)",
            sqlSnippet: "FROM products",
            explanation: "SQL scans the products table.",
            tableData: {
              tableName: "products (Candidate Rows)",
              columns: ["name", "price"],
              rows: [
                ["Wireless Mouse", 15.99],
                ["Bluetooth Speaker", 45.5],
                ["Mechanical Keyboard", 65.0],
                ["Office Chair", 120.0],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle:
              "Step 2: WHERE price BETWEEN 25.00 AND 100.00 (Inclusive check)",
            sqlSnippet: "WHERE price BETWEEN 25.00 AND 100.00",
            explanation:
              "Wireless Mouse ($15.99): FALSE ❌\nBluetooth Speaker ($45.50): TRUE ✅\nMechanical Keyboard ($65.00): TRUE ✅\nOffice Chair ($120.00): FALSE ❌",
            tableData: {
              tableName: "Final Query Result",
              columns: ["name", "price"],
              highlightedColumns: ["name", "price"],
              highlightedRows: [0, 1],
              rows: [
                ["Bluetooth Speaker", 45.5],
                ["Mechanical Keyboard", 65.0],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "BETWEEN syntax",
            sql: "SELECT name, price\nFROM products\nWHERE price BETWEEN 25.00 AND 100.00;",
            description:
              "Matches values greater than or equal to 25 and less than or equal to 100.",
          },
        ],
        keyTakeaway:
          "BETWEEN min AND max includes both min and max boundary endpoints.",
        exampleQuery:
          "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
        exampleQueryExplanation:
          "Finds products in the $25 to $100 inclusive price bracket.",
        liveDemoSql:
          "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
        liveDemoNotes: "Captures all products in that price band.",
        mcqs: [
          {
            question:
              "What does `WHERE price BETWEEN 10 AND 50` include in standard SQL?",
            options: [
              "A. Numbers strictly between 11 and 49 only",
              "B. Both 10.00 and 50.00 as well as all values in between (inclusive)",
              "C. Only integer numbers",
              "D. Only 10 and 50 exactly",
            ],
            correctIndex: 1,
            explanation:
              "BETWEEN in SQL is inclusive of both boundary endpoints.",
          },
        ],
      },
      masteryPoints: [
        "Use BETWEEN for continuous range filtering",
        "Remember that BETWEEN is inclusive on both ends",
      ],
      tasks: [
        {
          id: "day03-c2a-t1",
          title: "Task 1: Products in Price Band $25 to $100",
          description:
            "Show name and price for products priced between $25.00 and $100.00 inclusive.",
          instructions: [
            "Select `name` and `price` from `products`.",
            "Filter with `WHERE price BETWEEN 25.00 AND 100.00`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "products",
          initialSql: "-- Price between $25 and $100\n",
          solutionSql:
            "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
          solutionExplanation:
            "`BETWEEN 25.00 AND 100.00` captures all mid-tier products (12 items).",
          hints: [
            { level: 1, text: "Use `WHERE price BETWEEN 25.00 AND 100.00;`" },
          ],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "price"],
            requireWhere: true,
            whereContainsTerms: ["BETWEEN", "25", "100"],
            expectedRowCount: 10,
          },
          successMessage: "Great job! You executed an inclusive range query.",
        },
        {
          id: "day03-c2a-t2",
          title: "Task 2: Students aged 20 to 22",
          description:
            "Select name and age of students between 20 and 22 years old inclusive.",
          instructions: [
            "Query the `students` table.",
            "Select `name` and `age`.",
            "Filter where `age BETWEEN 20 AND 22`.",
          ],
          type: "independent",
          primaryTable: "students",
          initialSql: "-- Students aged between 20 and 22\n",
          solutionSql:
            "SELECT name, age FROM students WHERE age BETWEEN 20 AND 22;",
          solutionExplanation:
            "Returns Rahim (21), Karim (22), Ayesha (20), and Tanvir (21).",
          hints: [
            {
              level: 1,
              text: "Write `SELECT name, age FROM students WHERE age BETWEEN 20 AND 22;`",
            },
          ],
          validation: {
            targetTable: "students",
            requiredColumns: ["name", "age"],
            requireWhere: true,
            whereContainsTerms: ["age", "BETWEEN", "20", "22"],
            expectedRowCount: 4,
          },
          successMessage: "Well done! You filtered student ages with BETWEEN.",
        },
        {
          id: "day03-c2a-t3",
          title: "Task 3: Boundary Confirmation ($15.99 to $65.00)",
          description:
            "Select name and price for products priced between $15.99 and $65.00. Verify that items at both $15.99 and $65.00 appear in the result.",
          instructions: [
            "Query the `products` table.",
            "Select `name` and `price`.",
            "Filter where `price BETWEEN 15.99 AND 65.00`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql: "-- Verify boundary inclusion\n",
          solutionSql:
            "SELECT name, price FROM products WHERE price BETWEEN 15.99 AND 65.00;",
          solutionExplanation:
            "Includes boundary items: Wireless Mouse ($15.99) and Mechanical Keyboard ($65.00).",
          hints: [
            {
              level: 1,
              text: "Write `SELECT name, price FROM products WHERE price BETWEEN 15.99 AND 65.00;`",
            },
          ],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "price"],
            requireWhere: true,
            whereContainsTerms: ["price", "BETWEEN", "15.99", "65"],
            expectedRowCount: 17,
          },
          successMessage:
            "Spot on! You verified that both boundary values are returned by BETWEEN.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2b: Set Membership with IN
    // =========================================================================
    {
      id: "where-in-set",
      order: 6,
      title: "6. Set Membership with IN",
      shortDescription:
        "How to check if a value exists within a discrete list.",
      theory: {
        summary:
          "Instead of writing long chains of OR equality checks, SQL gives us the clean IN operator:",
        introTable: {
          tableName: "students",
          description: "Students snapshot across cities",
          columns: ["id", "name", "department", "city"],
          rows: [
            [1, "Rahim", "CSE", "Dhaka"],
            [2, "Karim", "EEE", "Gazipur"],
            [3, "Ayesha", "CSE", "Dhaka"],
            [4, "Sumaiya", "BBA", "Chattogram"],
            [5, "Tanvir", "CSE", "Rajshahi"],
          ],
        },
        explanation: [
          "Instead of writing repetitive OR chains:\n`WHERE city = 'Dhaka' OR city = 'Chattogram' OR city = 'Rajshahi'`\nYou can write the clean, readable equivalent:\n`WHERE city IN ('Dhaka', 'Chattogram', 'Rajshahi')`",
          "### How IN Evaluates\n`IN (val1, val2, ...)` tests whether the column value is a member of the discrete set.",
        ],
        targetQuery: {
          sql: "SELECT name, department, city\nFROM students\nWHERE city IN ('Dhaka', 'Chattogram');",
          explanation:
            "Find students located in any of the listed cities ('Dhaka' or 'Chattogram').",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM students (Find all students)",
            sqlSnippet: "FROM students",
            explanation: "SQL visits the students table.",
            tableData: {
              tableName: "students (Source Table)",
              columns: ["name", "department", "city"],
              rows: [
                ["Rahim", "CSE", "Dhaka"],
                ["Karim", "EEE", "Gazipur"],
                ["Ayesha", "CSE", "Dhaka"],
                ["Sumaiya", "BBA", "Chattogram"],
                ["Tanvir", "CSE", "Rajshahi"],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle:
              "Step 2: WHERE city IN ('Dhaka', 'Chattogram') (Match set list)",
            sqlSnippet: "WHERE city IN ('Dhaka', 'Chattogram')",
            explanation:
              "Matches students located in Dhaka (Rahim, Ayesha) or Chattogram (Sumaiya).",
            tableData: {
              tableName: "Final Query Result",
              columns: ["name", "department", "city"],
              highlightedColumns: ["city"],
              highlightedRows: [0, 1, 2],
              rows: [
                ["Rahim", "CSE", "Dhaka"],
                ["Ayesha", "CSE", "Dhaka"],
                ["Sumaiya", "BBA", "Chattogram"],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "IN syntax",
            sql: "SELECT * FROM customers WHERE city IN ('Dhaka', 'Chittagong');",
            description: "Matches rows where city equals any item in the list.",
          },
        ],
        keyTakeaway:
          "Use IN for discrete candidate lists instead of chained OR statements.",
        exampleQuery:
          "SELECT name, city FROM students WHERE city IN ('Dhaka', 'Chattogram');",
        exampleQueryExplanation:
          "Finds students located in Dhaka or Chattogram.",
        liveDemoSql:
          "SELECT name, city FROM students WHERE city IN ('Dhaka', 'Chattogram');",
        liveDemoNotes: "Returns Rahim, Ayesha, and Sumaiya.",
        mcqs: [
          {
            question:
              "Which query is equivalent to `WHERE id = 1 OR id = 3 OR id = 5`?",
            options: [
              "A. WHERE id BETWEEN 1 AND 5",
              "B. WHERE id IN (1, 3, 5)",
              "C. WHERE id = 1 AND id = 3 AND id = 5",
              "D. WHERE id LIKE 135",
            ],
            correctIndex: 1,
            explanation:
              "`IN (1, 3, 5)` tests if the column value equals any member in the discrete set.",
          },
        ],
      },
      masteryPoints: [
        "Use IN for discrete candidate lists",
        "Recognize IN as a clean replacement for chained OR equality checks",
      ],
      tasks: [
        {
          id: "day03-c2b-t1",
          title: "Task 1: Students in Dhaka or Chattogram",
          description:
            "Show name, department, and city for students in Dhaka or Chattogram using IN.",
          instructions: [
            "Select `name`, `department`, and `city` from `students`.",
            "Filter with `WHERE city IN ('Dhaka', 'Chattogram')`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "students",
          initialSql: "-- Filter with IN\n",
          solutionSql:
            "SELECT name, department, city FROM students WHERE city IN ('Dhaka', 'Chattogram');",
          solutionExplanation: "Returns Rahim, Ayesha, and Sumaiya.",
          hints: [
            {
              level: 1,
              text: "Write `WHERE city IN ('Dhaka', 'Chattogram');`",
            },
          ],
          validation: {
            targetTable: "students",
            requiredColumns: ["name", "department", "city"],
            requireWhere: true,
            whereContainsTerms: ["city", "IN", "Dhaka", "Chattogram"],
            expectedRowCount: 3,
          },
          successMessage: "Great job! You simplified set filtering with IN.",
        },
        {
          id: "day03-c2b-t2",
          title: "Task 2: Products in Category 1 or 2",
          description:
            "Select name, category_id, and price from products belonging to category 1 (Electronics) or category 2 (Kitchen & Dining) using IN.",
          instructions: [
            "Query the `products` table.",
            "Select `name`, `category_id`, and `price`.",
            "Filter where `category_id IN (1, 2)`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql: "-- Products in category 1 or 2\n",
          solutionSql:
            "SELECT name, category_id, price FROM products WHERE category_id IN (1, 2);",
          solutionExplanation: "Retrieves all 12 items in categories 1 and 2.",
          hints: [{ level: 1, text: "Use `WHERE category_id IN (1, 2);`" }],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "category_id", "price"],
            requireWhere: true,
            whereContainsTerms: ["category_id", "IN", "1", "2"],
            expectedRowCount: 12,
          },
          successMessage: "Perfect! You filtered integer categories with IN.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3a: Wildcard Pattern Matching with LIKE (% and _)
    // =========================================================================
    {
      id: "where-like-wildcards",
      order: 7,
      title: "7. Wildcard Pattern Matching with LIKE (% and _)",
      shortDescription:
        "How to search text using multi-character (%) and single-character (_) wildcards.",
      theory: {
        summary:
          "In real datasets, text searches are often partial: searching by domain, prefix, or character position.",
        introTable: {
          tableName: "products",
          description: "Sample products snapshot",
          columns: ["product_id", "name", "price"],
          rows: [
            [1, "Wireless Mouse", 15.99],
            [3, "USB-C Charging Cable", 9.99],
            [4, "Mechanical Keyboard", 65.0],
            [25, "Wireless Doorbell", 38.0],
            [26, "Wireless Earbuds", 32.0],
          ],
        },
        explanation: [
          "The `LIKE` operator matches text against a pattern containing special wildcard characters.",
          "### 1. The Two Wildcards\n• **`%` (Percent sign)**: Matches **zero, one, or many** characters of any length.\n• **`_` (Underscore)**: Matches **exactly one character** at that specific index position.",
          "### 2. Positional Matching Breakdown\nWhen searching with `_` and `%` together:\n`Pattern: _SB%`\n• `_` matches the 1st character (`U`).\n• `S` must be the 2nd character.\n• `B` must be the 3rd character.\n• `%` matches any remaining characters.",
        ],
        targetQuery: {
          sql: "SELECT name, price\nFROM products\nWHERE name LIKE 'Wireless%';",
          explanation:
            "Find all products starting with the word 'Wireless' followed by any text.",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM products (Scan candidates)",
            sqlSnippet: "FROM products",
            explanation: "SQL scans the products table.",
            tableData: {
              tableName: "products (Sample Items)",
              columns: ["name", "price"],
              rows: [
                ["Wireless Mouse", 15.99],
                ["USB-C Charging Cable", 9.99],
                ["Mechanical Keyboard", 65.0],
                ["Wireless Doorbell", 38.0],
                ["Wireless Earbuds", 32.0],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: "Step 2: WHERE name LIKE 'Wireless%' (Match prefix)",
            sqlSnippet: "WHERE name LIKE 'Wireless%'",
            explanation:
              "Matches products beginning with 'Wireless' followed by any text.",
            tableData: {
              tableName: "Final Query Result",
              columns: ["name", "price"],
              highlightedColumns: ["name"],
              highlightedRows: [0, 1, 2],
              rows: [
                ["Wireless Mouse", 15.99],
                ["Wireless Doorbell", 38.0],
                ["Wireless Earbuds", 32.0],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "LIKE wildcard search syntax",
            sql: "SELECT name FROM customers WHERE email LIKE '%@example.com';\nSELECT name FROM products WHERE name LIKE '_SB%';",
            description:
              "% matches any sequence; _ matches exactly one character.",
          },
        ],
        keyTakeaway:
          "% matches any length of characters; _ matches exactly one character at that position.",
        exampleQuery:
          "SELECT name, price FROM products WHERE name LIKE 'Wireless%';",
        exampleQueryExplanation:
          "Finds all products starting with the word Wireless.",
        liveDemoSql:
          "SELECT name, price FROM products WHERE name LIKE 'Wireless%';",
        liveDemoNotes:
          "Returns Wireless Mouse, Wireless Doorbell, and Wireless Earbuds.",
        mcqs: [
          {
            question:
              "Which query matches any product starting with the word 'Wireless'?",
            options: [
              "A. WHERE name LIKE '%Wireless'",
              "B. WHERE name LIKE 'Wireless%'",
              "C. WHERE name = 'Wireless*'",
              "D. WHERE name IN ('Wireless')",
            ],
            correctIndex: 1,
            explanation:
              "'Wireless%' matches strings beginning with Wireless followed by any characters.",
          },
        ],
      },
      masteryPoints: [
        "Use % to match any number of characters",
        "Use _ to match exactly one single character position",
      ],
      tasks: [
        {
          id: "day03-c3a-t1",
          title: "Task 1: Search emails ending with @example.com (%)",
          description:
            'Show name and email of all customers whose email address ends with "@example.com".',
          instructions: [
            "Select `name` and `email` from `customers`.",
            "Filter with `WHERE email LIKE '%@example.com'`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "customers",
          initialSql: "-- Search emails with %\n",
          solutionSql:
            "SELECT name, email FROM customers WHERE email LIKE '%@example.com';",
          solutionExplanation:
            "Retrieves all 11 customers with standard @example.com email domains.",
          hints: [
            { level: 1, text: "Write `WHERE email LIKE '%@example.com';`" },
          ],
          validation: {
            targetTable: "customers",
            requiredColumns: ["name", "email"],
            requireWhere: true,
            whereContainsTerms: ["email", "LIKE", "%@example.com"],
            expectedRowCount: 13,
          },
          successMessage:
            "Great job! You executed a wildcard domain search with %.",
        },
        {
          id: "day03-c3a-t2",
          title: "Task 2: Single-Character Positional Match (_)",
          description:
            'Find products where the second and third characters are "SB" using the single-character wildcard (_).',
          instructions: [
            "Query the `products` table.",
            "Select `name` and `price`.",
            "Filter where `name LIKE '_SB%'`.",
          ],
          type: "independent",
          primaryTable: "products",
          initialSql: "-- Positional match with _\n",
          solutionSql:
            "SELECT name, price FROM products WHERE name LIKE '_SB%';",
          solutionExplanation:
            "Matches 'USB-C Charging Cable' (U is position 1, S is position 2, B is position 3).",
          hints: [{ level: 1, text: "Use `WHERE name LIKE '_SB%';`" }],
          validation: {
            targetTable: "products",
            requiredColumns: ["name", "price"],
            requireWhere: true,
            whereContainsTerms: ["name", "LIKE", "_SB%"],
            expectedRowCount: 1,
          },
          successMessage:
            "Spot on! You matched character positions using the underscore wildcard.",
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3b: NULL Safety (IS NULL and IS NOT NULL)
    // =========================================================================
    {
      id: "where-null-safety",
      order: 8,
      title: "8. NULL Safety (IS NULL and IS NOT NULL)",
      shortDescription:
        "How to safely handle missing data and avoid three-valued logic traps.",
      theory: {
        summary:
          "In SQL databases, missing or unrecorded data is represented as NULL. Testing NULL requires special syntax.",
        introTable: {
          tableName: "customers",
          description: "Customer profiles with optional email addresses",
          columns: ["customer_id", "name", "email", "city"],
          rows: [
            [1, "Rafiul Islam", "rafiul@example.com", "Dhaka"],
            [3, "Tanvir Ahmed", null, "Chittagong"],
            [4, "Nusrat Jahan", "nusrat.j@example.com", "Chittagong"],
            [7, "Shakil Ahmed", null, "Khulna"],
          ],
        },
        explanation: [
          "`NULL` represents unknown or missing data. It is **not** an empty string `''` and **not** zero `0`.",
          "### 1. Three-Valued Logic: Why = NULL Always Fails Silently\nIn SQL, any direct comparison with NULL using `=` or `!=` evaluates to **UNKNOWN**, not `TRUE` or `FALSE`.\n\nBecause `WHERE` only retains rows where the condition evaluates to `TRUE`, writing `WHERE email = NULL` filters out **all** rows—returning 0 results even when NULLs exist!",
          "### 2. The Safe Syntax: IS NULL and IS NOT NULL\nAlways use `IS NULL` to find missing values, and `IS NOT NULL` to find present values.",
        ],
        targetQuery: {
          sql: "SELECT name, city\nFROM customers\nWHERE email IS NULL;",
          explanation:
            "Find all customer accounts that have a missing (NULL) email address.",
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: "Step 1: FROM customers (Find candidate accounts)",
            sqlSnippet: "FROM customers",
            explanation: "SQL visits the customers table.",
            tableData: {
              tableName: "customers (Sample Accounts)",
              columns: ["name", "email", "city"],
              rows: [
                ["Rafiul Islam", "rafiul@example.com", "Dhaka"],
                ["Tanvir Ahmed", null, "Chittagong"],
                ["Nusrat Jahan", "nusrat.j@example.com", "Chittagong"],
                ["Shakil Ahmed", null, "Khulna"],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: "Step 2: WHERE email IS NULL (Isolate missing data)",
            sqlSnippet: "WHERE email IS NULL",
            explanation:
              "SQL identifies records where the email column holds NULL.",
            tableData: {
              tableName: "Final Query Result (Missing Email)",
              columns: ["name", "city"],
              highlightedColumns: ["name", "city"],
              highlightedRows: [0, 1],
              rows: [
                ["Tanvir Ahmed", "Chittagong"],
                ["Shakil Ahmed", "Khulna"],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: "Safe NULL checks",
            sql: "SELECT name FROM customers WHERE email IS NULL;\nSELECT name FROM customers WHERE email IS NOT NULL;",
            description:
              "Always use IS NULL and IS NOT NULL. Never use = NULL.",
          },
        ],
        keyTakeaway:
          "Comparing with = NULL produces UNKNOWN. Always use IS NULL and IS NOT NULL.",
        exampleQuery: "SELECT name, city FROM customers WHERE email IS NULL;",
        exampleQueryExplanation:
          "Finds customer accounts missing an email address.",
        liveDemoSql: "SELECT name, city FROM customers WHERE email IS NULL;",
        liveDemoNotes: "Returns Tanvir Ahmed and Shakil Ahmed.",
        mcqs: [
          {
            question:
              "Why does `SELECT * FROM customers WHERE email = NULL;` fail to return rows with missing emails?",
            options: [
              "A. Because SQL syntax requires quotes around NULL",
              "B. Because email = NULL evaluates to UNKNOWN, and WHERE only retains rows where the condition is TRUE",
              "C. Because the table must be sorted first",
              "D. Because NULL can only be checked on numeric columns",
            ],
            correctIndex: 1,
            explanation:
              "In SQL three-valued logic, `= NULL` evaluates to UNKNOWN. WHERE only keeps TRUE rows.",
          },
        ],
      },
      masteryPoints: [
        "Understand that NULL compared with = evaluates to UNKNOWN",
        "Use IS NULL to detect missing values",
        "Use IS NOT NULL to detect existing values",
      ],
      tasks: [
        {
          id: "day03-c3b-t1",
          title: "Task 1: Customers Without Email (IS NULL)",
          description:
            "Show name and city for customers who do not have an email address recorded.",
          instructions: [
            "Select `name` and `city` from `customers`.",
            "Filter where `email IS NULL`.",
            "End with a semicolon (;).",
          ],
          type: "guided",
          primaryTable: "customers",
          initialSql: "-- Find customers with missing emails\n",
          solutionSql: "SELECT name, city FROM customers WHERE email IS NULL;",
          solutionExplanation:
            "`WHERE email IS NULL` identifies Tanvir Ahmed and Shakil Ahmed (2 records).",
          hints: [{ level: 1, text: "Use `WHERE email IS NULL;`" }],
          validation: {
            targetTable: "customers",
            requiredColumns: ["name", "city"],
            requireWhere: true,
            whereContainsTerms: ["email", "IS", "NULL"],
            expectedRowCount: 2,
          },
          successMessage:
            "Great job! You detected missing records safely using IS NULL.",
        },
        {
          id: "day03-c3b-t2",
          title: "Task 2: Suppliers with Valid Contact Email (IS NOT NULL)",
          description:
            "Find all suppliers that have a recorded contact email address.",
          instructions: [
            "Query the `suppliers` table.",
            "Select `name` and `contact_email`.",
            "Filter where `contact_email IS NOT NULL`.",
          ],
          type: "independent",
          primaryTable: "suppliers",
          initialSql: "-- Suppliers with valid email\n",
          solutionSql:
            "SELECT name, contact_email FROM suppliers WHERE contact_email IS NOT NULL;",
          solutionExplanation:
            "Retrieves all 6 active suppliers with recorded emails.",
          hints: [{ level: 1, text: "Use `WHERE contact_email IS NOT NULL;`" }],
          validation: {
            targetTable: "suppliers",
            requiredColumns: ["name", "contact_email"],
            requireWhere: true,
            whereContainsTerms: ["contact_email", "IS", "NOT", "NULL"],
            expectedRowCount: 6,
          },
          successMessage:
            "Well done! You filtered non-null values with IS NOT NULL.",
        },
        {
          id: "day03-c3b-t3",
          title: "Task 3: Fix the = NULL Bug",
          description:
            "A junior developer wrote `SELECT name, city FROM customers WHERE email = NULL;` and got 0 rows. Fix the query so it properly returns customers with missing emails.",
          instructions: [
            "Query the `customers` table.",
            "Select `name` and `city`.",
            "Rewrite the filter to use `IS NULL` instead of `= NULL`.",
          ],
          type: "independent",
          primaryTable: "customers",
          initialSql: "SELECT name, city FROM customers WHERE email = NULL;\n",
          solutionSql: "SELECT name, city FROM customers WHERE email IS NULL;",
          solutionExplanation:
            "Replacing `= NULL` with `IS NULL` correctly returns Tanvir Ahmed and Shakil Ahmed.",
          hints: [{ level: 1, text: "Replace `= NULL` with `IS NULL`." }],
          validation: {
            targetTable: "customers",
            requiredColumns: ["name", "city"],
            requireWhere: true,
            whereContainsTerms: ["email", "IS", "NULL"],
            expectedRowCount: 2,
          },
          successMessage:
            "Spot on! You fixed the classic three-valued logic = NULL gotcha.",
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 3 HOMEWORK / INDEPENDENT CHALLENGES
  // ===========================================================================
  challenge: {
    id: "day-03-homework",
    title: "Day 3 — Specialized Filtering (Homework)",
    scenario:
      "Apply specialized filtering techniques across our production inventory and customer tables:",
    tasks: [
      {
        id: "day03-hw-1",
        title: "Task 1: Mid-tier products ($25 to $100)",
        description:
          "Find products priced between $25.00 and $100.00 using BETWEEN.",
        instructions: [
          "Select `name` and `price` from `products`.",
          "Filter where `price BETWEEN 25.00 AND 100.00`.",
          "End with a semicolon (;).",
        ],
        type: "challenge",
        primaryTable: "products",
        initialSql:
          "-- Task 1: Products priced between $25 and $100 (BETWEEN)\n",
        solutionSql:
          "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
        solutionExplanation:
          "Retrieves all products in the $25 to $100 price range.",
        hints: [
          { level: 1, text: "Use `WHERE price BETWEEN 25.00 AND 100.00;`" },
        ],
        validation: {
          targetTable: "products",
          requiredColumns: ["name", "price"],
          requireWhere: true,
          whereContainsTerms: ["BETWEEN", "25", "100"],
          expectedRowCount: 10,
        },
        successMessage:
          "Task 1 completed! Mid-tier catalog products retrieved.",
      },
      {
        id: "day03-hw-2",
        title: "Task 2: Customers in Regional Hubs (IN)",
        description:
          "Find customers located in Dhaka, Chittagong, or Sylhet using IN.",
        instructions: [
          "Select `name`, `email`, and `city` from `customers`.",
          "Filter where `city IN ('Dhaka', 'Chittagong', 'Sylhet')`.",
          "End with a semicolon (;).",
        ],
        type: "challenge",
        primaryTable: "customers",
        initialSql:
          "-- Task 2: Customers in Dhaka, Chittagong, or Sylhet (IN)\n",
        solutionSql:
          "SELECT name, email, city FROM customers WHERE city IN ('Dhaka', 'Chittagong', 'Sylhet');",
        solutionExplanation:
          "Returns customers in Dhaka, Chittagong, and Sylhet.",
        hints: [
          {
            level: 1,
            text: "Write `WHERE city IN ('Dhaka', 'Chittagong', 'Sylhet');`",
          },
        ],
        validation: {
          targetTable: "customers",
          requiredColumns: ["name", "email", "city"],
          requireWhere: true,
          whereContainsTerms: ["city", "IN", "Dhaka", "Chittagong", "Sylhet"],
          expectedRowCount: 11,
        },
        successMessage:
          "Task 2 completed! Multi-city customer audience selected.",
      },
      {
        id: "day03-hw-3",
        title: "Task 3: Wireless Products Search (LIKE)",
        description:
          'Find all products whose name starts with "Wireless" using the LIKE operator.',
        instructions: [
          "Select `name`, `price`, and `quantity_in_stock` from `products`.",
          "Filter where `name LIKE 'Wireless%'`.",
          "End with a semicolon (;).",
        ],
        type: "challenge",
        primaryTable: "products",
        initialSql: "-- Task 3: Products starting with Wireless (LIKE)\n",
        solutionSql:
          "SELECT name, price, quantity_in_stock FROM products WHERE name LIKE 'Wireless%';",
        solutionExplanation:
          "Matches Wireless Mouse, Wireless Doorbell, and Wireless Earbuds.",
        hints: [{ level: 1, text: "Use `WHERE name LIKE 'Wireless%';`" }],
        validation: {
          targetTable: "products",
          requiredColumns: ["name", "price", "quantity_in_stock"],
          requireWhere: true,
          whereContainsTerms: ["LIKE", "Wireless%"],
          expectedRowCount: 3,
        },
        successMessage: "Task 3 completed! Wireless product family retrieved.",
      },
      {
        id: "day03-hw-4",
        title: "Task 4: Customers with Missing Emails (IS NULL)",
        description:
          "Find customers that do not have an email address recorded.",
        instructions: [
          "Select `name`, `city` from `customers`.",
          "Filter where `email IS NULL`.",
          "End with a semicolon (;).",
        ],
        type: "challenge",
        primaryTable: "customers",
        initialSql: "-- Task 4: Customers missing email (IS NULL)\n",
        solutionSql: "SELECT name, city FROM customers WHERE email IS NULL;",
        solutionExplanation:
          "Identifies customers without recorded email (Tanvir Ahmed, Shakil Ahmed).",
        hints: [{ level: 1, text: "Use `WHERE email IS NULL;`" }],
        validation: {
          targetTable: "customers",
          requiredColumns: ["name", "city"],
          requireWhere: true,
          whereContainsTerms: ["email", "IS", "NULL"],
          expectedRowCount: 2,
        },
        successMessage:
          "Task 4 completed! Customer missing contact details flagged.",
      },
      {
        id: "day03-hw-5",
        title: "Task 5: Compound Filter with Parentheses",
        description:
          "Find products in categories 1 or 5 priced under $50 that are currently in stock (quantity_in_stock > 0).",
        instructions: [
          "Select `name`, `category_id`, `price`, and `quantity_in_stock` from `products`.",
          "Filter where `(category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0`.",
          "End with a semicolon (;).",
        ],
        type: "challenge",
        primaryTable: "products",
        initialSql: "-- Task 5: In-stock Electronics or Home under $50\n",
        solutionSql:
          "SELECT name, category_id, price, quantity_in_stock FROM products WHERE (category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0;",
        solutionExplanation:
          "Returns all in-stock products in categories 1 and 5 priced under $50.",
        hints: [
          {
            level: 1,
            text: "Wrap categories in parentheses: `(category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0;`",
          },
        ],
        validation: {
          targetTable: "products",
          requiredColumns: [
            "name",
            "category_id",
            "price",
            "quantity_in_stock",
          ],
          requireWhere: true,
          whereContainsTerms: [
            "category_id",
            "1",
            "OR",
            "5",
            "AND",
            "price",
            "50",
            "quantity_in_stock",
          ],
          expectedRowCount: 10,
        },
        successMessage:
          "Task 5 completed! You mastered multi-clause compound query filters.",
      },
    ],
  },
};
