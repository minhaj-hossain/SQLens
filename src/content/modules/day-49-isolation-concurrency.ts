import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 49 — How Two Transactions Can Step on Each Other (id: day-49 — order 49)
// Milestone 4, Phase 3: Guarantee Correctness
//   C1 What goes wrong when two transactions run at the same time
//   C2 The four isolation levels and what each one promises
//   C3 How to pick and set the right isolation level
// =============================================================================
export const Day_49_MODULE: ModuleData = {
  id: 'day-49',
  slug: 'isolation-concurrency',
  day: 49,
  title: 'Day 49 — When Two Transactions Collide',
  shortTitle: 'Isolation & Concurrency',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Databases serve many users at once. When two people read and write the same data simultaneously, weird things can happen — like seeing data that was never committed, or getting different numbers on two reads in the same request. Isolation levels are the dial you turn to control how much one transaction can see of another.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Name the four things that can go wrong when two transactions overlap',
    'Explain what each isolation level prevents and what it still allows',
    'Write the SQL command to set a transaction\'s isolation level',
    'Choose the right isolation level for a given scenario',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — What goes wrong
    // -------------------------------------------------------------------------
    {
      id: 'concurrency-anomalies',
      order: 1,
      title: 'What Goes Wrong When Two People Write at the Same Time',
      shortDescription: 'Four specific problems that happen when transactions overlap without protection.',
      theory: {
        summary:
          'When two transactions run at exactly the same time without any rules, four bad things can happen. Databases use isolation levels to block these problems — but each level costs more performance.',
        explanation: [
          'Imagine two users — Alice and Bob — both connected to the same database at the same moment.',
          '**Problem 1 — Dirty Read**: Bob reads a row that Alice just changed but has not saved yet. If Alice cancels (ROLLBACK), Bob read data that never officially existed.',
          '```\nAlice: UPDATE accounts SET balance = 0 WHERE id = 1;  -- not committed yet\nBob:   SELECT balance FROM accounts WHERE id = 1;        -- sees 0 (Alice\'s not-yet-committed change)\nAlice: ROLLBACK;                                         -- balance is restored to original\n-- Bob made a decision based on a ghost number\n```',
          'QUESTION_BLOCK::BEFORE::Why is it dangerous for Bob to see Alice\'s uncommitted change?',
          'QUESTION_BLOCK::AFTER::Because Alice might cancel. Bob would have acted on data that the database officially never accepted.',
          '**Problem 2 — Non-Repeatable Read**: Bob reads a row, Alice updates and commits it, then Bob reads the same row again — and gets a different number, within the same transaction.',
          '```\nBob:   SELECT balance FROM accounts WHERE id = 1;  -- sees 500\nAlice: UPDATE accounts SET balance = 300 WHERE id = 1; COMMIT;\nBob:   SELECT balance FROM accounts WHERE id = 1;  -- sees 300 — different!\n-- Bob\'s same transaction saw two different values for the same row\n```',
          '**Problem 3 — Phantom Read**: Bob counts all orders. Alice adds a new order and commits. Bob counts again — the number changed, even though he never changed anything.',
          '```\nBob:   SELECT COUNT(*) FROM orders WHERE status = \'pending\';  -- gets 5\nAlice: INSERT INTO orders (status) VALUES (\'pending\'); COMMIT;\nBob:   SELECT COUNT(*) FROM orders WHERE status = \'pending\';  -- gets 6 — a "phantom" appeared\n```',
          '**Problem 4 — Lost Update**: Both Alice and Bob read the same balance (500), both subtract 100, and both save. Only one subtraction actually sticks — the other is silently lost.',
          '```\nAlice: SELECT balance FROM accounts WHERE id = 1;  -- sees 500\nBob:   SELECT balance FROM accounts WHERE id = 1;  -- sees 500\nAlice: UPDATE accounts SET balance = 400 WHERE id = 1; COMMIT;  -- 500 - 100 = 400\nBob:   UPDATE accounts SET balance = 400 WHERE id = 1; COMMIT;  -- overwrites Alice\n-- Net effect: only 100 was subtracted, but it should have been 200\n```',
        ],
        syntaxBlocks: [
          {
            title: 'The four concurrency problems at a glance',
            sql: '-- Dirty Read:         reading uncommitted data from another transaction\n-- Non-Repeatable Read: re-reading the same row gets a different value\n-- Phantom Read:        re-running a query gets different rows (INSERT/DELETE by another txn)\n-- Lost Update:         two transactions overwrite each other\'s changes',
            description: 'Each problem is caused by a different interaction pattern between two overlapping transactions.',
          },
        ],
        keyTakeaway:
          'Four things can go wrong when transactions overlap: dirty reads, non-repeatable reads, phantom reads, and lost updates. Isolation levels are the tools used to prevent them.',
        exampleQuery:
          '-- Demonstrating the lost-update pattern:\n-- Session 1:\nBEGIN;\nSELECT stock FROM products WHERE id = 1;  -- sees 10\n-- Session 2 runs and commits: UPDATE products SET stock = 8 WHERE id = 1;\nUPDATE products SET stock = 9 WHERE id = 1;  -- overwrites Session 2\'s update!\nCOMMIT;',
        exampleQueryExplanation:
          'Both sessions read 10, both subtract 1. Session 1 writes 9. Session 2 writes 8 (its own calculation). Session 1\'s COMMIT overwrites Session 2\'s result: net stock is 9 instead of the correct 8.',
        liveDemoSql:
          "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts VALUES (1,'Alice',500),(2,'Bob',300);\n-- Simulate what a second concurrent read would see at this moment:\nSELECT id, owner, balance FROM accounts;",
        liveDemoNotes:
          'This shows the baseline state. In a real multi-session database, a second transaction could modify these rows between your two reads.',
        mcqs: [
          {
            question: 'Alice reads a row that Bob has updated but not yet committed. Bob then rolls back. What problem is this?',
            options: [
              'A. Non-repeatable read — Alice read the same row twice and got different values',
              'B. Dirty read — Alice read data that was never officially saved',
              'C. Phantom read — a new row appeared between two queries',
              'D. Lost update — both users overwrote each other\'s changes',
            ],
            correctIndex: 1,
            explanation:
              'A dirty read is when you read another transaction\'s uncommitted changes. If that transaction rolls back, the data you read never existed in the committed database.',
          },
        ],
        commonMistakes: [
          'Confusing dirty read (reading uncommitted) with non-repeatable read (reading committed but changed data).',
          'Thinking phantom reads are the same as non-repeatable reads — phantoms involve new or deleted rows, not changed values in existing rows.',
        ],
      },
      tasks: [
        {
          id: 'day49-t1',
          title: 'Set Up an Accounts Table and Read It',
          description:
            'Create a simple accounts table and run a SELECT to see the current balances. This is the foundation for understanding what two transactions would see.',
          instructions: [
            "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER)",
            "INSERT 3 rows: Alice (500), Bob (300), Carol (750)",
            "SELECT all rows to see the starting state",
          ],
          type: 'guided',
          primaryTable: 'accounts',
          setupSql: '',
          initialSql: '-- Set up our accounts table\n\n\n',
          solutionSql:
            "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300),(3,'Carol',750);\nSELECT * FROM accounts;",
          solutionExplanation:
            'This is the baseline state two concurrent transactions would both read. The concurrency problems happen when a second transaction changes these rows before the first one finishes.',
          hints: [
            { level: 1, text: 'Use CREATE TABLE, then INSERT INTO accounts (id, owner, balance), then SELECT *' },
            { level: 2, text: "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300),(3,'Carol',750);\nSELECT * FROM accounts;" },
          ],
          validation: { requireSelect: true },
          successMessage: 'Good — this is the data two competing transactions would fight over.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — The four isolation levels
    // -------------------------------------------------------------------------
    {
      id: 'isolation-levels',
      order: 2,
      title: 'The Four Isolation Levels',
      shortDescription: 'Each level blocks more problems but also slows things down more.',
      theory: {
        summary:
          'SQL gives you four isolation levels, from the most permissive (fastest, most risk) to the most protective (slowest, safest). Most databases default to somewhere in the middle.',
        explanation: [
          'Think of isolation levels as security checkpoints. More checkpoints = more safety, but also more waiting.',
          '**Level 1 — READ UNCOMMITTED** (no checkpoint): You can see other transactions\' unfinished work. All four problems can happen. Almost never used in production.',
          '**Level 2 — READ COMMITTED** (basic checkpoint): You only see rows other transactions have already saved. Dirty reads are blocked. Non-repeatable reads and phantom reads can still happen. This is the default in PostgreSQL.',
          '**Level 3 — REPEATABLE READ** (stronger checkpoint): Once you read a row, no other transaction can change that row until you finish. Non-repeatable reads are blocked too. Phantom reads can still happen in some engines. This is the default in MySQL.',
          '**Level 4 — SERIALIZABLE** (full lock): Transactions behave as if they ran one after the other — no overlap at all. All four problems blocked. Slowest.',
          'QUESTION_BLOCK::BEFORE::If you are building a bank transfer and need to guarantee no lost updates, which level do you need minimum?',
          'QUESTION_BLOCK::AFTER::At least REPEATABLE READ — because that prevents another transaction from changing the row you already read. SERIALIZABLE is even safer but slower.',
          'Quick reference table:',
          '```\nLevel              | Dirty Read | Non-Repeatable | Phantom\n-------------------+------------+----------------+--------\nREAD UNCOMMITTED   | Possible   | Possible       | Possible\nREAD COMMITTED     | Blocked    | Possible       | Possible\nREPEATABLE READ    | Blocked    | Blocked        | Possible*\nSERIALIZABLE       | Blocked    | Blocked        | Blocked\n* MySQL InnoDB blocks phantoms at REPEATABLE READ via gap locks\n```',
        ],
        syntaxBlocks: [
          {
            title: 'Setting the isolation level',
            sql: '-- Set before your transaction starts:\nSET TRANSACTION ISOLATION LEVEL READ COMMITTED;\nBEGIN;\n-- ... your queries ...\nCOMMIT;\n\n-- Or per-session in MySQL:\nSET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;',
            description:
              'The isolation level must be set BEFORE the transaction begins. It applies only to that one transaction (or the session, depending on the command).',
          },
        ],
        keyTakeaway:
          'READ COMMITTED blocks dirty reads. REPEATABLE READ also blocks non-repeatable reads. SERIALIZABLE blocks everything but is slowest. Choose based on what your application actually needs — not always the highest level.',
        exampleQuery:
          'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\nBEGIN;\nSELECT SUM(balance) FROM accounts WHERE owner = \'Alice\';\n-- No other transaction can insert/update/delete rows in accounts until COMMIT\nCOMMIT;',
        exampleQueryExplanation:
          'SERIALIZABLE ensures that the SUM you calculate is consistent — no row can appear, disappear, or change while your transaction is open.',
        liveDemoSql:
          "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts VALUES (1,'Alice',500),(2,'Bob',300),(3,'Carol',750);\n-- Setting isolation level and running inside a transaction:\nSET TRANSACTION ISOLATION LEVEL READ COMMITTED;\nBEGIN;\nSELECT * FROM accounts;\nCOMMIT;",
        liveDemoNotes:
          'In our single-session learning environment, isolation level effects cannot be demonstrated with a second live session. The important thing is knowing the syntax and what each level promises.',
        mcqs: [
          {
            question: 'Which isolation level does PostgreSQL use by default?',
            options: [
              'A. READ UNCOMMITTED',
              'B. READ COMMITTED',
              'C. REPEATABLE READ',
              'D. SERIALIZABLE',
            ],
            correctIndex: 1,
            explanation:
              'PostgreSQL defaults to READ COMMITTED. This blocks dirty reads but still allows non-repeatable reads and phantom reads. MySQL InnoDB defaults to REPEATABLE READ, which is one level stricter.',
          },
        ],
        commonMistakes: [
          'Setting SERIALIZABLE everywhere — it prevents all anomalies but dramatically reduces concurrency and slows down high-traffic tables.',
          'Forgetting that isolation level must be set BEFORE BEGIN in most engines.',
        ],
      },
      tasks: [
        {
          id: 'day49-t2',
          title: 'Write a Transaction with an Explicit Isolation Level',
          description:
            'Write a transaction that explicitly sets REPEATABLE READ isolation, reads account balances, and commits. This is how you protect a read from non-repeatable read anomalies.',
          instructions: [
            'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ',
            'BEGIN',
            'SELECT id, owner, balance FROM accounts WHERE balance > 400',
            'COMMIT',
          ],
          type: 'guided',
          primaryTable: 'accounts',
          setupSql:
            "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER); INSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300),(3,'Carol',750);",
          initialSql:
            '-- Protect this read from non-repeatable read anomalies\n\n\n\n',
          solutionSql:
            'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nSELECT id, owner, balance FROM accounts WHERE balance > 400;\nCOMMIT;',
          solutionExplanation:
            'With REPEATABLE READ, every row you read in this transaction is "locked" — no other transaction can change those specific rows until you COMMIT or ROLLBACK. Alice and Carol (both over 400) will show the same values even if you re-read them.',
          hints: [
            { level: 1, text: 'The first statement is SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;' },
            { level: 2, text: 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nSELECT id, owner, balance FROM accounts WHERE balance > 400;\nCOMMIT;' },
          ],
          validation: { requireSelect: true },
          successMessage: 'Your transaction is now protected from non-repeatable reads. Any row you read here cannot change until you commit.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Choosing the right level
    // -------------------------------------------------------------------------
    {
      id: 'isolation-selection',
      order: 3,
      title: 'Picking the Right Isolation Level',
      shortDescription: 'Match the isolation level to what your operation actually needs — not always the strongest.',
      theory: {
        summary:
          'There is no "always correct" isolation level. The right choice depends on what kind of data integrity you need and how much concurrency (parallel users) your app must handle.',
        explanation: [
          'Think about what your transaction is actually doing:',
          '**Report / Dashboard reads (no writes)**: READ COMMITTED is usually fine. Reports can tolerate slightly stale data — locking everything for a report makes other users wait unnecessarily.',
          '**Read then write (e.g. check stock, then decrement)**: Use REPEATABLE READ or higher. Without it, another transaction might change the stock between your read and your write (lost update).',
          '**Financial or inventory operations**: SERIALIZABLE. The extra safety is worth the performance cost when money or critical counts are involved.',
          'QUESTION_BLOCK::BEFORE::A user is generating a monthly sales summary report. Which isolation level is most appropriate?',
          'QUESTION_BLOCK::AFTER::READ COMMITTED. Reports can tolerate minor inconsistency. Locking rows at a higher level would unnecessarily block other users during a potentially long-running query.',
          '**FOR UPDATE pattern**: Even at READ COMMITTED, you can protect a specific row during a read-then-write by using SELECT ... FOR UPDATE. This locks only the rows you read, preventing another transaction from changing them before your UPDATE runs. This is covered on Day 50.',
          'Practical defaults:',
          '```\nScenario                           | Recommended Level\n-----------------------------------|-------------------\nDashboard / report query           | READ COMMITTED\nProfile or settings page read      | READ COMMITTED\nCheck-then-act (inventory, tickets)| REPEATABLE READ\nBanking / ledger transfer          | SERIALIZABLE\nBatch data migration               | READ COMMITTED (for speed)\n```',
        ],
        syntaxBlocks: [
          {
            title: 'Choosing per transaction',
            sql: '-- Fast read (report): default READ COMMITTED is fine\nBEGIN;\nSELECT category, SUM(total) FROM orders GROUP BY category;\nCOMMIT;\n\n-- Safer check-then-write: use REPEATABLE READ\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nSELECT stock FROM products WHERE id = 5;  -- 10 in stock\nUPDATE products SET stock = stock - 1 WHERE id = 5;\nCOMMIT;',
            description:
              'Set isolation per transaction, not globally. Different transactions in the same application may need different levels.',
          },
        ],
        keyTakeaway:
          'Match the isolation level to the risk. Read-only reports usually work fine with READ COMMITTED. Operations that read then write need REPEATABLE READ or higher. Critical financial operations warrant SERIALIZABLE.',
        exampleQuery:
          '-- A safe seat-booking transaction:\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nSELECT seats_available FROM events WHERE id = 42;  -- check\n-- Only proceed if seats > 0\nUPDATE events SET seats_available = seats_available - 1 WHERE id = 42 AND seats_available > 0;\nCOMMIT;',
        exampleQueryExplanation:
          'REPEATABLE READ ensures the seats_available number you read cannot be changed by another booking between your SELECT and your UPDATE. The AND seats_available > 0 guard prevents double-booking even if the read showed 1.',
        liveDemoSql:
          "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts VALUES (1,'Alice',500),(2,'Bob',300),(3,'Carol',750);\n-- Simulate a safe transfer: check balance, then update\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nSELECT balance FROM accounts WHERE id = 1;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;\nSELECT balance FROM accounts WHERE id = 1;\nCOMMIT;",
        liveDemoNotes:
          'REPEATABLE READ protects the read. The AND balance >= 100 guard prevents the update if another transaction already drained the account between the read and the write.',
        mcqs: [
          {
            question: 'A flight booking system checks seat availability and then reserves a seat. What is the minimum isolation level needed to prevent double-booking?',
            options: [
              'A. READ UNCOMMITTED — only need to see the current data',
              'B. READ COMMITTED — committed data is good enough',
              'C. REPEATABLE READ — the row cannot change between the check and the booking',
              'D. Any level works because the UPDATE condition handles it',
            ],
            correctIndex: 2,
            explanation:
              'REPEATABLE READ ensures the seat count you saw cannot change before your UPDATE runs. Without it, two transactions could both read 1 seat available, both decide to book, and both succeed — resulting in an overbooking.',
          },
        ],
        commonMistakes: [
          'Using SERIALIZABLE for everything "to be safe" — this serializes ALL transactions in your application, killing concurrency and throughput.',
          'Relying on READ COMMITTED for check-then-write operations without a FOR UPDATE lock — the row can change between your SELECT and UPDATE.',
        ],
      },
      tasks: [
        {
          id: 'day49-t3',
          title: 'Safe Balance Transfer with REPEATABLE READ',
          description:
            'Write a transaction that checks Alice\'s balance, then transfers 200 to Bob only if she has enough. Use REPEATABLE READ to protect the check from concurrent interference.',
          instructions: [
            'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ',
            'BEGIN',
            'UPDATE accounts SET balance = balance - 200 WHERE id = 1 AND balance >= 200',
            'UPDATE accounts SET balance = balance + 200 WHERE id = 2',
            'SELECT id, owner, balance FROM accounts',
            'COMMIT',
          ],
          type: 'independent',
          primaryTable: 'accounts',
          setupSql:
            "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER); INSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300),(3,'Carol',750);",
          initialSql: '-- Transfer 200 from Alice to Bob, safely\n',
          solutionSql:
            'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nUPDATE accounts SET balance = balance - 200 WHERE id = 1 AND balance >= 200;\nUPDATE accounts SET balance = balance + 200 WHERE id = 2;\nSELECT id, owner, balance FROM accounts;\nCOMMIT;',
          solutionExplanation:
            'REPEATABLE READ protects the balance check. The AND balance >= 200 guard in the UPDATE ensures no negative balance even if concurrent transactions drained it. Alice should end at 300, Bob at 500.',
          hints: [
            { level: 1, text: 'Start with SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; then BEGIN;' },
            { level: 2, text: 'The transfer needs two UPDATEs: subtract from id=1 with a guard, add to id=2.' },
          ],
          validation: { requireSelect: true, expectedRowCount: 3 },
          successMessage: 'Alice: 300, Bob: 500. The transfer ran safely inside a protected transaction.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day49-challenge',
    title: 'Diagnose the Isolation Bug',
    scenario:
      'A ticketing system has a bug: two users can book the last ticket at the same time, resulting in overselling. The current code uses READ COMMITTED. Your job is to identify the anomaly and rewrite the booking transaction to be safe.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day49-ch1',
        title: 'Fix the Ticket Booking to Prevent Overselling',
        description:
          'Create an events table with 1 ticket left. Write a safe booking transaction using REPEATABLE READ that only succeeds if a ticket is actually available, preventing the lost-update problem.',
        instructions: [
          'CREATE TABLE events (id INTEGER PRIMARY KEY, name TEXT, seats_available INTEGER)',
          "INSERT 1 row: event 'Grand Final', 1 seat",
          'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ',
          'BEGIN',
          'UPDATE events SET seats_available = seats_available - 1 WHERE id = 1 AND seats_available > 0',
          'SELECT id, name, seats_available FROM events',
          'COMMIT',
        ],
        type: 'challenge',
        primaryTable: 'events',
        setupSql: '',
        initialSql:
          '-- A safe ticket booking that cannot oversell\n\n\n\n\n\n',
        solutionSql:
          "CREATE TABLE events (id INTEGER PRIMARY KEY, name TEXT, seats_available INTEGER);\nINSERT INTO events (id, name, seats_available) VALUES (1, 'Grand Final', 1);\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nUPDATE events SET seats_available = seats_available - 1 WHERE id = 1 AND seats_available > 0;\nSELECT id, name, seats_available FROM events;\nCOMMIT;",
        solutionExplanation:
          'REPEATABLE READ ensures no other transaction can change seats_available between your check and your UPDATE. The AND seats_available > 0 guard prevents going negative. After one booking, seats_available becomes 0 — the next attempt updates 0 rows.',
        hints: [
          { level: 1, text: 'Create the table, insert 1 row, then write the transaction with SET TRANSACTION ISOLATION LEVEL REPEATABLE READ.' },
          { level: 2, text: 'The UPDATE guard is: WHERE id = 1 AND seats_available > 0 — this prevents updating when no tickets remain.' },
        ],
        validation: { requireSelect: true, expectedRowCount: 1 },
        successMessage: 'The booking is safe. seats_available is now 0, and the UPDATE guard prevents any second booking.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
