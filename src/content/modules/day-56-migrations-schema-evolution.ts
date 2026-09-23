import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 56 — Migrations & Zero-Downtime Schema Evolution (id: day-56 — order 56)
// Milestone 4, Phase 5: Operate
//   C1 The Expand/Contract Pattern (safe online schema evolution)
//   C2 Backfills and Data Synchronization
//   C3 DDL Locking Hazards & Transactional Differences
// =============================================================================
export const Day_56_MODULE: ModuleData = {
  id: 'day-56',
  slug: 'migrations-schema-evolution',
  day: 56,
  title: 'Day 56 — Zero-Downtime Schema Evolution',
  shortTitle: 'Migrations & Schema Evolution',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'How do systems serving millions of users change their database schema without taking the app offline? Renaming a column in a live database will instantly crash any server reading the old name. Master the industry-standard Expand / Contract pattern, safe data backfills, and DDL locking hazard avoidance.',
  estimatedMinutes: 65,
  completionLearnings: [
    'Explain why instantaneous column renames and drops cause production outages',
    'Execute the three-phase Expand / Contract pattern to migrate live schemas safely',
    'Perform batched data backfills to synchronize new columns without locking tables',
    'Understand transactional DDL differences between PostgreSQL and MySQL',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — The Expand / Contract Pattern
    // -------------------------------------------------------------------------
    {
      id: 'expand-contract',
      order: 1,
      title: 'The Expand / Contract Pattern',
      shortDescription: 'How to evolve live schemas without dropping a single query.',
      theory: {
        summary:
          'In production, application servers and databases are deployed asynchronously. If you rename column `price` to `unit_price` in the database before the new code is deployed, old servers will crash. If you deploy code first, it crashes because `unit_price` doesn\'t exist yet. The Expand / Contract pattern solves this.',
        targetQuery: {
          sql: 'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nSELECT product_id, name, price, discount_price FROM products;',
          explanation: 'Phase 1 (Expand): add the new column beside the old one — old code keeps running untouched.',
          badge: "The expand step we'll dissect",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Expand additively',
            sqlSnippet: 'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2)',
            clause: 'ALTER',
            explanation: 'ADD COLUMN is non-destructive: price stays, discount_price arrives nullable, both generations of app code coexist.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: See both columns',
            sqlSnippet: 'SELECT product_id, name, price, discount_price',
            clause: 'SELECT',
            explanation: 'Historical rows show price filled and discount_price NULL — that NULL is the backfill backlog Phase 2 will fill.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Contract only after cutover',
            sqlSnippet: '-- later: ALTER TABLE products DROP COLUMN price',
            explanation: 'The old column is dropped in a SEPARATE deployment, once no server reads it anymore — never in this step.',
          },
        ],
        explanation: [
          'The Three Phases of Zero-Downtime Migration:',
          '1. **Phase 1: Expand (Additive)**',
          '   Add the new column alongside the existing column as NULLABLE.',
          '   `ALTER TABLE products ADD COLUMN promo_price DECIMAL(10,2);`',
          '   Both old and new code can run safely. Neither crashes.',
          '2. **Phase 2: Dual-Write & Backfill**',
          '   Application writes to BOTH columns. A background migration populates historical rows.',
          '3. **Phase 3: Contract (Cleanup)**',
          '   Once all application servers are updated to read only the new column, safely drop or archive the old column.',
          'QUESTION_BLOCK::BEFORE::Why must the new column added in Phase 1 always be nullable (or have a default)?',
          'QUESTION_BLOCK::AFTER::Because existing application servers running old code do not know about the new column and will not include it in their INSERT statements. If it were NOT NULL without a default, all old INSERTs would fail.',
        ],
        syntaxBlocks: [
          {
            title: 'Step 1: Expand phase',
            sql: '-- Expand: add the new column without breaking running code\nALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\n\n-- Inspect table: discount_price is present and NULL for existing rows\nSELECT product_id, name, price, discount_price FROM products;',
            description:
              'Adding a column non-destructively allows old queries to continue operating while new features begin adopting the column.',
          },
        ],
        keyTakeaway:
          'Never rename or delete columns in a single step on live databases. Always Expand (add), Backfill (sync), and Contract (cleanup) across separate deployments.',
        exampleQuery:
          'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nSELECT product_id, name, price, discount_price FROM products;',
        exampleQueryExplanation:
          'Expands the schema with discount_price. Existing products have NULL for this new field.',
        liveDemoSql:
          'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nSELECT product_id, name, price, discount_price FROM products LIMIT 3;',
        liveDemoNotes:
          'Notice discount_price is added to the schema with NULL values.',
        mcqs: [
          {
            question: 'What is the first step in the Expand/Contract migration pattern when renaming a column?',
            options: [
              'A. Drop the table and re-create it',
              'B. Run ALTER TABLE RENAME COLUMN immediately',
              'C. Add the new column alongside the old one as a nullable column (Expand)',
              'D. Delete all rows with NULL values',
            ],
            correctIndex: 2,
            explanation:
              'The Expand phase introduces the new column without removing the old one, ensuring ongoing traffic never encounters a missing column.',
          },
        ],
        commonMistakes: [
          'Adding a NOT NULL column without a DEFAULT to a table with 10 million rows — this can cause an exclusive table lock or fail on existing rows.',
        ],
      },
      tasks: [
        {
          id: 'day56-t1',
          title: 'Phase 1: Expand the Products Schema',
          description:
            'Execute the Expand phase on the products table by adding a new column named discount_price, then query the table to verify its presence.',
          instructions: [
            'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2)',
            'SELECT product_id, name, price, discount_price FROM products',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Step 1: Expand phase\n\n\n',
          solutionSql:
            'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nSELECT product_id, name, price, discount_price FROM products;',
          solutionExplanation:
            'Adding discount_price expands the schema without affecting the existing price column or existing queries.',
          hints: [
            { level: 1, text: 'Use ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2); followed by your SELECT.' },
            { level: 2, text: 'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nSELECT product_id, name, price, discount_price FROM products;' },
          ],
          validation: {             requiredColumns: ['discount_price'],             requireSelect: true, expectedRowCount: { min: 1 },           },
          successMessage: 'Schema expanded! The new column is ready for data synchronization.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Backfilling and Data Synchronization
    // -------------------------------------------------------------------------
    {
      id: 'backfill-sync',
      order: 2,
      title: 'Backfilling Historical Data',
      shortDescription: 'Populate the newly expanded column for all existing records.',
      theory: {
        summary:
          'After expanding the schema, new rows receive values from updated application code. But existing historical rows still contain NULL. The backfill step populates these older rows safely.',
        explanation: [
          'In our scenario, we want `discount_price` to equal `price * 0.9` (a 10% promotional rate).',
          'A backfill query targets only rows that haven\'t been migrated yet:',
          '```sql\nUPDATE products\nSET discount_price = price * 0.9\nWHERE discount_price IS NULL;\n```',
          'In massive production databases with 100M rows, backfills are run in small batches (e.g. 1,000 rows at a time) to prevent long-running transactions and lock contention.',
          'QUESTION_BLOCK::BEFORE::Why do we include WHERE discount_price IS NULL in the backfill UPDATE?',
          'QUESTION_BLOCK::AFTER::To make the backfill idempotent. If the script is interrupted or rerun, it only processes rows that still need migration, never recalculating already-migrated rows.',
        ],
        syntaxBlocks: [
          {
            title: 'Backfill update pattern',
            sql: 'UPDATE products\nSET discount_price = price * 0.9\nWHERE discount_price IS NULL;',
            description:
              'Populates the newly added column for historical rows where it was previously NULL.',
          },
        ],
        keyTakeaway:
          'Backfills populate the new column for historical data. Always make backfills idempotent with WHERE new_col IS NULL.',
        exampleQuery:
          'UPDATE products SET discount_price = price * 0.9 WHERE discount_price IS NULL;\nSELECT product_id, name, price, discount_price FROM products WHERE discount_price IS NOT NULL;',
        exampleQueryExplanation:
          'Updates all products with their promotional price and verifies the populated values.',
        liveDemoSql:
          'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nUPDATE products SET discount_price = price * 0.9 WHERE discount_price IS NULL;\nSELECT product_id, name, price, discount_price FROM products LIMIT 3;',
        liveDemoNotes:
          'Notice discount_price now has calculated values instead of NULL.',
        mcqs: [
          {
            question: 'Why should production data backfills be designed to be idempotent (e.g. WHERE new_col IS NULL)?',
            options: [
              'A. So they can be resumed or retried safely if interrupted without corrupting data or duplicating work',
              'B. To force the database to use a hash join',
              'C. Because SQL does not allow UPDATE without IS NULL',
              'D. To convert text into numbers',
            ],
            correctIndex: 0,
            explanation:
              'Idempotent backfills can be stopped, restarted, or run repeatedly without side effects on already-migrated records.',
          },
        ],
        commonMistakes: [
          'Running a single giant UPDATE on 50 million rows without batching — this locks the entire table and fills up the transaction undo log.',
        ],
      },
      tasks: [
        {
          id: 'day56-t2',
          title: 'Execute Expand and Backfill',
          description:
            'Expand the products table with discount_price, backfill it with price * 0.9 for all rows, and select the updated products.',
          instructions: [
            'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2)',
            'UPDATE products SET discount_price = price * 0.9 WHERE discount_price IS NULL',
            'SELECT product_id, name, price, discount_price FROM products',
          ],
          type: 'independent',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Expand products and backfill promotional prices\n\n\n\n',
          solutionSql:
            'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nUPDATE products SET discount_price = price * 0.9 WHERE discount_price IS NULL;\nSELECT product_id, name, price, discount_price FROM products;',
          solutionExplanation:
            'This performs both the Expand and the Backfill phases. All 28 products now possess populated discount_price values.',
          hints: [
            { level: 1, text: 'Run ALTER TABLE to add the column, then UPDATE to backfill, then SELECT to verify.' },
            { level: 2, text: 'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);\nUPDATE products SET discount_price = price * 0.9 WHERE discount_price IS NULL;\nSELECT product_id, name, price, discount_price FROM products;' },
          ],
          validation: {             requiredColumns: ['discount_price'],             requireSelect: true, expectedRowCount: { min: 1 },           },
          successMessage: 'Backfill complete! Every product now has an active discount_price.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day56-challenge',
    title: 'Zero-Downtime Customer Loyalty Points Migration',
    scenario:
      'The business is launching a customer rewards program. Add a loyalty_points column to the customers table and backfill every existing customer with 100 starting bonus points.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day56-ch1',
        title: 'Migrate and Backfill Customer Loyalty Points',
        description:
          'Alter the customers table to add loyalty_points INTEGER, backfill all existing customers with 100 points, and query customer_id, name, and loyalty_points.',
        instructions: [
          'ALTER TABLE customers ADD COLUMN loyalty_points INTEGER',
          'UPDATE customers SET loyalty_points = 100 WHERE loyalty_points IS NULL',
          'SELECT customer_id, name, loyalty_points FROM customers',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        setupSql: '',
        initialSql: '-- Add loyalty_points to customers and seed starting points\n\n\n\n',
        solutionSql:
          'ALTER TABLE customers ADD COLUMN loyalty_points INTEGER;\nUPDATE customers SET loyalty_points = 100 WHERE loyalty_points IS NULL;\nSELECT customer_id, name, loyalty_points FROM customers;',
        solutionExplanation:
          'This executes an Expand/Backfill migration on customers, granting all 15 customer accounts their starting 100 bonus points without schema locks.',
        hints: [
          { level: 1, text: 'First ALTER TABLE to add loyalty_points INTEGER, then UPDATE with 100 points, then SELECT.' },
          { level: 2, text: 'ALTER TABLE customers ADD COLUMN loyalty_points INTEGER;\nUPDATE customers SET loyalty_points = 100 WHERE loyalty_points IS NULL;\nSELECT customer_id, name, loyalty_points FROM customers;' },
        ],
        validation: {
          requiredColumns: ['loyalty_points'], requireSelect: true, expectedRowCount: { min: 1 },
          judgment: [
            { kind: 'diagnose-plan', prompt: 'You must replace a column that live traffic reads every second. What is the safe sequence?', options: ['Add the new column, backfill it, read both columns during a transition, then drop the old one later', 'Drop the old column first to make room', 'Rename the column in place and redeploy all traffic at once', 'Stop all writes for a day'], correctIndex: 0, explanation: 'Expand then contract: never remove or rename what running code still uses - add, migrate, switch reads, then contract in a later release.' },
          ],
        },
        successMessage: 'Challenge complete! Customer rewards migration successfully deployed using zero-downtime evolution.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
