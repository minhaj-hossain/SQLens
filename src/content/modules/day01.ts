import { ModuleData } from '../../types/curriculum';

export const DAY_01_MODULE: ModuleData = {
  id: 'day-01',
  slug: 'retrieving-data',
  day: 1,
  title: 'Day 1 — SELECT queries 101',
  shortTitle: 'SELECT queries 101',
  type: 'module',
  milestoneId: 'milestone-1',
  description: 'Master the fundamentals of SQL queries: SELECT, FROM, selecting multiple columns, SELECT *, and column aliasing with AS using intuitive mental models.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Understand how FROM identifies the source table and SELECT picks the columns',
    'Select single and multiple specific columns from tables',
    'Retrieve all columns at once using the asterisk (*) wildcard',
    'Rename output columns cleanly in result sets using the AS keyword',
    'Understand that SELECT controls columns, while WHERE controls rows',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: SELECT and FROM
    // =========================================================================
    {
      id: 'select-and-from',
      order: 1,
      title: 'SELECT and FROM',
      shortDescription: 'The foundational building blocks of every SQL query.',
      theory: {
        summary: 'Imagine we have a database containing a table called:',
        introTable: {
          tableName: 'students',
          description: 'This table is already stored in the database.',
          columns: ['id', 'name', 'age', 'department', 'city'],
          rows: [
            [1, 'Rahim', 21, 'CSE', 'Dhaka'],
            [2, 'Karim', 22, 'EEE', 'Gazipur'],
            [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
            [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
            [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
          ],
        },
        explanation: [
          'This table is already stored in the database.',
          '### 1. The Basic Idea',
          'When you write:\n\n```sql\nSELECT ...\nFROM ...\n```\n\nYou are basically answering two questions:',
          'QUESTION_BLOCK::FROM::Where should I get the data from?',
          'QUESTION_BLOCK::SELECT::What data do I want from there?',
          'For example:\n\n```sql\nSELECT name\nFROM students;\n```\n\nLet\'s break it down.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students',
            sqlSnippet: 'FROM students',
            explanation: 'SQL first looks at this: "Go to the students table." So SQL sees the full table with all rows and columns.',
            tableData: {
              tableName: 'students',
              columns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [2, 'Karim', 22, 'EEE', 'Gazipur'],
                [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
                [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
                [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT name',
            sqlSnippet: 'SELECT name',
            explanation: 'Then SQL says: "From this table, only give me the name column."',
            tableData: {
              tableName: 'Result',
              columns: ['name'],
              highlightedColumns: ['name'],
              rows: [
                ['Rahim'],
                ['Karim'],
                ['Ayesha'],
                ['Sumaiya'],
                ['Tanvir'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Meaning of the query',
            sql: 'SELECT name\nFROM students;',
            description: 'Means: From the students table, retrieve the name column.',
          },
        ],
        keyTakeaway: 'FROM identifies the data source, and SELECT chooses which column to extract. Every row in that column is returned.',
        exampleQuery: 'SELECT name FROM students;',
        exampleQueryExplanation: 'From the students table, retrieve only the name column.',
        liveDemoSql: 'SELECT name FROM students;',
        liveDemoNotes: 'Executes `SELECT name FROM students;` and retrieves only the name column for all 5 students.',
        mcqs: [
          {
            question: 'What does this query do?\nSELECT age\nFROM students;',
            options: [
              'A. Selects students whose age is something',
              'B. Shows the age column from the students table',
              'C. Deletes the age column',
              'D. Shows all student information',
            ],
            correctIndex: 1,
            explanation: '`SELECT age FROM students;` retrieves the age column from the students table.',
          },
        ],
      },
      masteryPoints: [
        'Understand that FROM designates the source table',
        'Understand that SELECT specifies the desired column',
        'Know how to end queries with a semicolon (;)',
      ],
      tasks: [
        {
          id: 'day01-c1-t1',
          title: 'Task 1: Show only name',
          description: 'Show only the name column from the students table.',
          instructions: [
            'Write a query to retrieve only the `name` column from `students`.',
            'End your query with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name FROM students;',
          solutionExplanation: '`SELECT name FROM students;` retrieves the name column for every row.',
          hints: [
            { level: 1, text: 'Use `SELECT name FROM students;`' },
            { level: 2, text: 'Write `SELECT name FROM students;` and click Submit.' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name'],
            forbiddenColumns: ['id', 'age', 'department', 'city'],
            expectedRowCount: 5,
          },
          successMessage: 'Great job! You retrieved only the student names.',
        },
        {
          id: 'day01-c1-t2',
          title: 'Task 2: Show only city',
          description: 'Show only the city column from the students table.',
          instructions: [
            'Write a query to retrieve only the `city` column from `students`.',
            'End with a semicolon (;).',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Show only city from students\n',
          solutionSql: 'SELECT city FROM students;',
          solutionExplanation: '`SELECT city FROM students;` extracts the city column.',
          hints: [
            { level: 1, text: 'Start with `SELECT city FROM students;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['city'],
            forbiddenColumns: ['id', 'name', 'age', 'department'],
            expectedRowCount: 5,
          },
          successMessage: 'Well done! You extracted the city column from the students table.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Selecting Multiple Columns
    // =========================================================================
    {
      id: 'selecting-multiple-columns',
      order: 2,
      title: '2. Selecting Multiple Columns',
      shortDescription: 'How to retrieve two or more columns simultaneously.',
      theory: {
        summary: 'What if you want both name and age?',
        introTable: {
          tableName: 'students',
          description: 'Original table (5 columns: id | name | age | department | city)',
          columns: ['id', 'name', 'age', 'department', 'city'],
          rows: [
            [1, 'Rahim', 21, 'CSE', 'Dhaka'],
            [2, 'Karim', 22, 'EEE', 'Gazipur'],
            [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
            [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
            [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
          ],
        },
        explanation: [
          'To retrieve more than one column from a table, separate the column names with a comma in your `SELECT` statement:',
          '```sql\nSELECT name, age\nFROM students;\n```',
          '### Query Execution Order:\n1. **FROM students** — Identifies the source table (`students`).\n2. **SELECT name, age** — Projects only the specified `name` and `age` columns.',
          '### Notice something important:\n• **Original table (5 columns):** `id`, `name`, `age`, `department`, `city`\n• **Query result (2 columns):** `name`, `age`\n\n**SELECT decides which columns appear in the result.** The table in the database remains unchanged, but your output only contains the columns you requested.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Result of SELECT name, age FROM students;',
            sqlSnippet: 'SELECT name, age FROM students;',
            explanation: 'Result containing only the 2 requested columns:',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'age'],
              highlightedColumns: ['name', 'age'],
              rows: [
                ['Rahim', 21],
                ['Karim', 22],
                ['Ayesha', 20],
                ['Sumaiya', 23],
                ['Tanvir', 21],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Selecting multiple columns',
            sql: 'SELECT name, age\nFROM students;',
            description: 'Returns only the `name` and `age` columns for each student.',
          },
        ],
        keyTakeaway: 'Separate column names with commas in the SELECT list. The order in SELECT dictates the order in the output.',
        exampleQuery: 'SELECT name, age FROM students;',
        exampleQueryExplanation: 'Retrieves `name` and `age` columns from `students`.',
        liveDemoSql: 'SELECT name, age FROM students;',
        liveDemoNotes: 'Notice that only the 2 requested columns appear in the output table.',
        mcqs: [
          {
            question: 'What will be returned by:\nSELECT name, city\nFROM students;',
            options: [
              'A. Only names and cities',
              'B. Only students from a city',
              'C. All columns',
              'D. Names of cities',
            ],
            correctIndex: 0,
            explanation: '`SELECT name, city` asks the database for only the name and city columns.',
          },
        ],
      },
      masteryPoints: [
        'List multiple columns separated by commas in the SELECT clause',
        'Understand that SELECT controls which columns are projected',
        'Avoid trailing commas before FROM',
      ],
      tasks: [
        {
          id: 'day01-c2-t1',
          title: 'Task 1: Show name and department',
          description: 'Show name and department from the students table.',
          instructions: [
            'Select `name` and `department` from `students`.',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, department FROM students;',
          solutionExplanation: '`SELECT name, department FROM students;` extracts both columns.',
          hints: [
            { level: 1, text: 'Add `department` after `name,` in the SELECT clause.' },
            { level: 2, text: 'Write `SELECT name, department FROM students;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'department'],
            forbiddenColumns: ['id', 'age', 'city'],
            expectedRowCount: 5,
          },
          successMessage: 'Great job! You retrieved name and department.',
        },
        {
          id: 'day01-c2-t2',
          title: 'Task 2: Show id, name, and city',
          description: 'Show id, name, and city from the students table.',
          instructions: [
            'Select `id`, `name`, and `city` from `students`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Show id, name, and city from students\n',
          solutionSql: 'SELECT id, name, city FROM students;',
          solutionExplanation: '`SELECT id, name, city FROM students;` projects the three requested columns.',
          hints: [
            { level: 1, text: 'List the 3 columns: `id, name, city`.' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['id', 'name', 'city'],
            forbiddenColumns: ['age', 'department'],
            expectedRowCount: 5,
          },
          successMessage: 'Perfect! You projected id, name, and city from the table.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3: SELECT *
    // =========================================================================
    {
      id: 'select-all',
      order: 3,
      title: '3. SELECT *',
      shortDescription: 'The asterisk (*) shorthand to retrieve all columns at once.',
      theory: {
        summary: 'The * means: Select all columns.',
        introTable: {
          tableName: 'students',
          description: 'Full table in database (5 columns)',
          columns: ['id', 'name', 'age', 'department', 'city'],
          rows: [
            [1, 'Rahim', 21, 'CSE', 'Dhaka'],
            [2, 'Karim', 22, 'EEE', 'Gazipur'],
            [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
            [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
            [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
          ],
        },
        explanation: [
          'The `*` (asterisk) means: **Select all columns**.',
          '```sql\nSELECT *\nFROM students;\n```',
          '### Think of it like this:\n\n```text\nstudents table\n       │\n       ▼\nSELECT *\n       │\n       ▼\nALL COLUMNS\n```',
          'While:\n\n```sql\nSELECT name, city\nFROM students;\n```\n\nmeans:\n\n```text\nstudents table\n       │\n       ▼\nSELECT name, city\n       │\n       ▼\nONLY THESE COLUMNS\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Comparison: SELECT name, city vs SELECT *',
            sqlSnippet: 'SELECT name, city FROM students;',
            explanation: 'Selective projection returns only name and city:',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'city'],
              highlightedColumns: ['name', 'city'],
              rows: [
                ['Rahim', 'Dhaka'],
                ['Karim', 'Gazipur'],
                ['Ayesha', 'Dhaka'],
                ['Sumaiya', 'Chattogram'],
                ['Tanvir', 'Rajshahi'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Select all columns shorthand',
            sql: 'SELECT *\nFROM students;',
            description: 'Returns all columns and all rows from the table.',
          },
        ],
        keyTakeaway: '* is a shorthand for all columns. Use it to inspect tables quickly.',
        exampleQuery: 'SELECT * FROM students;',
        exampleQueryExplanation: 'Returns every column and every row stored in students.',
        liveDemoSql: 'SELECT * FROM students;',
        liveDemoNotes: 'Dumps the complete table structure and data.',
        mcqs: [
          {
            question: 'What does * mean here?\nSELECT *\nFROM students;',
            options: [
              'A. Multiply everything',
              'B. Select all rows only',
              'C. Select all columns',
              'D. Select the first column',
            ],
            correctIndex: 2,
            explanation: 'The asterisk (*) represents the wildcard for ALL columns.',
          },
        ],
      },
      masteryPoints: [
        'Use * to quickly inspect any table',
        'Understand the difference between SELECT * and selective projection',
      ],
      tasks: [
        {
          id: 'day01-c3-t1',
          title: 'Task 1: Show everything from the table',
          description: 'Show everything from the students table.',
          instructions: [
            'Write a query to retrieve all columns and all rows from `students`.',
            'Use the `*` wildcard.',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT * FROM students;',
          solutionExplanation: '`SELECT * FROM students;` dumps all columns.',
          hints: [
            { level: 1, text: 'Use `*` after `SELECT`.' },
            { level: 2, text: '`SELECT * FROM students;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['id', 'name', 'age', 'department', 'city'],
            expectedRowCount: 5,
          },
          successMessage: 'Great job! You retrieved all columns from students.',
        },
        {
          id: 'day01-c3-t2',
          title: 'Task 2: Show name, age, and city',
          description: 'Show name, age, and city from the students table.',
          instructions: [
            'Select `name`, `age`, and `city` from `students`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Show name, age, and city\n',
          solutionSql: 'SELECT name, age, city FROM students;',
          solutionExplanation: 'Projects `name, age, city` specifically.',
          hints: [
            { level: 1, text: 'Write `SELECT name, age, city FROM students;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'age', 'city'],
            forbiddenColumns: ['id', 'department'],
            expectedRowCount: 5,
          },
          successMessage: 'Awesome! You mastered column selection.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 4: AS: Renaming Columns in the Output
    // =========================================================================
    {
      id: 'column-aliasing',
      order: 4,
      title: 'AS: Renaming Columns in the Output',
      shortDescription: 'Change how column names appear in the result without modifying the database.',
      theory: {
        summary: 'We still have our students table:',
        introTable: {
          tableName: 'students',
          columns: ['id', 'name', 'age', 'department', 'city'],
          rows: [
            [1, 'Rahim', 21, 'CSE', 'Dhaka'],
            [2, 'Karim', 22, 'EEE', 'Gazipur'],
            [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
            [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
            [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
          ],
        },
        explanation: [
          '### 1. What problem does AS solve?',
          'Suppose you write:\n\n```sql\nSELECT name, age\nFROM students;\n```\n\nOutput columns: `name` | `age`\n\nBut maybe you want the output to look more readable:\n`Student Name` | `Student Age`\n\nThe actual column names in the database are still `name` and `age`. We are not changing the table. We are only changing how the column names appear in the result. That\'s where **AS** comes in.',
          '### 2. Basic Syntax\n\n```sql\nSELECT column_name AS new_name\nFROM table_name;\n```\n\nExample:\n\n```sql\nSELECT name AS student_name\nFROM students;\n```',
          'Let\'s visualize what happens:\n\n```text\nstudents table\n      │\n      ▼\nSELECT name\n      │\n      ▼\nRename output column\n      │\n      ▼\nstudent_name\n```\n\nNotice:\n• Database column: `name`\n• Output column: `student_name`\n\nThe real database column is still called `name`.',
          '### 3. Multiple Aliases\n\nYou can rename multiple columns:\n\n```sql\nSELECT\n    name AS student_name,\n    age AS student_age,\n    city AS student_city\nFROM students;\n```\n\nThink of AS like this:\n\n```text\nREAL COLUMN        OUTPUT NAME\nname       ───────► student_name\nage        ───────► student_age\ncity       ───────► student_city\n```',
          '### 4. Aliases with Spaces\n\nSuppose you want `Student Name` instead of `student_name`. You can write:\n\n```sql\nSELECT name AS "Student Name"\nFROM students;\n```\n\nBecause `"Student Name"` contains a space.',
          '### Important Concept\n\nAt this stage, we are not removing rows.\n\nFor example:\n\n```sql\nSELECT name\nFROM students;\n```\n\nWe still have all 5 students. We only removed unnecessary columns from the output.\n\n• Original: 5 rows × 5 columns\n• Result: 5 rows × 1 column\n\nSo remember: **SELECT controls columns. Later, WHERE will control rows.**',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits the students table with all 5 records.',
            tableData: {
              tableName: 'students',
              columns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [2, 'Karim', 22, 'EEE', 'Gazipur'],
                [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
                [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
                [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT name AS student_name, age AS student_age',
            sqlSnippet: 'SELECT name AS student_name, age AS student_age',
            explanation: 'Extracts the columns and assigns the presentation aliases.',
            tableData: {
              tableName: 'Result',
              columns: ['student_name', 'student_age'],
              highlightedColumns: ['student_name', 'student_age'],
              rows: [
                ['Rahim', 21],
                ['Karim', 22],
                ['Ayesha', 20],
                ['Sumaiya', 23],
                ['Tanvir', 21],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Column Aliasing Syntax',
            sql: 'SELECT name AS student_name, age AS student_age\nFROM students;',
            description: 'Gives custom display labels to output columns while leaving the underlying table unchanged.',
          },
          {
            title: 'Aliases with Spaces',
            sql: 'SELECT name AS "Student Name"\nFROM students;',
            description: 'Double quotes allow aliases with spaces or special formatting.',
          },
        ],
        keyTakeaway: 'AS provides temporary output names for the query result. It NEVER modifies the underlying database table.',
        exampleQuery: 'SELECT name AS student_name, age AS student_age FROM students;',
        exampleQueryExplanation: 'Renames name to student_name and age to student_age in the output.',
        liveDemoSql: 'SELECT name AS student_name, age AS student_age, city AS student_city FROM students;',
        liveDemoNotes: 'Notice how the table headers change in the result view without altering the students table.',
        mcqs: [
          {
            question: 'What does this query do?\nSELECT name AS student_name\nFROM students;',
            options: [
              'A. Changes the actual column name permanently',
              'B. Creates a new table',
              'C. Shows the name column with student_name as its output name',
              'D. Deletes the name column',
            ],
            correctIndex: 2,
            explanation: 'AS only renames the column label in the output result set.',
          },
          {
            question: 'What will the output column name be?\nSELECT city AS location\nFROM students;',
            options: [
              'A. city',
              'B. location',
              'C. students',
              'D. Both city and location',
            ],
            correctIndex: 1,
            explanation: 'The alias `location` replaces `city` as the header in the output.',
          },
          {
            question: 'Does this permanently rename the age column in the database?\nSELECT age AS student_age\nFROM students;',
            options: [
              'A. Yes',
              'B. No',
            ],
            correctIndex: 1,
            explanation: 'No. AS is purely a presentation-layer temporary rename.',
          },
        ],
      },
      masteryPoints: [
        'Use AS to rename output column headers',
        'Understand that AS does not mutate the database',
        'Use quotes when an alias includes spaces',
      ],
      tasks: [
        {
          id: 'day01-c4-t1',
          title: 'Task 1: Show name as student_name',
          description: 'Show name, but the output column should be called student_name.',
          instructions: [
            'Select `name` from `students`.',
            'Alias it as `student_name`.',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name AS student_name FROM students;',
          solutionExplanation: '`SELECT name AS student_name FROM students;` assigns the output alias.',
          hints: [
            { level: 1, text: 'Add `student_name` after the `AS` keyword.' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['student_name'],
            requiredAliases: { name: 'student_name' },
            expectedRowCount: 5,
          },
          successMessage: 'Great job! Column aliased as student_name.',
        },
        {
          id: 'day01-c4-t2',
          title: 'Task 2: Show name and department renamed',
          description: 'Show name and department, renamed as student_name and student_department.',
          instructions: [
            'Select `name` AS `student_name`.',
            'Select `department` AS `student_department`.',
            'From the `students` table.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Rename name and department\n',
          solutionSql: 'SELECT name AS student_name, department AS student_department FROM students;',
          solutionExplanation: 'Renames both projected columns using AS.',
          hints: [
            { level: 1, text: '`SELECT name AS student_name, department AS student_department FROM students;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['student_name', 'student_department'],
            requiredAliases: { name: 'student_name', department: 'student_department' },
            expectedRowCount: 5,
          },
          successMessage: 'Awesome! Both columns aliased cleanly.',
        },
        {
          id: 'day01-c4-t3',
          title: 'Task 3: Show id, name, and age renamed',
          description: 'Show id, name, and age, renamed as student_id, student_name, and student_age.',
          instructions: [
            'Select `id` AS `student_id`.',
            'Select `name` AS `student_name`.',
            'Select `age` AS `student_age`.',
            'From `students`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Rename id, name, and age\n',
          solutionSql: 'SELECT id AS student_id, name AS student_name, age AS student_age FROM students;',
          solutionExplanation: 'Projects three aliased columns.',
          hints: [
            { level: 1, text: '`SELECT id AS student_id, name AS student_name, age AS student_age FROM students;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['student_id', 'student_name', 'student_age'],
            requiredAliases: { id: 'student_id', name: 'student_name', age: 'student_age' },
            expectedRowCount: 5,
          },
          successMessage: 'Spot on! All three columns aliased properly.',
        },
        {
          id: 'day01-c4-t4',
          title: 'Task 4: Principal Report Challenge',
          description: 'Imagine you are creating a report for a school principal. Convert std_id, std_nm, std_age, dept into Student ID, Student Name, Age, Department.',
          instructions: [
            'Query the `student_records` table.',
            'Alias `std_id` AS "Student ID" (or `Student_ID`).',
            'Alias `std_nm` AS "Student Name" (or `Student_Name`).',
            'Alias `std_age` AS `Age` (or `Student_Age`).',
            'Alias `dept` AS `Department`.',
          ],
          type: 'challenge',
          primaryTable: 'student_records',
          initialSql: '-- Principal Report: format technical column names\n',
          solutionSql: 'SELECT std_id AS "Student ID", std_nm AS "Student Name", std_age AS "Age", dept AS "Department" FROM student_records;',
          solutionExplanation: 'Formats all four technical columns into readable report headers.',
          hints: [
            { level: 1, text: 'Use quotes for names with spaces like `"Student ID"` and `"Student Name"`.' },
            { level: 2, text: '`SELECT std_id AS "Student ID", std_nm AS "Student Name", std_age AS "Age", dept AS "Department" FROM student_records;`' },
          ],
          validation: {
            targetTable: 'student_records',
            expectedRowCount: 5,
            customValidator: (_ast, result) => {
              if (!result || !result.columns || result.columns.length < 4) {
                return { valid: false, feedback: 'Query must return all 4 columns with human-readable aliases.' };
              }
              const cols = result.columns.map((c: string) => c.toLowerCase().replace(/[\s_"]/g, ''));
              const hasId = cols.some((c: string) => c.includes('studentid') || c.includes('id'));
              const hasName = cols.some((c: string) => c.includes('studentname') || c.includes('name'));
              const hasAge = cols.some((c: string) => c.includes('age'));
              const hasDept = cols.some((c: string) => c.includes('dept') || c.includes('department'));

              if (hasId && hasName && hasAge && hasDept && result.rows.length === 5) {
                return { valid: true };
              }
              return { valid: false, feedback: 'Ensure you alias std_id, std_nm, std_age, dept to Student ID, Student Name, Age, Department.' };
            },
          },
          successMessage: 'Masterpiece! You produced a formatted report for the school principal.',
        },
      ],
    },
  ],
  challenge: {
    id: 'day-01-homework',
    title: 'Day 1 — Retrieving Data (Homework)',
    scenario: 'In Workbench, with inventory_system selected, practice fundamental retrieval operations:',
    tasks: [
      {
        id: 'day01-hw-1',
        title: 'Task 1: Display name, price, quantity_in_stock from products',
        description: 'Display name, price, and quantity_in_stock from the products table.',
        instructions: [
          'Select name, price, and quantity_in_stock from the products table.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '',
        solutionSql: 'SELECT name, price, quantity_in_stock FROM products;',
        solutionExplanation: 'Retrieves the three specified columns from products table.',
        hints: [
          { level: 1, text: 'Use SELECT name, price, quantity_in_stock FROM products;' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price', 'quantity_in_stock'],
          expectedRowCount: 28,
        },
        successMessage: 'Task 1 completed! Product columns displayed.',
      },
      {
        id: 'day01-hw-2',
        title: 'Task 2: Display name and email from customers',
        description: 'Display name and email from customers (any order).',
        instructions: [
          'Select name and email from the customers table.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '',
        solutionSql: 'SELECT name, email FROM customers;',
        solutionExplanation: 'Retrieves customer names and email addresses.',
        hints: [
          { level: 1, text: 'Use SELECT name, email FROM customers;' },
        ],
        validation: {
          targetTable: 'customers',
          requiredColumns: ['name', 'email'],
          expectedRowCount: 15,
        },
        successMessage: 'Task 2 completed! Customer names and emails displayed.',
      },
      {
        id: 'day01-hw-3',
        title: 'Task 3: Display with column aliases',
        description: 'Repeat Task 1, aliasing columns as product_name, unit_price, stock.',
        instructions: [
          'Select name AS product_name, price AS unit_price, quantity_in_stock AS stock from products.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '',
        solutionSql: 'SELECT name AS product_name, price AS unit_price, quantity_in_stock AS stock FROM products;',
        solutionExplanation: 'Uses AS to rename the 3 output columns in the query result.',
        hints: [
          { level: 1, text: 'SELECT name AS product_name, price AS unit_price, quantity_in_stock AS stock FROM products;' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['product_name', 'unit_price', 'stock'],
          requiredAliases: { name: 'product_name', price: 'unit_price', quantity_in_stock: 'stock' },
          expectedRowCount: 28,
        },
        successMessage: 'Task 3 completed! Columns cleanly aliased.',
      },
    ],
  },
};
