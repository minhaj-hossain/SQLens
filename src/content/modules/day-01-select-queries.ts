import { ModuleData } from '../../types/curriculum';

export const Day_01_MODULE: ModuleData = {
  id: 'day-01',
  slug: 'retrieving-data',
  day: 1,
  title: 'Day 1 — SELECT Queries 101',
  shortTitle: 'SELECT Queries 101',
  type: 'module',
  milestoneId: 'milestone-1',
  description: 'Retrieve exactly the data you need — learn to pinpoint columns, peek at all data with SELECT *, and rename output for clarity. Build the mental model for every query you\'ll ever write.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Learn the query pattern: FROM (where), then SELECT (which columns)',
    'Pick one or many specific columns from a table',
    'Use * to retrieve all columns at once — when and why you\'d do this',
    'Rename columns in your output using the AS keyword for readability',
    'Understand the query foundation: SELECT controls columns; WHERE (coming next) controls rows',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: SELECT and FROM
    // =========================================================================
    {
      id: 'select-and-from',
      order: 1,
      title: '1. Find a Table, Pick Your Columns',
      shortDescription: 'Every query asks two simple questions: where is my data (FROM), and which columns do I want (SELECT)?',
      theory: {
        summary: 'Every SQL query answers two questions: WHERE does the data come from, and WHICH columns do you want back? Imagine we have a database containing a table called students:',
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
          'When you write a basic SQL query, you answer two simple questions:',
          'QUESTION_BLOCK::FROM::Where should I get the data from?',
          'QUESTION_BLOCK::SELECT::What columns do I want to see?',
          'Let\'s see how SQL processes a query that asks for only the student names.',
        ],
        targetQuery: {
          sql: 'SELECT name\nFROM students;',
          explanation: 'From the students table, retrieve only the name column.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students (Find the source table)',
            sqlSnippet: 'FROM students',
            explanation: 'SQL begins by finding the students table. At this stage, all 5 rows and all 5 columns are available.',
            tableData: {
              tableName: 'students (Source Table)',
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
            stepTitle: 'Step 2: SELECT name (Extract the column)',
            sqlSnippet: 'SELECT name',
            explanation: 'Next, SQL extracts only the name column from each row.',
            tableData: {
              tableName: 'Final Query Result',
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
        exampleQueryExplanation: 'The query answers "who is in the class?" — every student\'s name, and nothing else.',
        liveDemoSql: 'SELECT name FROM students;',
        liveDemoNotes: 'Run it and the grid shows exactly five names — one per student — with no other columns cluttering the view.',
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
          title: 'List all student names',
          description: 'The guidance counselor wants a simple list of student names to send out notices. Write a query to retrieve just the name column.',
          instructions: [
            'Select the `name` column from the `students` table',
            'Add a semicolon (;) at the end',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Retrieve just the name column from students\n',
          solutionSql: 'SELECT name FROM students;',
          solutionExplanation: '`SELECT name FROM students;` retrieves the name column for every student.\n\n**Why this works:** SQL executes FROM first (find the students table), then SELECT second (extract only the name column). The result is a single-column table with 5 rows.',
          hints: [
            { level: 1, text: 'Start with SELECT, then specify which column you want' },
            { level: 2, text: 'The pattern is: SELECT [column_name] FROM [table_name];' },
          ],
          validation: {
            requireExactResult: true,
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
            requireExactResult: true,
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
          'To retrieve more than one column from a table, separate the column names with a comma in your `SELECT` statement.',
          '### Notice how SELECT shapes columns:\n• **Original table:** 5 columns (`id`, `name`, `age`, `department`, `city`)\n• **Query result:** 2 columns (`name`, `age`)\n\n**SELECT decides which columns appear in the result.** The table in the database remains unchanged.',
        ],
        targetQuery: {
          sql: 'SELECT name, age\nFROM students;',
          explanation: 'From the students table, retrieve both the name and age columns.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students (Read all columns)',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits the students table with all 5 columns.',
            tableData: {
              tableName: 'students (Full Table)',
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
            stepTitle: 'Step 2: SELECT name, age (Shape columns)',
            sqlSnippet: 'SELECT name, age',
            explanation: 'SQL projects only the name and age columns into the output result.',
            tableData: {
              tableName: 'Final Query Result',
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
        exampleQueryExplanation: 'Two columns side by side — exactly the fields a class roster needs.',
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
            requireExactResult: true,
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
            requireExactResult: true,
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
        summary: 'You just want to see the whole table — every row, every column — without listing each name. That is what the * wildcard means: all columns, no list written, the fastest first look at your data.',
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
          'The `*` (asterisk) is SQL\'s shorthand for **all columns**.',
          'Instead of typing out every column name manually, `SELECT *` tells SQL: *"Give me every column stored in this table."*',
          '### When to use SELECT * vs Specific Columns:\n• Use `SELECT *` when you are first exploring a table to see what columns exist.\n• In production apps and reports, prefer naming specific columns (like `SELECT name, city`) to keep queries fast and clean.',
        ],
        targetQuery: {
          sql: 'SELECT *\nFROM students;',
          explanation: 'The * wildcard retrieves every column and every row stored in the students table.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students (Open table)',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits the students table in the database.',
            tableData: {
              tableName: 'students (Source Table)',
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
            stepTitle: 'Step 2: SELECT * (Include all 5 columns)',
            sqlSnippet: 'SELECT *',
            explanation: 'Because * means all columns, the final result keeps every column without removing anything.',
            tableData: {
              tableName: 'Final Query Result (All Columns)',
              columns: ['id', 'name', 'age', 'department', 'city'],
              highlightedColumns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [2, 'Karim', 22, 'EEE', 'Gazipur'],
                [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
                [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
                [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
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
        exampleQueryExplanation: 'A raw dump — every column and every row. Handy for a quick look, wasteful for real reports.',
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
            requireExactResult: true,
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
            requireExactResult: true,
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
        summary: 'Column names in the result do not have to match the database — AS gives any column a temporary display name, without ever modifying the table itself. We still have our students table:',
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
          'Sometimes raw database column names look technical or cryptic (like `std_nm` or `dob`).',
          'With **AS**, you can give columns friendly, readable labels in your output without changing anything in the database.',
          '### 2. Notice this golden rule:\n**AS only renames the presentation header in the query result.** The actual database column names remain unchanged.',
        ],
        targetQuery: {
          sql: 'SELECT name AS student_name, age AS student_age\nFROM students;',
          explanation: 'Rename the name and age column headers in the output result.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students (Find rows)',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits the students table with all 5 records.',
            tableData: {
              tableName: 'students (Source Table)',
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
            stepTitle: 'Step 2: SELECT name AS student_name, age AS student_age (Rename headers)',
            sqlSnippet: 'SELECT name AS student_name, age AS student_age',
            explanation: 'SQL extracts the name and age columns and applies your new custom header labels.',
            tableData: {
              tableName: 'Final Query Result (Aliased Headers)',
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
            requireExactResult: true,
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
            requireExactResult: true,
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
            requireExactResult: true,
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
            requireExactResult: true,
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
        solutionExplanation: 'SELECT lists exactly these three columns; every other column in products stays out of the picture — pin-pointing what the catalog page actually needs.',
        hints: [
          { level: 1, text: 'Use SELECT name, price, quantity_in_stock FROM products;' },
        ],
        validation: {
          requireExactResult: true,
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
        solutionExplanation: 'A focused two-column snapshot — just the fields the outreach list needs, nothing else.',
        hints: [
          { level: 1, text: 'Use SELECT name, email FROM customers;' },
        ],
        validation: {
          requireExactResult: true,
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
          requireExactResult: true,
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
