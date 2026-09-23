import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 50 — Holding Your Spot: Locks and Partial Rollbacks (id: day-50 — order 50)
// Milestone 4, Phase 3: Guarantee Correctness
//   C1 Row-level locking with SELECT ... FOR UPDATE
//   C2 Savepoints for partial rollbacks
//   C3 Deadlocks and how to avoid them
// =============================================================================
export const Day_50_MODULE: ModuleData = {
  id: 'day-50',
  slug: 'locking-contention-deadlocks',
  day: 50,
  title: 'Day 50 — Holding Your Spot: Locks and Safe Rollbacks',
  shortTitle: 'Locking & Deadlocks',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Sometimes you need to tell the database: "I\'m about to change this row — nobody else touches it until I\'m done." SELECT ... FOR UPDATE does exactly that. Savepoints let you undo part of a transaction without losing everything. Deadlocks happen when two transactions block each other — and the database must pick a victim to resolve it.',
  estimatedMinutes: 65,
  completionLearnings: [
    'Use SELECT ... FOR UPDATE to lock specific rows before updating them',
    'Create and roll back to a SAVEPOINT inside a transaction',
    'Explain what a deadlock is and describe the simple rule that prevents most of them',
    'Use BEGIN / COMMIT / ROLLBACK with savepoints to build safe multi-step transactions',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — SELECT ... FOR UPDATE
    // -------------------------------------------------------------------------
    {
      id: 'select-for-update',
      order: 1,
      title: 'Holding a Row: SELECT ... FOR UPDATE',
      shortDescription: 'Lock the rows you are about to change so nobody else can touch them until you commit.',
      theory: {
        summary:
          'When you need to read a row and then update it, there is a gap between your SELECT and your UPDATE where another transaction could change the same row. SELECT ... FOR UPDATE eliminates that gap by locking the rows as soon as you read them.',
        explanation: [
          'Without locking, two transactions can both read the same inventory count, both decide they can sell one unit, and both succeed — selling more stock than exists.',
          '```sql\n-- WITHOUT locking (dangerous):\nBEGIN;\nSELECT stock FROM products WHERE id = 1;  -- both T1 and T2 see stock=1\n-- T1 and T2 both decide to sell\nUPDATE products SET stock = stock - 1 WHERE id = 1;  -- stock goes to 0 twice!\nCOMMIT;\n```',
          'SELECT ... FOR UPDATE locks the selected rows immediately. The second transaction\'s SELECT ... FOR UPDATE will WAIT until the first commits or rolls back.',
          '```sql\n-- WITH locking (safe):\nBEGIN;\nSELECT stock FROM products WHERE id = 1 FOR UPDATE;  -- T1 locks the row\n-- T2 tries the same SELECT FOR UPDATE — it WAITS\nUPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0;\nCOMMIT;  -- T2\'s lock is now released, T2 can proceed and sees stock=0\n```',
          'QUESTION_BLOCK::BEFORE::After T1 commits and stock is 0, T2\'s SELECT FOR UPDATE succeeds. Its UPDATE says WHERE stock > 0 — what happens?',
          'QUESTION_BLOCK::AFTER::T2\'s UPDATE matches 0 rows. No stock is decremented. The AND stock > 0 guard prevents a negative-stock oversell.',
          'Key rule: FOR UPDATE locks are released when the transaction commits or rolls back. They are never held indefinitely.',
        ],
        syntaxBlocks: [
          {
            title: 'SELECT ... FOR UPDATE syntax',
            sql: 'BEGIN;\nSELECT id, stock FROM products\nWHERE id = :product_id\nFOR UPDATE;  -- locks these rows until COMMIT or ROLLBACK\n\nUPDATE products\nSET stock = stock - 1\nWHERE id = :product_id AND stock > 0;\nCOMMIT;',
            description:
              'FOR UPDATE goes at the end of a SELECT. The lock prevents any other transaction from running FOR UPDATE or updating those rows until you finish.',
          },
          {
            title: 'SKIP LOCKED — skip rows already locked by others',
            sql: '-- Useful for job queue processing:\nSELECT id, task FROM work_queue\nWHERE status = \'pending\'\nLIMIT 1\nFOR UPDATE SKIP LOCKED;  -- grab the next unlocked task',
            description:
              'SKIP LOCKED returns only rows not currently locked by another transaction. Perfect for job queues where multiple workers process tasks simultaneously without blocking each other.',
          },
        ],
        keyTakeaway:
          'Use SELECT ... FOR UPDATE when you need to read a row and then change it, and you cannot allow another transaction to change that row between your read and your write.',
        exampleQuery:
          'BEGIN;\nSELECT id, balance FROM accounts WHERE id = 1 FOR UPDATE;\n-- Row 1 is now locked. Any other transaction\'s SELECT FOR UPDATE on row 1 must wait.\nUPDATE accounts SET balance = balance - 200 WHERE id = 1 AND balance >= 200;\nCOMMIT;',
        exampleQueryExplanation:
          'The FOR UPDATE lock makes the read and the write atomic from a concurrency perspective. No other transaction can see the "pre-update" balance and act on it while this transaction is open.',
        liveDemoSql:
          "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, stock INTEGER);\nINSERT INTO products (id, name, stock) VALUES (1,'Widget',5),(2,'Gadget',0);\n-- Simulate a safe stock decrement:\nBEGIN;\nSELECT id, name, stock FROM products WHERE id = 1 FOR UPDATE;\nUPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0;\nSELECT id, name, stock FROM products WHERE id = 1;\nCOMMIT;",
        liveDemoNotes:
          'In a single-session learning environment, FOR UPDATE has no visible effect — there is no second session to compete. But the pattern is correct and the syntax is what production code uses.',
        mcqs: [
          {
            question: 'What happens when Transaction B tries SELECT ... FOR UPDATE on a row that Transaction A already locked with FOR UPDATE?',
            options: [
              'A. Transaction B immediately gets an error',
              'B. Transaction B reads the row but cannot update it',
              'C. Transaction B waits until Transaction A commits or rolls back',
              'D. Transaction B gets a copy of the row from before Transaction A started',
            ],
            correctIndex: 2,
            explanation:
              'FOR UPDATE creates an exclusive row lock. Other transactions that try FOR UPDATE on the same row must wait. The wait ends when the first transaction commits (releasing the lock) or rolls back.',
          },
        ],
        commonMistakes: [
          'Using SELECT ... FOR UPDATE outside a transaction — the lock is released immediately if there is no open transaction to bind it to.',
          'Locking more rows than needed — FOR UPDATE on a full table scan locks every row scanned, blocking other transactions unnecessarily.',
        ],
      },
      tasks: [
        {
          id: 'day50-t1',
          title: 'Sell an Item Safely with FOR UPDATE',
          description:
            'Create a store_inventory table, then write a transaction that locks a row, checks stock, and decrements it safely. The FOR UPDATE prevents another transaction from changing the stock between your read and write.',
          instructions: [
            'CREATE TABLE store_inventory and INSERT 2 rows: Widget (stock 5), Gadget (stock 0)',
            'BEGIN transaction',
            'SELECT id, name, stock FROM store_inventory WHERE id = 1 FOR UPDATE',
            'UPDATE store_inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0',
            'SELECT id, name, stock FROM store_inventory',
            'COMMIT',
          ],
          type: 'guided',
          primaryTable: 'store_inventory',
          setupSql: '',
          initialSql:
            '-- Set up and safely decrement Widget stock\n\n\n\n\n\n\n',
          solutionSql:
            "CREATE TABLE store_inventory (id INTEGER PRIMARY KEY, name TEXT, stock INTEGER);\nINSERT INTO store_inventory (id, name, stock) VALUES (1,'Widget',5),(2,'Gadget',0);\nBEGIN;\nSELECT id, name, stock FROM store_inventory WHERE id = 1 FOR UPDATE;\nUPDATE store_inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0;\nSELECT id, name, stock FROM store_inventory;\nCOMMIT;",
          solutionExplanation:
            'The FOR UPDATE on Widget locks it. The UPDATE\'s AND stock > 0 guard prevents going below 0. Widget ends at 4. Gadget stays at 0 (not touched).',
          hints: [
            { level: 1, text: 'After BEGIN, use SELECT ... FOR UPDATE before your UPDATE.' },
            { level: 2, text: "BEGIN;\nSELECT id, name, stock FROM store_inventory WHERE id = 1 FOR UPDATE;\nUPDATE store_inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0;\nSELECT id, name, stock FROM store_inventory;\nCOMMIT;" },
          ],
          validation: {             requiredColumns: ['id', 'name', 'stock'],             requireSelect: true, expectedRowCount: 2,           },
          successMessage: 'Widget stock is now 4. The FOR UPDATE lock guaranteed no concurrent transaction could interfere.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Savepoints
    // -------------------------------------------------------------------------
    {
      id: 'savepoints',
      order: 2,
      title: 'Savepoints: Undo Part of a Transaction',
      shortDescription: 'Create named checkpoints inside a transaction so you can roll back to them without losing everything.',
      theory: {
        summary:
          'A normal ROLLBACK undoes the entire transaction. A SAVEPOINT lets you create a named checkpoint inside the transaction. ROLLBACK TO SAVEPOINT undoes only the work done after that checkpoint — the work before it stays.',
        explanation: [
          'Think of a savepoint like an autosave in a video game. If something goes wrong, you can reload to that exact point instead of starting the whole level over.',
          '```sql\nBEGIN;\nINSERT INTO orders (customer_id, total) VALUES (1, 150);  -- step 1\nSAVEPOINT after_order;  -- checkpoint created here\n\nINSERT INTO order_items (order_id, product_id) VALUES (LAST_INSERT_ID(), 99);  -- step 2\n-- step 2 fails (product 99 doesn\'t exist)\nROLLBACK TO SAVEPOINT after_order;  -- undo step 2, keep step 1\n\n-- Try a different product instead\nINSERT INTO order_items (order_id, product_id) VALUES (LAST_INSERT_ID(), 5);\nCOMMIT;  -- step 1 + the corrected step 2 are committed\n```',
          'QUESTION_BLOCK::BEFORE::What would happen if we used a plain ROLLBACK instead of ROLLBACK TO SAVEPOINT after_order?',
          'QUESTION_BLOCK::AFTER::A plain ROLLBACK would undo EVERYTHING — including the INSERT into orders. The whole transaction is gone. The savepoint lets us keep the order and only undo the failed item.',
          'You can have multiple savepoints in one transaction. RELEASE SAVEPOINT removes a savepoint without rolling back to it.',
          '```sql\nBEGIN;\nSAVEPOINT sp1;\n-- ... work A ...\nSAVEPOINT sp2;\n-- ... work B ...\nROLLBACK TO SAVEPOINT sp1;  -- undoes work B AND work A\nCOMMIT;  -- commits nothing extra (work A and B both rolled back)\n```',
        ],
        syntaxBlocks: [
          {
            title: 'Savepoint commands',
            sql: 'BEGIN;\n\nSAVEPOINT checkpoint_name;  -- create a named checkpoint\n\n-- ... do some work ...\n\nROLLBACK TO SAVEPOINT checkpoint_name;  -- undo work done after the checkpoint\n-- (work before the checkpoint is still pending)\n\nRELEASE SAVEPOINT checkpoint_name;  -- remove the savepoint (optional cleanup)\n\nCOMMIT;  -- commit whatever remains',
            description:
              'Savepoints are nested checkpoints inside one open transaction. ROLLBACK TO SAVEPOINT only affects work done after that savepoint.',
          },
        ],
        keyTakeaway:
          'Savepoints let you undo part of a transaction without abandoning the whole thing. They are useful when you have a multi-step operation where some steps are optional or might fail non-fatally.',
        exampleQuery:
          'BEGIN;\nINSERT INTO audit_log (action, ts) VALUES (\'transfer_start\', CURDATE());\nSAVEPOINT before_transfer;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;\n\n-- If the UPDATE changed 0 rows (insufficient funds), roll back only the transfer:\nROLLBACK TO SAVEPOINT before_transfer;\nINSERT INTO audit_log (action, ts) VALUES (\'transfer_failed\', CURDATE());\nCOMMIT;  -- The audit log entries are saved, but the transfer was undone',
        exampleQueryExplanation:
          'The audit log entry at the start is preserved. The failed transfer is rolled back to the savepoint. A failure-log entry is added. Only the audit trail is committed — the money never moved.',
        liveDemoSql:
          "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300);\nBEGIN;\nSAVEPOINT before_debit;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nSELECT id, owner, balance FROM accounts;\nROLLBACK TO SAVEPOINT before_debit;\nSELECT id, owner, balance FROM accounts;\nCOMMIT;",
        liveDemoNotes:
          'First SELECT shows Alice at 400. After ROLLBACK TO SAVEPOINT, the second SELECT shows Alice back at 500. The debit never committed. The transaction closes with COMMIT — but there is nothing to commit since we rolled back to before the debit.',
        mcqs: [
          {
            question: 'A transaction has three INSERT steps and a SAVEPOINT after step 2. ROLLBACK TO SAVEPOINT is called. What is the state?',
            options: [
              'A. All three INSERTs are committed',
              'B. All three INSERTs are rolled back',
              'C. The first two INSERTs remain, the third is rolled back',
              'D. Only the first INSERT remains',
            ],
            correctIndex: 2,
            explanation:
              'ROLLBACK TO SAVEPOINT only undoes work done AFTER the savepoint. Work 1 and 2 were done BEFORE the savepoint — they remain pending. Work 3 was done AFTER — it is undone. A final COMMIT would commit works 1 and 2.',
          },
        ],
        commonMistakes: [
          'Thinking ROLLBACK TO SAVEPOINT commits the work before the savepoint — it does not. The whole transaction is still open. You still need COMMIT for the remaining work to be saved.',
          'Using the same savepoint name twice — the second SAVEPOINT replaces the first one with that name.',
        ],
      },
      tasks: [
        {
          id: 'day50-t2',
          title: 'Use a Savepoint to Protect a Partial Transfer',
          description:
            'Write a transaction that debits Alice by 200, creates a savepoint, tries to credit an account that does not exist (id=99), rolls back only that failed step, and commits the debit.',
          instructions: [
            'BEGIN',
            'UPDATE accounts SET balance = balance - 200 WHERE id = 1',
            'SAVEPOINT after_debit',
            'UPDATE accounts SET balance = balance + 200 WHERE id = 99  -- matches 0 rows',
            'ROLLBACK TO SAVEPOINT after_debit',
            'SELECT id, owner, balance FROM accounts',
            'COMMIT',
          ],
          type: 'guided',
          primaryTable: 'accounts',
          setupSql:
            "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER); INSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300);",
          initialSql:
            '-- Debit Alice, protect with savepoint, rollback the failed credit\n\n\n\n\n\n\n',
          solutionSql:
            'BEGIN;\nUPDATE accounts SET balance = balance - 200 WHERE id = 1;\nSAVEPOINT after_debit;\nUPDATE accounts SET balance = balance + 200 WHERE id = 99;\nROLLBACK TO SAVEPOINT after_debit;\nSELECT id, owner, balance FROM accounts;\nCOMMIT;',
          solutionExplanation:
            'Alice\'s debit (300) stays because ROLLBACK TO SAVEPOINT only undoes work after the savepoint. The failed credit to id=99 is rolled back. The final SELECT shows Alice at 300, Bob unchanged. COMMIT saves Alice\'s debit permanently.',
          hints: [
            { level: 1, text: 'Create the savepoint AFTER the debit and BEFORE the credit. Use ROLLBACK TO SAVEPOINT name to undo only the credit.' },
            { level: 2, text: 'BEGIN;\nUPDATE accounts SET balance = balance - 200 WHERE id = 1;\nSAVEPOINT after_debit;\nUPDATE ... WHERE id = 99;  -- 0 rows\nROLLBACK TO SAVEPOINT after_debit;\nSELECT ...\nCOMMIT;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 2 },
          successMessage: 'Alice is at 300, Bob is unchanged. The failed credit was cleanly rolled back, but the debit survived.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Deadlocks
    // -------------------------------------------------------------------------
    {
      id: 'deadlocks',
      order: 3,
      title: 'Deadlocks: When Transactions Block Each Other',
      shortDescription: 'A deadlock is a standoff where two transactions each wait for the other to release a lock.',
      theory: {
        summary:
          'A deadlock happens when Transaction A holds a lock that Transaction B needs, and Transaction B holds a lock that Transaction A needs — both are waiting, neither can proceed. The database detects this and forces one transaction to fail so the other can continue.',
        explanation: [
          'Classic deadlock scenario:',
          '```\nTransaction A:          Transaction B:\n1. Lock row 1           1. Lock row 2\n2. Try to lock row 2    2. Try to lock row 1\n   → WAIT (B has it)       → WAIT (A has it)\n   DEADLOCK — both waiting forever\n```',
          'The database detects the cycle and automatically rolls back one of the transactions (the "deadlock victim"), returning an error to the application. The other transaction can then proceed.',
          'QUESTION_BLOCK::BEFORE::What is the application supposed to do when it gets a deadlock error?',
          'QUESTION_BLOCK::AFTER::Retry the entire transaction. Deadlocks are expected in high-concurrency systems. Application code should catch the deadlock error and simply try again — usually with a short delay.',
          '**How to prevent deadlocks**: Always lock rows in the same order across all transactions.',
          '```sql\n-- Both T1 and T2 always lock row 1 first, then row 2\n-- If T1 holds row 1, T2 waits — no deadlock\n-- If T2 holds row 1, T1 waits — no deadlock\nBEGIN;\nSELECT * FROM accounts WHERE id = 1 FOR UPDATE;  -- always lock lower ID first\nSELECT * FROM accounts WHERE id = 2 FOR UPDATE;\n-- ... do the transfer ...\nCOMMIT;\n```',
          'The consistent lock ordering rule prevents deadlocks because if all transactions lock in the same sequence, no circular wait can form.',
        ],
        syntaxBlocks: [
          {
            title: 'Safe lock ordering (prevents deadlocks)',
            sql: '-- Transfer between account 1 and account 2:\n-- ALWAYS lock the lower ID first, regardless of transfer direction.\nBEGIN;\n-- Lock in consistent order: id=1 before id=2\nSELECT id, balance FROM accounts WHERE id = 1 FOR UPDATE;\nSELECT id, balance FROM accounts WHERE id = 2 FOR UPDATE;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;',
            description:
              'Both Transaction A (transferring from 1 to 2) and Transaction B (transferring from 2 to 1) lock id=1 first. One waits, the other proceeds — no deadlock.',
          },
        ],
        keyTakeaway:
          'Deadlocks happen when two transactions each hold a lock the other needs. Prevent them by always acquiring locks in the same consistent order. When a deadlock occurs, the database forces one transaction to fail — the application should retry.',
        exampleQuery:
          'BEGIN;\n-- Safe transfer (always lock lower ID first):\nSELECT id, balance FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;',
        exampleQueryExplanation:
          'Locking both rows together with ORDER BY id guarantees consistent lock order. Any concurrent transaction doing the same will lock id=1 first, then id=2 — no circular wait possible.',
        liveDemoSql:
          "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);\nINSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300);\n-- Safe ordered lock + transfer:\nBEGIN;\nSELECT id, balance FROM accounts WHERE id IN (1,2) ORDER BY id FOR UPDATE;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nSELECT id, owner, balance FROM accounts;\nCOMMIT;",
        liveDemoNotes:
          'The ORDER BY id ensures consistent lock order. In a real system with two concurrent transfer transactions, this ordering prevents the circular-wait deadlock.',
        mcqs: [
          {
            question: 'Two transactions are deadlocked. What does the database do?',
            options: [
              'A. Both transactions wait indefinitely',
              'B. Both transactions are immediately committed',
              'C. The database picks one as the victim and rolls it back so the other can proceed',
              'D. The database pauses all other transactions until the deadlock is resolved',
            ],
            correctIndex: 2,
            explanation:
              'The database detects the deadlock cycle and automatically chooses a victim (usually the transaction that has done the least work). That transaction is rolled back and its locks released. The surviving transaction can then acquire the locks it was waiting for and continue.',
          },
        ],
        commonMistakes: [
          'Assuming deadlocks cannot happen with just two transactions — they absolutely can, and are very common in production.',
          'Not implementing retry logic in the application — a deadlock error is expected and recoverable; the app must catch it and retry.',
        ],
      },
      tasks: [
        {
          id: 'day50-t3',
          title: 'Safe Multi-Row Lock with Ordered SELECT FOR UPDATE',
          description:
            'Write a transfer transaction that locks BOTH the source and destination rows in consistent order (lower ID first) before making any changes. This is the deadlock-prevention pattern.',
          instructions: [
            'BEGIN',
            'SELECT id, owner, balance FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE',
            'UPDATE accounts SET balance = balance - 150 WHERE id = 1',
            'UPDATE accounts SET balance = balance + 150 WHERE id = 2',
            'SELECT id, owner, balance FROM accounts',
            'COMMIT',
          ],
          type: 'independent',
          primaryTable: 'accounts',
          setupSql:
            "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER); INSERT INTO accounts (id, owner, balance) VALUES (1,'Alice',500),(2,'Bob',300);",
          initialSql: '-- Transfer 150 from Alice to Bob, deadlock-safe\n',
          solutionSql:
            'BEGIN;\nSELECT id, owner, balance FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;\nUPDATE accounts SET balance = balance - 150 WHERE id = 1;\nUPDATE accounts SET balance = balance + 150 WHERE id = 2;\nSELECT id, owner, balance FROM accounts;\nCOMMIT;',
          solutionExplanation:
            'The ORDER BY id FOR UPDATE locks row 1 before row 2, always. Any concurrent transaction doing the same pattern will wait instead of causing a deadlock. Alice ends at 350, Bob at 450.',
          hints: [
            { level: 1, text: 'Use WHERE id IN (1, 2) ORDER BY id FOR UPDATE to lock both rows in the same consistent order.' },
            { level: 2, text: 'BEGIN;\nSELECT id, owner, balance FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;\nUPDATE accounts SET balance = balance - 150 WHERE id = 1;\nUPDATE accounts SET balance = balance + 150 WHERE id = 2;\nSELECT ...\nCOMMIT;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 2 },
          successMessage: 'Alice: 350, Bob: 450. Both rows were locked in consistent order — concurrent transactions using the same pattern cannot deadlock with this one.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day50-challenge',
    title: 'Atomic Seat Reservation',
    scenario:
      'A concert ticketing system needs to handle simultaneous bookings. Your task is to build a complete booking transaction: create a seat inventory, lock a specific seat, mark it reserved, and use a savepoint to handle an optional audit log that might fail without cancelling the booking.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day50-ch1',
        title: 'Book a Seat with a Protected Audit Log',
        description:
          'Create a seats table and a booking_log table. Write a transaction that locks seat 5, marks it reserved, creates a savepoint, inserts an audit row, then commits. The savepoint protects the booking if the audit insert ever fails.',
        instructions: [
          'CREATE TABLE seats (id INTEGER PRIMARY KEY, label TEXT, status TEXT) and INSERT 5 seats all with status=\'available\'',
          'CREATE TABLE booking_log (id INTEGER PRIMARY KEY, seat_id INTEGER, booked_at TEXT)',
          'BEGIN',
          'SELECT id, label, status FROM seats WHERE id = 5 FOR UPDATE',
          'UPDATE seats SET status = \'reserved\' WHERE id = 5',
          'SAVEPOINT before_log',
          "INSERT INTO booking_log (id, seat_id, booked_at) VALUES (1, 5, '2025-01-01')",
          'SELECT s.id, s.label, s.status, b.booked_at FROM seats s LEFT JOIN booking_log b ON s.id = b.seat_id WHERE s.id = 5',
          'COMMIT',
        ],
        type: 'challenge',
        primaryTable: 'seats',
        setupSql: '',
        initialSql:
          '-- Full booking transaction with lock, update, savepoint, and audit log\n\n\n\n\n\n\n\n\n\n\n',
        solutionSql:
          "CREATE TABLE seats (id INTEGER PRIMARY KEY, label TEXT, status TEXT);\nINSERT INTO seats (id, label, status) VALUES (1,'A1','available'),(2,'A2','available'),(3,'A3','available'),(4,'A4','available'),(5,'A5','available');\nCREATE TABLE booking_log (id INTEGER PRIMARY KEY, seat_id INTEGER, booked_at TEXT);\nBEGIN;\nSELECT id, label, status FROM seats WHERE id = 5 FOR UPDATE;\nUPDATE seats SET status = 'reserved' WHERE id = 5;\nSAVEPOINT before_log;\nINSERT INTO booking_log (id, seat_id, booked_at) VALUES (1, 5, '2025-01-01');\nSELECT s.id, s.label, s.status, b.booked_at FROM seats s LEFT JOIN booking_log b ON s.id = b.seat_id WHERE s.id = 5;\nCOMMIT;",
        solutionExplanation:
          'The FOR UPDATE lock prevents any concurrent booking of seat 5. The savepoint protects the reservation: if the log insert ever fails, ROLLBACK TO SAVEPOINT before_log undoes only the log without losing the reservation. The final SELECT confirms the seat is reserved with a log entry.',
        hints: [
          { level: 1, text: 'Create both tables first. Then BEGIN; SELECT ... FOR UPDATE; UPDATE; SAVEPOINT; INSERT into log; SELECT to verify; COMMIT.' },
          { level: 2, text: 'The savepoint goes between the UPDATE (reservation) and the INSERT (log), so the log can be rolled back without losing the reservation.' },
        ],
        validation: {
          requiredColumns: ['id', 'label', 'status', 'seat_id', 'booked_at'], requireSelect: true, expectedRowCount: 1,
          judgment: [
            { kind: 'diagnose-plan', prompt: 'Two open transactions each hold a lock the other needs. What is the simplest prevention rule?', options: ['Acquire locks on the same rows in the same order, always (for example by id)', 'Make every transaction as long as possible', 'Switch every session to READ COMMITTED', 'Avoid savepoints'], correctIndex: 0, explanation: 'A deadlock needs a circular wait; a global lock order removes the circle, which is why the ordered transfer pattern cannot deadlock.' },
          ],
        },
        successMessage: 'Seat A5 is reserved and logged. The savepoint pattern makes the audit log optional without risking the core booking.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
