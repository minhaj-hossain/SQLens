import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 42 — Navigating Trees & Management Chains (id: day-42 — order 42)
// Milestone 4, Phase 1: Reusable Queries & Tree Exploration
//   C1 What a hierarchy is and how self-referencing tables work
//   C2 Walking UP the chain (employee to CEO) using WITH RECURSIVE
//   C3 Building a full path breadcrumb (e.g. "CEO > VP > Manager > You")
// =============================================================================
export const Day_42_MODULE: ModuleData = {
  id: 'day-42',
  slug: 'hierarchies-graph-traversal',
  day: 42,
  title: 'Day 42 — Walking Org Charts and Tree Structures',
  shortTitle: 'Hierarchies & Tree Traversal',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Some tables reference themselves — an employee has a manager who is also an employee. WITH RECURSIVE lets you walk from any starting point up (or down) the entire chain, building breadcrumb paths like "CEO > VP > Manager > You".',
  estimatedMinutes: 65,
  completionLearnings: [
    'Read a self-referencing table where manager_id points back to the same table',
    'Walk from any employee up to the CEO using WITH RECURSIVE',
    'Build a breadcrumb path string using string concatenation in the recursive step',
    'Control traversal depth and avoid loops in real-world data',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Self-referencing tables
    // -------------------------------------------------------------------------
    {
      id: 'hierarchy-self-ref',
      order: 1,
      title: 'Tables That Reference Themselves',
      shortDescription: 'An employee has a manager_id that points to another row in the same employees table.',
      theory: {
        summary:
          'Hierarchies — org charts, folder trees, product categories — are stored in a table where one column points back to the same table. An employees table might have employee_id and manager_id, where manager_id is the employee_id of the person above them.',
        explanation: [
          'Our exercises use a virtual employees table (built with setupSql) so you can practice tree traversal without changing the core schema:',
          '```\nemployees\n  emp_id      — unique ID for this person\n  name        — the person name\n  manager_id  — the emp_id of their direct manager (NULL for the CEO)\n```',
          'Example data:',
          '```\n emp_id | name    | manager_id\n -------+---------+-----------\n   1   | Alice   | NULL      (CEO — no manager)\n   2   | Bob     | 1         (reports to Alice)\n   3   | Carol   | 2         (reports to Bob)\n   4   | Dave    | 3         (reports to Carol)\n```',
          'QUESTION_BLOCK::BEFORE::How many levels are in this org chart?',
          'QUESTION_BLOCK::AFTER::Four levels: Alice (CEO) at the top, then Bob, Carol, and Dave at the bottom.',
          'To walk from Dave (emp_id 4) to the CEO (Alice), you need to hop: Dave → Carol → Bob → Alice. A regular JOIN can only hop one level. WITH RECURSIVE can hop as many levels as needed.',
        ],
        introTable: {
          tableName: 'employees (sample hierarchy)',
          columns: ['emp_id', 'name', 'manager_id', 'role'],
          rows: [
            [1, 'Alice', null, 'CEO'],
            [2, 'Bob', 1, 'VP Engineering'],
            [3, 'Carol', 2, 'Engineering Manager'],
            [4, 'Dave', 3, 'Senior Engineer'],
            [5, 'Eve', 2, 'Product Manager'],
          ],
        },
        syntaxBlocks: [
          {
            title: 'Self-referencing table pattern',
            sql: 'CREATE TABLE employees (\n  emp_id     INTEGER PRIMARY KEY,\n  name       TEXT NOT NULL,\n  manager_id INTEGER REFERENCES employees(emp_id)\n);\n-- manager_id points back to the same table.',
            description:
              'The foreign key manager_id references emp_id in the SAME table. This is the standard way to store any kind of hierarchy.',
          },
        ],
        keyTakeaway:
          'A self-referencing table stores hierarchies by having one column (like manager_id) point back to the primary key of the same table. NULL in the parent column usually means "top of the tree".',
        exampleQuery:
          'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id;',
        exampleQueryExplanation:
          'A self-join shows each employee alongside their direct manager. But this only reveals ONE level. To walk the full chain, you need WITH RECURSIVE.',
        liveDemoSql:
          "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER);\nINSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);\nSELECT e.name AS employee, m.name AS manager\nFROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id;",
        liveDemoNotes:
          'The self-join shows each person with their DIRECT manager only. Dave shows Carol as manager. But who is Carol manager? You need another JOIN — or WITH RECURSIVE.',
        mcqs: [
          {
            question: 'In a self-referencing employees table, what does NULL in manager_id mean?',
            options: [
              'A. The employee has no name',
              'B. The employee is at the top of the tree (CEO / root)',
              'C. The employee is inactive',
              'D. The employee ID is not set',
            ],
            correctIndex: 1,
            explanation:
              'NULL in manager_id means there is no manager above this person — they are the root of the hierarchy (the CEO, the top-level folder, the root category).',
          },
        ],
        commonMistakes: [
          'Confusing emp_id and manager_id — manager_id stores the emp_id of the person ABOVE, not the person themselves.',
          'Forgetting LEFT JOIN when doing a self-join — the root (CEO) has manager_id = NULL and would be dropped by an INNER JOIN.',
        ],
      },
      tasks: [
        {
          id: 'day42-t1',
          title: 'Build the Employees Table and Explore It',
          description:
            'Create the employees table, insert 5 rows (Alice as CEO, then 4 levels below), and do a self-join to see each employee with their direct manager.',
          instructions: [
            'CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER)',
            "INSERT 5 rows: Alice (manager NULL), Bob (manager 1), Carol (manager 2), Dave (manager 3), Eve (manager 2)",
            'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql:
            '',
          initialSql:
            "-- Step 1: Create the table\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  manager_id INTEGER\n);\n\n-- Step 2: Insert the data\nINSERT INTO employees VALUES\n  (1, 'Alice', NULL),\n  (2, 'Bob',   1),\n  (3, 'Carol', 2),\n  (4, 'Dave',  3),\n  (5, 'Eve',   2);\n\n-- Step 3: Self-join to see each person with their direct manager\n",
          solutionSql:
            "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER);\nINSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);\nSELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id;",
          solutionExplanation:
            'The self-join matches each employee to their manager using manager_id = emp_id. LEFT JOIN keeps Alice (NULL manager_id) in the result.',
          hints: [
            { level: 1, text: 'The self-join is: FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id' },
            { level: 2, text: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id;' },
          ],
          validation: { requireJoin: true },
          successMessage: 'You can see each person with their direct manager. Now you are ready to walk the entire chain.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Walking up the chain
    // -------------------------------------------------------------------------
    {
      id: 'hierarchy-walk-up',
      order: 2,
      title: 'Walking Up the Chain: Employee to CEO',
      shortDescription: 'Start at any employee and recursively follow manager_id until you reach the top.',
      theory: {
        summary:
          'With the employees table set up, you can use WITH RECURSIVE to start at any employee and keep following manager_id upward until you hit NULL (the CEO). The result is every person in that employee chain of command.',
        explanation: [
          'The pattern:',
          '```sql\nWITH RECURSIVE chain AS (\n  -- ANCHOR: start at the person we care about\n  SELECT emp_id, name, manager_id, 1 AS level\n  FROM employees\n  WHERE emp_id = 4  -- Dave\n\n  UNION ALL\n\n  -- RECURSIVE STEP: follow manager_id upward\n  SELECT e.emp_id, e.name, e.manager_id, chain.level + 1\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT name, level FROM chain ORDER BY level;\n```',
          'QUESTION_BLOCK::BEFORE::In the JOIN condition, why is e.emp_id = chain.manager_id (not the other way around)?',
          'QUESTION_BLOCK::AFTER::We are going UP — finding the manager. We look for an employee whose emp_id matches the manager_id of the current row. That is the person one level above.',
          'Reading the result of starting at Dave (emp_id=4):',
          '```\n name  | level\n ------+------\n Dave  |  1    (starting point)\n Carol |  2    (Dave manager)\n Bob   |  3    (Carol manager)\n Alice |  4    (Bob manager = CEO)\n```',
          'The level column tells you how far from the starting point each person is.',
        ],
        syntaxBlocks: [
          {
            title: 'Walk up a hierarchy',
            sql: 'WITH RECURSIVE chain AS (\n  -- Start at a specific person\n  SELECT emp_id, name, manager_id, 1 AS level\n  FROM employees WHERE emp_id = :starting_id\n\n  UNION ALL\n\n  -- Follow manager_id upward\n  SELECT e.emp_id, e.name, e.manager_id, chain.level + 1\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT name, level FROM chain ORDER BY level;',
            description:
              'Replace :starting_id with the employee you want to trace. The loop continues until manager_id is NULL (the root).',
          },
        ],
        keyTakeaway:
          'To walk UP a hierarchy, the recursive JOIN condition is: employees.emp_id = chain.manager_id. Keep following until manager_id is NULL.',
        exampleQuery:
          'WITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, chain.level + 1 FROM employees e JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT name, level FROM chain ORDER BY level;',
        exampleQueryExplanation:
          'Starting from emp_id=4 (Dave), the query walks up through Carol, Bob, and Alice. The level column shows the distance from Dave.',
        liveDemoSql:
          "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER);\nINSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);\nWITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, chain.level + 1 FROM employees e JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT name, level FROM chain ORDER BY level;",
        liveDemoNotes:
          'You should get 4 rows: Dave (1), Carol (2), Bob (3), Alice (4). Try changing WHERE emp_id = 4 to WHERE emp_id = 5 to start from Eve instead.',
        mcqs: [
          {
            question: 'In the recursive step, the JOIN condition is e.emp_id = chain.manager_id. What does this find?',
            options: [
              'A. All direct reports of the current employee',
              'B. The current employee manager (one step up)',
              'C. All employees in the entire company',
              'D. The root node of the tree',
            ],
            correctIndex: 1,
            explanation:
              'e.emp_id = chain.manager_id finds the employee whose ID matches the current row manager_id — that is the person one level above.',
          },
        ],
        commonMistakes: [
          'Reversing the JOIN: e.manager_id = chain.emp_id would walk DOWN the tree (finding reports), not UP.',
          'Forgetting level tracking — adding level + 1 helps you know how deep in the chain each row sits.',
        ],
      },
      tasks: [
        {
          id: 'day42-t2',
          title: 'Walk from Dave to the CEO',
          description:
            'Using the employees table (already created with setupSql), write a WITH RECURSIVE query that starts at emp_id = 4 (Dave) and walks up to the CEO. Show name and level for each person in the chain.',
          instructions: [
            'Anchor: SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 4',
            'Recursive step: JOIN employees e ON e.emp_id = chain.manager_id, increment level',
            'Final SELECT: name, level FROM chain ORDER BY level',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql:
            "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER); INSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);",
          initialSql:
            '-- Walk from Dave (emp_id=4) up to the CEO\nWITH RECURSIVE chain AS (\n  -- Anchor\n  SELECT emp_id, name, manager_id, 1 AS level\n  FROM employees WHERE emp_id = 4\n\n  UNION ALL\n\n  -- Recursive step: follow manager_id up\n  \n)\nSELECT name, level FROM chain ORDER BY level;\n',
          solutionSql:
            'WITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, chain.level + 1\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT name, level FROM chain ORDER BY level;',
          solutionExplanation:
            'The anchor starts at Dave. The recursive step joins on emp_id = manager_id to climb up. The loop stops automatically when manager_id is NULL (Alice has no manager). Result: Dave, Carol, Bob, Alice.',
          hints: [
            { level: 1, text: 'The recursive step is: SELECT e.emp_id, e.name, e.manager_id, chain.level + 1 FROM employees e JOIN chain ON e.emp_id = chain.manager_id' },
            { level: 2, text: 'Full solution: WITH RECURSIVE chain AS (SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 4 UNION ALL SELECT e.emp_id, e.name, e.manager_id, chain.level + 1 FROM employees e JOIN chain ON e.emp_id = chain.manager_id) SELECT name, level FROM chain ORDER BY level;' },
          ],
          validation: { requireRecursive: true, expectedRowCount: 4 },
          successMessage: '4 rows: Dave, Carol, Bob, Alice. You walked the entire management chain from employee to CEO.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Building a breadcrumb path
    // -------------------------------------------------------------------------
    {
      id: 'hierarchy-breadcrumb',
      order: 3,
      title: 'Building a Breadcrumb Path',
      shortDescription: 'Accumulate names into a path string like "Alice > Bob > Carol > Dave" as you walk the tree.',
      theory: {
        summary:
          'Walking the chain and showing levels is useful. But for display purposes — like a navigation breadcrumb or an org chart tooltip — you often want a single string like "CEO > VP > Manager > You". You can build this path inside the recursive CTE by concatenating names at each step.',
        explanation: [
          'In the anchor, start the path with just the starting person name. In the recursive step, prepend the manager name:',
          '```sql\nWITH RECURSIVE chain AS (\n  -- Anchor: start with just your name\n  SELECT emp_id, name, manager_id,\n         name AS path\n  FROM employees WHERE emp_id = 4\n\n  UNION ALL\n\n  -- Step: prepend the manager name to the path\n  SELECT e.emp_id, e.name, e.manager_id,\n         e.name || " > " || chain.path\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT path FROM chain\nWHERE manager_id IS NULL;  -- the last row is the CEO, full path is here\n```',
          'QUESTION_BLOCK::BEFORE::Why do we only SELECT WHERE manager_id IS NULL at the end?',
          'QUESTION_BLOCK::AFTER::Each step adds one more name to the front of the path string. The final row (manager_id IS NULL = the CEO) has the complete path from root to the starting employee.',
          'Result: Alice > Bob > Carol > Dave',
          'The || operator concatenates strings in SQLite. The path grows with each recursive step.',
          'This exact pattern is used in product category breadcrumbs (Electronics > Computers > Laptops > MacBooks) and file system paths (/home/user/documents/file.txt).',
        ],
        syntaxBlocks: [
          {
            title: 'Breadcrumb path builder',
            sql: "WITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id,\n         name AS path   -- anchor: just my name\n  FROM employees WHERE emp_id = :start\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id,\n         e.name || ' > ' || chain.path  -- prepend manager\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT path FROM chain WHERE manager_id IS NULL;",
            description:
              'The || is string concatenation. Each step prepends the manager name and a separator. The final WHERE manager_id IS NULL returns only the completed full-path row.',
          },
        ],
        keyTakeaway:
          'Build a breadcrumb by accumulating names in the recursive step using string concatenation. The final row (manager_id IS NULL) contains the complete path.',
        exampleQuery:
          "WITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, name AS path FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, e.name || ' > ' || chain.path\n  FROM employees e JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT path FROM chain WHERE manager_id IS NULL;",
        exampleQueryExplanation:
          'Result: "Alice > Bob > Carol > Dave" — the full management chain from CEO to the starting employee, as a single readable string.',
        liveDemoSql:
          "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER);\nINSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);\nWITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, name AS path FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, e.name || ' > ' || chain.path FROM employees e JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT path FROM chain WHERE manager_id IS NULL;",
        liveDemoNotes:
          'You should see: "Alice > Bob > Carol > Dave" as a single row. Change emp_id = 4 to emp_id = 5 (Eve) to see her chain: "Alice > Bob > Eve".',
        mcqs: [
          {
            question: 'In the breadcrumb path query, why do we SELECT WHERE manager_id IS NULL at the end?',
            options: [
              'A. To filter out the CEO from results',
              'B. Because only the root row (CEO) has the fully-built path string',
              'C. To speed up the query',
              'D. NULL rows are the starting point of the recursion',
            ],
            correctIndex: 1,
            explanation:
              'Each recursive step adds one more name to the front. The last row processed is the CEO (manager_id IS NULL) — at that point the path string is complete, from root all the way to the original starting employee.',
          },
        ],
        commonMistakes: [
          'Forgetting WHERE manager_id IS NULL — you get all intermediate path states, not just the final complete one.',
          'Using + instead of || for string concatenation in SQLite — use || for strings.',
          'Path going in the wrong direction — check whether you prepend (e.name || path) or append (path || e.name) based on which direction you want the breadcrumb to read.',
        ],
      },
      tasks: [
        {
          id: 'day42-t3',
          title: 'Build Dave\'s Breadcrumb',
          description:
            'Using the employees table, write a WITH RECURSIVE query that produces the breadcrumb path from CEO to Dave as a single string: "Alice > Bob > Carol > Dave".',
          instructions: [
            'Anchor: SELECT emp_id, name, manager_id, name AS path FROM employees WHERE emp_id = 4',
            "Recursive step: e.name || ' > ' || chain.path AS path",
            'Final SELECT: SELECT path FROM chain WHERE manager_id IS NULL',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql:
            "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER); INSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);",
          initialSql:
            '-- Build "Alice > Bob > Carol > Dave"\nWITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id,\n         name AS path\n  FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id,\n         -- build the path here\n         \n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT path FROM chain WHERE manager_id IS NULL;\n',
          solutionSql:
            "WITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, name AS path FROM employees WHERE emp_id = 4\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, e.name || ' > ' || chain.path\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT path FROM chain WHERE manager_id IS NULL;",
          solutionExplanation:
            'Each recursive step prepends the manager name with " > " separator. When Alice (manager_id IS NULL) is reached, the path contains all 4 names in order.',
          hints: [
            { level: 1, text: "The path expression is: e.name || ' > ' || chain.path" },
            { level: 2, text: "WITH RECURSIVE chain AS (SELECT emp_id, name, manager_id, name AS path FROM employees WHERE emp_id = 4 UNION ALL SELECT e.emp_id, e.name, e.manager_id, e.name || ' > ' || chain.path FROM employees e JOIN chain ON e.emp_id = chain.manager_id) SELECT path FROM chain WHERE manager_id IS NULL;" },
          ],
          validation: { requireRecursive: true, expectedRowCount: 1 },
          successMessage: '"Alice > Bob > Carol > Dave" — one row containing the full management chain as a readable breadcrumb.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day42-t4',
          title: 'Breadcrumbs for All Employees',
          description:
            'Modify the query to show the full breadcrumb path for EVERY non-root employee (emp_id != 1). Use a CTE that starts from each person individually.',
          instructions: [
            'Change the anchor to start from ALL employees where manager_id IS NOT NULL',
            'The recursive step still follows manager_id upward',
            'Final SELECT: emp_id, path FROM chain WHERE manager_id IS NULL',
          ],
          type: 'independent',
          primaryTable: 'products',
          setupSql:
            "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER); INSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);",
          initialSql:
            '-- Show full breadcrumbs for all employees (except the root)\n',
          solutionSql:
            "WITH RECURSIVE chain AS (\n  SELECT emp_id, name, manager_id, name AS path, emp_id AS start_id\n  FROM employees WHERE manager_id IS NOT NULL\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, e.name || ' > ' || chain.path, chain.start_id\n  FROM employees e\n  JOIN chain ON e.emp_id = chain.manager_id\n)\nSELECT start_id AS emp_id, path\nFROM chain WHERE manager_id IS NULL\nORDER BY start_id;",
          solutionExplanation:
            'The anchor now starts from ALL non-root employees. A start_id column tracks which employee each path belongs to. The final WHERE manager_id IS NULL returns each completed path.',
          hints: [
            { level: 1, text: 'Change the anchor WHERE to: WHERE manager_id IS NOT NULL. Add emp_id AS start_id in the anchor to track which starting employee each chain belongs to.' },
            { level: 2, text: "WITH RECURSIVE chain AS (SELECT emp_id, name, manager_id, name AS path, emp_id AS start_id FROM employees WHERE manager_id IS NOT NULL UNION ALL SELECT e.emp_id, e.name, e.manager_id, e.name || ' > ' || chain.path, chain.start_id FROM employees e JOIN chain ON e.emp_id = chain.manager_id) SELECT start_id AS emp_id, path FROM chain WHERE manager_id IS NULL ORDER BY start_id;" },
          ],
          validation: { requireRecursive: true, expectedRowCount: 4 },
          successMessage: 'All 4 non-root employees have their full breadcrumb paths. Bob sees "Alice > Bob", Dave sees "Alice > Bob > Carol > Dave".',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day42-challenge',
    title: 'Org Chart Deep Dive',
    scenario:
      'A company has a deeper org chart (6 levels). Your task is to find every person under a specific VP, list them all, and also generate breadcrumb paths for the bottom-level employees.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day42-ch1',
        title: 'Walk DOWN from a VP',
        description:
          'Create a 6-level org chart, then use WITH RECURSIVE to walk DOWN from Bob (emp_id = 2) and find all employees in his subtree. Show emp_id, name, and depth (Bob = 1).',
        instructions: [
          'CREATE TABLE employees and INSERT 6 people: Alice (CEO), Bob (VP, mgr=1), Carol (mgr=2), Dave (mgr=3), Frank (mgr=4), Grace (mgr=5)',
          'Anchor: WHERE emp_id = 2 (Bob)',
          'Recursive step: JOIN employees e ON e.manager_id = chain.emp_id (walk DOWN)',
          'SELECT emp_id, name, depth FROM chain ORDER BY depth',
        ],
        type: 'challenge',
        primaryTable: 'products',
        setupSql:
          "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER); INSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Frank',4),(6,'Grace',5);",
        initialSql:
          '-- Walk DOWN from Bob (emp_id=2)\nWITH RECURSIVE subtree AS (\n  -- Anchor: start at Bob\n  \n  UNION ALL\n  -- Recursive step: find direct reports\n  \n)\nSELECT emp_id, name, depth FROM subtree ORDER BY depth;\n',
        solutionSql:
          'WITH RECURSIVE subtree AS (\n  SELECT emp_id, name, manager_id, 1 AS depth FROM employees WHERE emp_id = 2\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, subtree.depth + 1\n  FROM employees e\n  JOIN subtree ON e.manager_id = subtree.emp_id\n)\nSELECT emp_id, name, depth FROM subtree ORDER BY depth;',
        solutionExplanation:
          'Walking DOWN uses e.manager_id = subtree.emp_id (opposite direction from walking up). Starting from Bob, you find Carol (depth 2), Dave (depth 3), Frank (depth 4), Grace (depth 5).',
        hints: [
          { level: 1, text: 'Walking DOWN: recursive step uses e.manager_id = subtree.emp_id (find employees whose manager IS the current row).' },
          { level: 2, text: 'WITH RECURSIVE subtree AS (SELECT emp_id, name, manager_id, 1 AS depth FROM employees WHERE emp_id = 2 UNION ALL SELECT e.emp_id, e.name, e.manager_id, subtree.depth + 1 FROM employees e JOIN subtree ON e.manager_id = subtree.emp_id) SELECT emp_id, name, depth FROM subtree ORDER BY depth;' },
        ],
        validation: { requireRecursive: true, expectedRowCount: 5 },
        successMessage: 'You walked DOWN the tree. Bob + his 4 direct/indirect reports appear, in order by depth.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
