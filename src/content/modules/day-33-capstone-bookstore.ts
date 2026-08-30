import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 32 - CAPSTONE PROJECT: SQLens Bookstore (id: capstone-bookstore, order 32)
// -----------------------------------------------------------------------------
// The finale: the learner APPLIES every skill across the 31-day curriculum by
// building a brand-new domain schema from scratch — the very flow the engine's
// AUTO_INCREMENT + runtime DDL were built to support:
//
//   C1 Plan the schema   (design decisions, relationship map — no SQL)
//   C2 CREATE TABLE      (publishers, authors, books, sales + all constraints)
//   C3 Seed              (multi-row INSERTs relying on AUTO_INCREMENT, parents first)
//   C4 Query             (3-way JOIN, revenue per author, best-seller with a window)
//   C5 Evolve            (ALTER add column; index + EXPLAIN proof; transaction ROLLBACK lab)
//
// Lesson tasks chain across concepts (databaseLifecycle 'inherit') exactly like
// the audit tooling models them, so the staged "create → insert → join → evolve"
// pipeline is a single continuous session. The final 4-task challenge replays the
// whole migration standalone as the assessment.
// =============================================================================
export const Day_33_MODULE: ModuleData = {
  id: 'capstone-bookstore',
  slug: 'sqlens-bookstore',
  day: 0, // ordering uses curriculumOrder (Day 32)
  title: 'Day 32 - Capstone Project: SQLens Bookstore',
  shortTitle: 'Capstone: Bookstore',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description:
    'Design, build, seed, query, and evolve a complete Bookstore from an empty database — the capstone that stitches together every skill in the course: schema design, DDL constraints, AUTO_INCREMENT seeding, multi-table joins, aggregation, window ranking, indexing, and transactions.',
  estimatedMinutes: 95,
  completionLearnings: [
    'Plan a normalized schema and justify every table, key, and relationship before writing SQL',
    'Create a 4-table schema with PRIMARY KEY, AUTO_INCREMENT, NOT NULL, UNIQUE, CHECK, DEFAULT, and FOREIGN KEY',
    'Seed a parent→child graph with multi-row INSERTs relying on AUTO_INCREMENT ids',
    'Answer business questions with 3-way JOINs, per-group aggregation, and window-based best-seller ranking',
    'Evolve a live schema with ALTER, prove an index with EXPLAIN, and protect a batch with a transaction',
  ],
  concepts: [
    {
      id: 'cap-plan',
      order: 1,
      title: 'Stage 1 - Plan the Bookstore Schema',
      shortDescription: 'Decide the entities, keys, and relationships before writing a line of SQL.',
      theory: {
        summary:
          'SQLens is opening a bookstore. Before any CREATE TABLE, a good designer settles the entities and how they relate. The core fact is a SALE of a BOOK; a BOOK is written by an AUTHOR and published by a PUBLISHER. That gives four entities — and the relationships tell you which is a parent and which is a child, which column becomes a foreign key, and why the children must be seeded after their parents.',
        introTable: {
          tableName: 'The relationship map',
          description: 'One-to-many relationships running from parents to children.',
          columns: ['Entity', 'Role', 'Relationships'],
          rows: [
            ['publishers', 'parent of books', '1 publisher → many books'],
            ['authors', 'parent of books', '1 author → many books'],
            ['books', 'child of authors & publishers', 'many books → 1 author, 1 publisher'],
            ['sales', 'child of books', 'many sales → 1 book'],
          ],
        },
        explanation: [
          'A bookstore starts with three reference entities. A **publisher** publishes many books; an **author** writes many books. Both are PARENTS — they stand alone and are seeded first. A **book** belongs to exactly one publisher and one author, so it carries two foreign keys: `publisher_id` and `author_id`.',
          '```sql\nCREATE TABLE publishers (\n  publisher_id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL UNIQUE\n);\n```',
          'QUESTION_BLOCK::WHY::Why do books need foreign keys to publishers and authors instead of just copying the names?',
          'A **sale** records one moment a book was bought: which book, on what date, how many copies, and the price actually charged. It is the CHILD of books — its `book_id` foreign key points at the books table. Because a sale is the business event, most reporting questions (revenue, best-sellers, author earnings) read FROM sales and JOIN outward.',
          'The seeding order falls out of the design automatically: parents first, children after. With `AUTO_INCREMENT` primary keys, you never type an id — you insert a publisher, then a book that references it, and the engine assigns the ids in sequence. That is the entire point of the engine work behind this capstone.',
        ],
        targetQuery: {
          sql: 'SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue\nFROM sales s\nJOIN books b ON s.book_id = b.book_id\nJOIN authors a ON b.author_id = a.author_id\nGROUP BY a.name\nORDER BY revenue DESC;',
          explanation: 'The design decision that powers this query: sales is the base table, books links it to authors. The JOIN is only possible because the schema put the right foreign keys on the right tables.',
          badge: "The query the whole schema exists to answer",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'List the entities a bookstore talks about',
            sqlSnippet: 'publishers, authors, books, sales',
            explanation: 'Books are the product; authors and publishers describe them; sales are the events that create revenue. Four tables, each with one job.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Draw the one-to-many relationships',
            sqlSnippet: '1 publisher -> many books; 1 author -> many books; 1 book -> many sales',
            explanation: 'Every arrow becomes a foreign key on the MANY side. books gets publisher_id and author_id; sales gets book_id.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Decide the seed order from the parent/child map',
            sqlSnippet: 'publishers & authors -> books -> sales',
            explanation: 'A child cannot exist before its parent. With AUTO_INCREMENT ids assigned by the engine, seeding falls into this natural order.',
          },
        ],
        keyTakeaway: 'Design before DDL: four entities, three one-to-many relationships, and a seed order (parents then children) that fall out of the relationship map — with AUTO_INCREMENT doing the id assignment for you.',
        exampleQuery: 'SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue FROM sales s JOIN books b ON s.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id GROUP BY a.name;',
        exampleQueryExplanation: 'The reporting query that motivates the whole schema — it only works because sales, books, and authors were modeled and joined correctly.',
        mcqs: [
          {
            question: 'Why does a book carry foreign keys to both an author and a publisher?',
            options: [
              'A. Because foreign keys are required on every column',
              'B. Because each book belongs to exactly one author and one publisher, so it stores their ids (the many side of both relationships)',
              'C. To copy the author and publisher names onto every book',
              'D. To make books query faster',
            ],
            correctIndex: 1,
            explanation: 'The MANY side of a one-to-many relationship stores the parent id as a foreign key. A book is the many side of both author and publisher.',
          },
          {
            question: 'Which table should you seed FIRST?',
            options: ['A. sales', 'B. books', 'C. publishers and authors', 'D. Any order works'],
            correctIndex: 2,
            explanation: 'Parents first. books needs publisher_id and author_id to exist, so publishers and authors are seeded before books — and sales, referencing books, goes last.',
          },
          {
            question: 'What does AUTO_INCREMENT do for you during seeding?',
            options: [
              'A. It encrypts the id column',
              'B. It assigns the primary key ids in sequence so you never type them — child rows can reference the generated ids',
              'C. It prevents all inserts',
              'D. It makes the id always begin at 100',
            ],
            correctIndex: 1,
            explanation: 'AUTO_INCREMENT numbers the primary keys for you, which is exactly what lets a child insert reference a parent without hardcoding ids.',
          },
        ],
        commonMistakes: [
          'Copying parent names onto the child (denormalizing) instead of storing the foreign key — the anti-pattern from Day 30.',
          'Seeding children before parents, which trips a FOREIGN KEY constraint.',
        ],
        masteryPoints: ['Justify entities and relationships before writing DDL', 'Derive seed order from the parent/child map'],
      },
      // Stage 1 is the planning lecture — deliberately no SQL practice tasks.
      tasks: [],
    },
    {
      id: 'cap-create',
      order: 2,
      title: 'Stage 2 - CREATE TABLE the Bookstore',
      shortDescription: 'Bring the design to life with DDL and every constraint you have learned.',
      theory: {
        summary:
          'The plan becomes SQL. You already own CREATE TABLE, PRIMARY KEY, AUTO_INCREMENT, NOT NULL, UNIQUE, DEFAULT, CHECK, and FOREIGN KEY — this stage combines them all into the four bookstore tables. Publishers and authors are simple parents; books and sales add the constraints and foreign keys that keep the data honest.',
        introTable: {
          tableName: 'books (schema)',
          description: 'The constraint ladder on one child table.',
          columns: ['column', 'constraints'],
          rows: [
            ['book_id', 'INT PRIMARY KEY AUTO_INCREMENT'],
            ['title', 'VARCHAR(200) NOT NULL'],
            ['author_id', 'INT NOT NULL FOREIGN KEY -> authors'],
            ['publisher_id', 'INT NOT NULL FOREIGN KEY -> publishers'],
            ['genre', 'VARCHAR(50) NOT NULL'],
            ['price', 'DECIMAL(8,2) NOT NULL CHECK (price >= 0)'],
            ['quantity_in_stock', 'INT NOT NULL DEFAULT 0'],
          ],
        },
        explanation: [
          'The parent tables are almost minimal. A publisher needs an identity and a name, and because two publishers must not share a name, `name` gets `UNIQUE`.',
          '```sql\nCREATE TABLE publishers (\n  publisher_id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL UNIQUE\n);\nCREATE TABLE authors (\n  author_id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL\n);\n```',
          'QUESTION_BLOCK::NULL::Why is `quantity_in_stock` NOT NULL with a DEFAULT instead of nullable?',
          'The books table is the constraint showcase. `title` is NOT NULL; `price` is NOT NULL and CHECKed to never go negative (a price of -5 is a bug, not a sale); `quantity_in_stock` is NOT NULL with a DEFAULT of 0, so a row with no stock number is still a real row; and two FOREIGN KEY clauses tie books to authors and publishers.',
          '```sql\nCREATE TABLE books (\n  book_id INT PRIMARY KEY AUTO_INCREMENT,\n  title VARCHAR(200) NOT NULL,\n  author_id INT NOT NULL,\n  publisher_id INT NOT NULL,\n  genre VARCHAR(50) NOT NULL,\n  price DECIMAL(8,2) NOT NULL CHECK (price >= 0),\n  quantity_in_stock INT NOT NULL DEFAULT 0,\n  FOREIGN KEY (author_id) REFERENCES authors(author_id),\n  FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id)\n);\n```',
          'sales is the child of books. Its `book_id` is a foreign key, `quantity` is CHECKed to be positive (you sell at least one copy), and `sale_date` records when the transaction happened.',
        ],
        targetQuery: {
          sql: 'CREATE TABLE sales (\n  sale_id INT PRIMARY KEY AUTO_INCREMENT,\n  book_id INT NOT NULL,\n  sale_date DATE NOT NULL,\n  quantity INT NOT NULL CHECK (quantity > 0),\n  unit_price DECIMAL(8,2) NOT NULL,\n  FOREIGN KEY (book_id) REFERENCES books(book_id)\n);',
          explanation: 'The final child table — every sale references a real book, carries a positive quantity, and records when it happened.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Create the two parent tables',
            sqlSnippet: 'CREATE TABLE publishers (…); CREATE TABLE authors (…);',
            explanation: 'Both use an AUTO_INCREMENT primary key. publishers.name is UNIQUE to prevent duplicate publishers.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Create books with its full constraint ladder',
            sqlSnippet: 'NOT NULL, CHECK (price >= 0), DEFAULT 0, FOREIGN KEY …',
            explanation: 'Books is the many side of both relationships, so it carries two foreign keys plus NOT NULL and CHECK guards.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Create sales as the child of books',
            sqlSnippet: 'FOREIGN KEY (book_id) REFERENCES books(book_id), CHECK (quantity > 0)',
            explanation: 'sales completes the graph: it can only reference real books, and it guards quantity to be positive.',
          },
        ],
        keyTakeaway: 'CREATE TABLE turns the design into enforced reality: parent tables first, then children, with AUTO_INCREMENT identities and the constraint ladder (NOT NULL, UNIQUE, DEFAULT, CHECK, FOREIGN KEY) guarding every write.',
        exampleQuery: 'CREATE TABLE sales (sale_id INT PRIMARY KEY AUTO_INCREMENT, book_id INT NOT NULL, sale_date DATE NOT NULL, quantity INT NOT NULL CHECK (quantity > 0), unit_price DECIMAL(8,2) NOT NULL, FOREIGN KEY (book_id) REFERENCES books(book_id));',
        exampleQueryExplanation: 'The child of books — its foreign key and CHECK complete the schema.',
        mcqs: [
          {
            question: 'Why is `quantity_in_stock INT NOT NULL DEFAULT 0` better than letting it be NULL?',
            options: [
              'A. NULL is faster',
              'B. Every book has a stock count; DEFAULT 0 gives new rows a real value instead of an unknown one',
              'C. DEFAULT 0 is required for all columns',
              'D. It prevents AUTO_INCREMENT',
            ],
            correctIndex: 1,
            explanation: 'A NOT NULL column with a DEFAULT means a missing value resolves to 0 — a concrete count — rather than an unknown NULL.',
          },
          {
            question: 'What does the CHECK (price >= 0) constraint do?',
            options: [
              'A. It speeds up price lookups',
              'B. It rejects any insert or update where price is negative',
              'C. It rounds price to 2 decimals',
              'D. It makes price required',
            ],
            correctIndex: 1,
            explanation: 'CHECK is a business rule enforced by the database: a negative price is rejected on write.',
          },
        ],
        commonMistakes: [
          'Typing a foreign key column but forgetting the FOREIGN KEY … REFERENCES clause — the link is then not enforced.',
          'Creating a child table before its parent (books before authors), which fails because the referenced table does not exist yet.',
        ],
        masteryPoints: ['Create parent and child tables in dependency order', 'Combine AUTO_INCREMENT, NOT NULL, UNIQUE, DEFAULT, CHECK and FOREIGN KEY in one CREATE'],
      },
      tasks: [
        {
          id: 'cap-c2-t1',
          title: 'Task 1 (Guided): CREATE the parent tables — publishers & authors',
          description: 'Create the two parent tables for the bookstore. Both use AUTO_INCREMENT primary keys; publishers.name must be UNIQUE.',
          instructions: [
            'Create `publishers` with `publisher_id INT PRIMARY KEY AUTO_INCREMENT` and `name VARCHAR(100) NOT NULL UNIQUE`.',
            'Create `authors` with `author_id INT PRIMARY KEY AUTO_INCREMENT` and `name VARCHAR(100) NOT NULL`.',
            'Separate the two statements with a semicolon and end the script with a semicolon.',
          ],
          type: 'guided',
          primaryTable: 'publishers',
          secondaryTables: ['authors'],
          initialSql: '-- Stage 2: the parent tables\n',
          solutionSql:
            "CREATE TABLE publishers (publisher_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE);\nCREATE TABLE authors (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL);",
          solutionExplanation: 'Both parents get an AUTO_INCREMENT identity; publishers.name is UNIQUE so no two publishers share a name.',
          hints: [
            { level: 1, text: 'publishers: (publisher_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE)' },
            { level: 2, text: 'Then authors: (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL)' },
          ],
          validation: { targetTable: 'publishers', expectedRowCount: 1 },
          successMessage: 'Publishers and authors are live — the parents are in place.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'cap-c2-t2',
          title: 'Task 2 (Independent): CREATE the books table with its constraint ladder',
          description: 'books is the many side of both relationships — it carries two foreign keys plus NOT NULL, CHECK, and DEFAULT guards.',
          instructions: [
            'Create `books` with `book_id INT PRIMARY KEY AUTO_INCREMENT`.',
            'Add `title VARCHAR(200) NOT NULL`, `author_id INT NOT NULL`, `publisher_id INT NOT NULL`, `genre VARCHAR(50) NOT NULL`.',
            'Add `price DECIMAL(8,2) NOT NULL CHECK (price >= 0)` and `quantity_in_stock INT NOT NULL DEFAULT 0`.',
            'Add the two table-level foreign keys: FOREIGN KEY (author_id) REFERENCES authors(author_id) and FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id).',
          ],
          type: 'independent',
          primaryTable: 'books',
          secondaryTables: ['authors', 'publishers'],
          initialSql: '-- Stage 2: the books table\n',
          solutionSql:
            "CREATE TABLE books (book_id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200) NOT NULL, author_id INT NOT NULL, publisher_id INT NOT NULL, genre VARCHAR(50) NOT NULL, price DECIMAL(8,2) NOT NULL CHECK (price >= 0), quantity_in_stock INT NOT NULL DEFAULT 0, FOREIGN KEY (author_id) REFERENCES authors(author_id), FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id));",
          solutionExplanation: 'books is the child of authors and publishers: two foreign keys, a NOT NULL price with a non-negative CHECK, and a DEFAULTed stock count.',
          hints: [
            { level: 1, text: 'The FOREIGN KEY clauses are table-level: FOREIGN KEY (author_id) REFERENCES authors(author_id), then the same for publishers.' },
          ],
          validation: { targetTable: 'books', expectedRowCount: 1 },
          successMessage: 'books is created and tied to its parents by enforced foreign keys.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c2-t3',
          title: 'Task 3 (Independent): CREATE the sales table as the child of books',
          description: 'sales records each purchase. It references books and guards quantity to be positive.',
          instructions: [
            'Create `sales` with `sale_id INT PRIMARY KEY AUTO_INCREMENT`.',
            'Add `book_id INT NOT NULL`, `sale_date DATE NOT NULL`, `quantity INT NOT NULL CHECK (quantity > 0)`, and `unit_price DECIMAL(8,2) NOT NULL`.',
            'Add `FOREIGN KEY (book_id) REFERENCES books(book_id)`.',
          ],
          type: 'independent',
          primaryTable: 'sales',
          secondaryTables: ['books'],
          initialSql: '-- Stage 2: the sales table\n',
          solutionSql:
            "CREATE TABLE sales (sale_id INT PRIMARY KEY AUTO_INCREMENT, book_id INT NOT NULL, sale_date DATE NOT NULL, quantity INT NOT NULL CHECK (quantity > 0), unit_price DECIMAL(8,2) NOT NULL, FOREIGN KEY (book_id) REFERENCES books(book_id));",
          solutionExplanation: 'sales is the child of books: its only foreign key points at books, and quantity must always be at least 1.',
          hints: [
            { level: 1, text: 'Foreign key: FOREIGN KEY (book_id) REFERENCES books(book_id). CHECK (quantity > 0) guards the copy count.' },
          ],
          validation: { targetTable: 'sales', expectedRowCount: 1 },
          successMessage: 'The full 4-table schema is live. Now it is time to fill it.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
    {
      id: 'cap-seed',
      order: 3,
      title: 'Stage 3 - Seed the Bookstore',
      shortDescription: 'Load real data with multi-row INSERTs, letting AUTO_INCREMENT assign the keys.',
      theory: {
        summary:
          'The empty tables need data. With AUTO_INCREMENT primary keys, a parent insert gets its id for free, and children reference it. The unbreakable rule from the plan holds here: authors and publishers first, books second (they reference both parents), sales last (they reference books). Each insert is a single multi-row statement.',
        introTable: {
          tableName: 'AUTO_INCREMENT at work',
          description: 'Omit the id column and the engine numbers it, so children can reference it.',
          columns: ['INSERT', 'generated ids'],
          rows: [
            ["INSERT INTO authors (name) VALUES ('James Clear'), ('Michelle Obama'), ('Matt Haig')", 'author_id 1, 2, 3'],
            ['INSERT INTO books (…, author_id, …) VALUES (…, 1, …), (…, 2, …)', 'book_id 1, 2, … referencing authors'],
          ],
        },
        explanation: [
          'Because every id column is AUTO_INCREMENT, you never supply it: the engine assigns `1`, `2`, `3`… in sequence. So an authors insert simply lists names, and the books insert that follows can reference `author_id` values of `1`, `2`, `3` — the ids the authors insert just created.',
          '```sql\nINSERT INTO authors (name) VALUES\n  (\'James Clear\'),\n  (\'Michelle Obama\'),\n  (\'Matt Haig\');\n```',
          'QUESTION_BLOCK::FK::What happens if books tries to reference an author_id that was never inserted?',
          'The books insert lists each title with its `author_id` and `publisher_id`, its genre, price, and stock. The FOREIGN KEY constraints we wrote in Stage 2 check every one of those references: a book whose author_id does not exist is rejected on the spot, all-or-nothing.',
          'Finally sales inserts each purchase: which book (`book_id`), on what `sale_date`, how many copies (`quantity`), and the `unit_price` actually charged. With the four tables seeded, the JOIN and window queries of Stage 4 finally have something real to read.',
        ],
        targetQuery: {
          sql: "INSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (1, '2026-01-15', 3, 16.99), (2, '2026-01-20', 2, 14.50), (1, '2026-02-02', 5, 16.99), (4, '2026-02-14', 1, 14.00), (3, '2026-03-05', 4, 11.25);",
          explanation: 'A single multi-row insert of five sales, each referencing a book_id that already exists.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Seed the parents — authors and publishers',
            sqlSnippet: "INSERT INTO authors (name) VALUES ('James Clear'), …; INSERT INTO publishers (name) VALUES ('HarperCollins'), …;",
            explanation: 'Since ids are AUTO_INCREMENT, listing only the names is enough. The engine assigns 1, 2, 3… in order.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Seed books, referencing the generated ids',
            sqlSnippet: 'INSERT INTO books (title, author_id, publisher_id, …) VALUES (….);',
            explanation: 'Each book names the author_id and publisher_id created moments ago. The FK constraints verify every reference.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Seed sales, the child of books',
            sqlSnippet: "INSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (…);",
            explanation: 'Each sale points at an existing book_id, with a date, a positive quantity, and the price charged.',
          },
        ],
        keyTakeaway: 'Seeding in parent→child order, leaving ids to AUTO_INCREMENT, makes every reference valid: parents insert first, children point at the ids those inserts generated.',
        exampleQuery: "INSERT INTO publishers (name) VALUES ('HarperCollins'), ('Penguin Random House');",
        exampleQueryExplanation: 'A two-row insert that hands publishers the ids 1 and 2 for books to reference.',
        mcqs: [
          {
            question: 'How do child rows get valid foreign keys when you never type an id?',
            options: [
              'A. The engine guesses them',
              'B. AUTO_INCREMENT numbers the parents as you insert them, and children reference those generated ids',
              'C. They are always NULL',
              'D. Children regenerate their own ids',
            ],
            correctIndex: 1,
            explanation: 'AUTO_INCREMENT assigns 1, 2, 3… to parents on insert; the books/sales inserts that follow reference those values.',
          },
          {
            question: 'Which insert order satisfies every foreign key?',
            options: [
              'A. sales, books, authors, publishers',
              'B. authors & publishers, then books, then sales',
              'C. books, then sales, then authors',
              'D. Any order works because constraints are optional',
            ],
            correctIndex: 1,
            explanation: 'Parents first (authors, publishers), then books (their child), then sales (the child of books).',
          },
        ],
        commonMistakes: [
          'Inserting a child before its parent, tripping the FOREIGN KEY check.',
          'Manually numbering ids instead of letting AUTO_INCREMENT do it — which can collide with a generated id later.',
        ],
        masteryPoints: ['Seed parents before children', 'Write multi-row INSERTs that leave ids to AUTO_INCREMENT'],
      },
      tasks: [
        {
          id: 'cap-c3-t1',
          title: 'Task 1 (Guided): Seed the authors',
          description: 'Insert three authors. Omit the id column so AUTO_INCREMENT assigns it.',
          instructions: ["Insert into `authors (name)` the values 'James Clear', 'Michelle Obama', and 'Matt Haig' in one multi-row statement.", 'Do NOT supply author_id — AUTO_INCREMENT assigns 1, 2, 3.'],
          type: 'guided',
          primaryTable: 'authors',
          initialSql: '-- Stage 3: seed authors\n',
          solutionSql:
            "INSERT INTO authors (name) VALUES ('James Clear'), ('Michelle Obama'), ('Matt Haig');",
          solutionExplanation: 'AUTO_INCREMENT assigns author_id 1, 2, 3 — ready for books to reference.',
          hints: [{ level: 1, text: "INSERT INTO authors (name) VALUES ('James Clear'), ('Michelle Obama'), ('Matt Haig');" }],
          validation: { targetTable: 'authors', expectedRowCount: 3 },
          successMessage: 'Three authors seeded, ids 1-3 assigned automatically.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c3-t2',
          title: 'Task 2 (Independent): Seed the publishers',
          description: 'Insert two publishers — the second parent table.',
          instructions: ["Insert into `publishers (name)` the values 'HarperCollins' and 'Penguin Random House'.", 'AUTO_INCREMENT assigns publisher_id 1 and 2.'],
          type: 'independent',
          primaryTable: 'publishers',
          initialSql: '-- Stage 3: seed publishers\n',
          solutionSql:
            "INSERT INTO publishers (name) VALUES ('HarperCollins'), ('Penguin Random House');",
          solutionExplanation: 'Two publishers with generated ids 1 and 2.',
          hints: [{ level: 1, text: "INSERT INTO publishers (name) VALUES ('HarperCollins'), ('Penguin Random House');" }],
          validation: { targetTable: 'publishers', expectedRowCount: 2 },
          successMessage: 'Publishers seeded — both parents are now in place.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c3-t3',
          title: 'Task 3 (Independent): Seed the books',
          description: 'Insert four books referencing the author and publisher ids created above.',
          instructions: [
            "Insert into `books (title, author_id, publisher_id, genre, price, quantity_in_stock)`.",
            "Books: ('Atomic Habits', 1, 1, 'Self-Help', 16.99, 40), ('Becoming', 2, 2, 'Memoir', 14.50, 22), ('The Midnight Library', 3, 2, 'Fiction', 11.25, 30), ('Think Again', 1, 1, 'Self-Help', 14.00, 25).",
            'The FOREIGN KEY checks verify every author_id and publisher_id exists.',
          ],
          type: 'independent',
          primaryTable: 'books',
          secondaryTables: ['authors', 'publishers'],
          initialSql: '-- Stage 3: seed books\n',
          solutionSql:
            "INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Atomic Habits', 1, 1, 'Self-Help', 16.99, 40), ('Becoming', 2, 2, 'Memoir', 14.50, 22), ('The Midnight Library', 3, 2, 'Fiction', 11.25, 30), ('Think Again', 1, 1, 'Self-Help', 14.00, 25);",
          solutionExplanation: 'Four books, each referencing a generated author_id and publisher_id — the FK constraints confirm they all exist.',
          hints: [
            { level: 1, text: "Start: INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Atomic Habits', 1, 1, 'Self-Help', 16.99, 40), …" },
          ],
          validation: { targetTable: 'books', expectedRowCount: 4 },
          successMessage: 'Four books seeded and every foreign key verified.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c3-t4',
          title: 'Task 4 (Independent): Seed the sales',
          description: 'Insert five sales referencing the book ids, with a date, a positive quantity, and the price charged.',
          instructions: [
            "Insert into `sales (book_id, sale_date, quantity, unit_price)`.",
            "Sales: (1, '2026-01-15', 3, 16.99), (2, '2026-01-20', 2, 14.50), (1, '2026-02-02', 5, 16.99), (4, '2026-02-14', 1, 14.00), (3, '2026-03-05', 4, 11.25).",
            'Every book_id must exist in books — the FK constraint enforces it.',
          ],
          type: 'independent',
          primaryTable: 'sales',
          secondaryTables: ['books'],
          initialSql: '-- Stage 3: seed sales\n',
          solutionSql:
            "INSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (1, '2026-01-15', 3, 16.99), (2, '2026-01-20', 2, 14.50), (1, '2026-02-02', 5, 16.99), (4, '2026-02-14', 1, 14.00), (3, '2026-03-05', 4, 11.25);",
          solutionExplanation: 'Five sales, each tied to a real book, a valid date, a positive quantity, and the price charged.',
          hints: [{ level: 1, text: "Start: INSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (1, '2026-01-15', 3, 16.99), …" }],
          validation: { targetTable: 'sales', expectedRowCount: 5 },
          successMessage: 'All five sales seeded — the database now tells a real story.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
    {
      id: 'cap-query',
      order: 4,
      title: 'Stage 4 - Query the Business',
      shortDescription: 'Answer real questions with joins, aggregation, and window ranking.',
      theory: {
        summary:
          'With the schema seeded, you can answer the questions the store cares about. A 3-way JOIN turns raw ids into readable titles and names; GROUP BY + SUM computes revenue per author; and a window function over a grouped result ranks the best-sellers. Each mirrors a real dashboard query, and each only works because of the keys the earlier stages designed.',
        introTable: {
          tableName: 'sales joined outward',
          description: 'sales → books → authors & publishers gives readable business facts.',
          columns: ['sale_id', 'title (books)', 'author (authors)', 'publisher (publishers)', 'quantity'],
          rows: [
            [1, 'Atomic Habits', 'James Clear', 'HarperCollins', 3],
            [3, 'Atomic Habits', 'James Clear', 'HarperCollins', 5],
            [5, 'The Midnight Library', 'Matt Haig', 'Penguin Random House', 4],
          ],
        },
        explanation: [
          'A JOIN walks the relationships the schema stored as foreign keys. Starting FROM sales, JOIN books ON books.book_id = sales.book_id brings the title; JOIN authors ON authors.author_id = books.author_id brings the writer’s name — all three meet in one result.',
          '```sql\nSELECT b.title, a.name AS author, p.name AS publisher\nFROM sales s\nJOIN books b ON s.book_id = b.book_id\nJOIN authors a ON b.author_id = a.author_id\nJOIN publishers p ON b.publisher_id = p.publisher_id;\n```',
          'QUESTION_BLOCK::FANOUT::Why must you join, not just count raw sales rows, to report revenue per author?',
          'Aggregation answers the money questions. Grouping sales by author and summing `quantity * unit_price` gives revenue per author — the JOIN is the prerequisite, the GROUP BY the math.',
          'For the best-seller, rank WITHIN a grouped result: aggregate total quantity per book in a CTE, then RANK() OVER (ORDER BY total DESC) on top. This is the exact CTE + window pattern from Day 23.',
        ],
        targetQuery: {
          sql: 'WITH sold AS (SELECT b.title, SUM(s.quantity) AS total_sold FROM sales s JOIN books b ON s.book_id = b.book_id GROUP BY b.title) SELECT title, total_sold, RANK() OVER (ORDER BY total_sold DESC) AS sales_rank FROM sold;',
          explanation: 'Aggregate per book, then rank — the best-seller dashboard in one query.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Join sales → books → authors & publishers',
            sqlSnippet: 'FROM sales s JOIN books b ON s.book_id=b.book_id JOIN authors a ON b.author_id=a.author_id …',
            explanation: 'Each JOIN resolves a foreign key into readable data, walking the relationships you designed.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Aggregate revenue per author',
            sqlSnippet: 'SUM(s.quantity * s.unit_price) … GROUP BY a.name',
            explanation: 'Grouping by author and summing per-sale revenue answers "who earns us the most?".',
          },
          {
            stepNumber: 3,
            stepTitle: 'Rank best-sellers with a window over the grouped result',
            sqlSnippet: 'WITH sold AS (… GROUP BY b.title) SELECT …, RANK() OVER (ORDER BY total_sold DESC) …',
            explanation: 'Aggregate totals per book in a CTE, then rank them — the Day 23 pattern, reapplied.',
          },
        ],
        keyTakeaway: 'The schema you built unlocks the reporting: 3-way joins for readable facts, GROUP BY + SUM for revenue, and a CTE + RANK window for the best-seller board.',
        exampleQuery: 'SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue FROM sales s JOIN books b ON s.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id GROUP BY a.name;',
        exampleQueryExplanation: 'Revenue per author — join sales to authors through books, then aggregate by name.',
        mcqs: [
          {
            question: 'Why does revenue per author require a JOIN instead of just reading sales?',
            options: [
              'A. To add extra columns',
              'B. sales stores an author? No — sales only knows book_id; you must JOIN books and authors to discover which author',
              'C. To slow the query down',
              'D. Joins are always required',
            ],
            correctIndex: 1,
            explanation: 'sales has only book_id. Resolving that id to an author (or publisher) is exactly what the JOIN chain does.',
          },
          {
            question: 'What does the window RANK do on top of the grouped best-seller data?',
            options: [
              'A. It removes duplicate books',
              'B. It numbers each book by total sold without collapsing rows',
              'C. It deletes low sellers',
              'D. It is the same as ORDER BY alone',
            ],
            correctIndex: 1,
            explanation: 'RANK() OVER (ORDER BY total_sold DESC) appends a rank column to every grouped row — the leaderboard.',
          },
        ],
        commonMistakes: [
          'Joining the wrong direction (starting FROM authors instead of sales) and counting copies of each author row.',
          'Putting an aggregate in the WHERE clause instead of grouping it — the Day 9 trap, resurfacing in a real report.',
        ],
        masteryPoints: ['Write a 3-way JOIN from a child table', 'Aggregate revenue per group', 'Rank grouped results with a window function'],
      },
      tasks: [
        {
          id: 'cap-c4-t1',
          title: 'Task 1 (Guided): The 3-way JOIN — readable sales',
          description: 'Turn every sale into a readable row: book title, author, publisher, quantity, and unit price.',
          instructions: [
            'Select `b.title`, `a.name AS author`, `p.name AS publisher`, `s.quantity`, `s.unit_price`.',
            'FROM `sales s` JOIN `books b` ON s.book_id = b.book_id, then JOIN `authors a` ON b.author_id = a.author_id, then JOIN `publishers p` ON b.publisher_id = p.publisher_id.',
            'Expect one row per sale (5 rows).',
          ],
          type: 'guided',
          primaryTable: 'sales',
          secondaryTables: ['books', 'authors', 'publishers'],
          initialSql: '-- Stage 4: 3-way JOIN\n',
          solutionSql:
            "SELECT b.title, a.name AS author, p.name AS publisher, s.quantity, s.unit_price FROM sales s JOIN books b ON s.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id JOIN publishers p ON b.publisher_id = p.publisher_id;",
          solutionExplanation: 'Each foreign key walks one step to readable data: sales→books→authors and sales→books→publishers.',
          hints: [{ level: 1, text: 'FROM sales s JOIN books b ON s.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id JOIN publishers p ON b.publisher_id = p.publisher_id' }],
          validation: {
            targetTable: 'sales',
            requireJoin: true,
            requiredColumns: ['title', 'author', 'publisher', 'quantity', 'unit_price'],
            expectedRowCount: 5,
          },
          successMessage: 'Every sale is now readable — ids became titles and names.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c4-t2',
          title: 'Task 2 (Independent): Revenue per author',
          description: 'Alice, the store analyst, wants total revenue per author so she can see who drives earnings.',
          instructions: [
            'Select `a.name AS author` and `SUM(s.quantity * s.unit_price) AS revenue`.',
            'Joining sales→books→authors, GROUP BY a.name.',
            'Expect exactly 3 rows — one per author.',
          ],
          type: 'independent',
          primaryTable: 'sales',
          secondaryTables: ['books', 'authors'],
          initialSql: '-- Stage 4: revenue per author\n',
          solutionSql:
            "SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue FROM sales s JOIN books b ON s.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id GROUP BY a.name;",
          solutionExplanation: 'Grouping the joined rows by author and summing quantity × unit_price yields revenue per author.',
          hints: [{ level: 1, text: 'SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue FROM … GROUP BY a.name' }],
          validation: {
            targetTable: 'sales',
            requireJoin: true,
            requireGroupBy: true,
            requiredColumns: ['author', 'revenue'],
            expectedRowCount: 3,
          },
          successMessage: 'Revenue by author computed — James Clear leads the store.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c4-t3',
          title: 'Task 3 (Independent): Rank the best-sellers with a window',
          description: 'The marketing team needs a ranked best-seller board: aggregate copies sold per book, then rank by that total.',
          instructions: [
            'Build a CTE `sold` that selects `b.title` and `SUM(s.quantity) AS total_sold`, joining sales to books and grouping by title.',
            'Then `SELECT title, total_sold, RANK() OVER (ORDER BY total_sold DESC) AS sales_rank FROM sold`.',
            'Expect 4 rows — one per book, ranked by copies sold.',
          ],
          type: 'independent',
          primaryTable: 'sales',
          secondaryTables: ['books'],
          initialSql: '-- Stage 4: best-seller ranking\n',
          solutionSql:
            'WITH sold AS (SELECT b.title, SUM(s.quantity) AS total_sold FROM sales s JOIN books b ON s.book_id = b.book_id GROUP BY b.title) SELECT title, total_sold, RANK() OVER (ORDER BY total_sold DESC) AS sales_rank FROM sold;',
          solutionExplanation: 'Aggregate copies per book in a CTE, then rank those grouped totals — the Day 23 CTE + window pipeline.',
          hints: [
            { level: 1, text: 'WITH sold AS (SELECT b.title, SUM(s.quantity) AS total_sold FROM sales s JOIN books b ON s.book_id = b.book_id GROUP BY b.title) SELECT title, total_sold, RANK() OVER (ORDER BY total_sold DESC) AS sales_rank FROM sold;' },
          ],
          validation: {
            targetTable: 'sales',
            requireJoin: true,
            requireGroupBy: true,
            requiredColumns: ['title', 'total_sold', 'sales_rank'],
            expectedRowCount: 4,
          },
          successMessage: 'The best-seller board is ranked — Atomic Habits takes #1.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
    {
      id: 'cap-evolve',
      order: 5,
      title: 'Stage 5 - Evolve the Bookstore',
      shortDescription: 'Grow the schema live, prove speed with an index, and protect a batch with a transaction.',
      theory: {
        summary:
          'Databases are never finished. This final stage exercises the operability skills: ALTER TABLE adds a column to the live books table without losing data; CREATE INDEX + EXPLAIN proves a filter jumps from a full scan to an indexed lookup; and a transaction with ROLLBACK shows how to experiment safely and undo it. The schema you built in earlier stages now grows instead of being rebuilt.',
        introTable: {
          tableName: 'The evolution',
          description: 'Three ways a live bookstore schema keeps changing.',
          columns: ['Change', 'Tool'],
          rows: [
            ['Add an edition column to books', 'ALTER TABLE books ADD COLUMN …'],
            ['Make title lookups fast', 'CREATE INDEX + EXPLAIN'],
            ['Experiment safely, then undo', 'BEGIN … ROLLBACK'],
          ],
        },
        explanation: [
          'Adding a column is non-destructive: `ALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT \'first\'` grows the schema and backfills every existing row — none of your seed data is lost.',
          '```sql\nALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT \'first\';\n```',
          'QUESTION_BLOCK::SCAN::Without an index, how does the engine find a specific title?',
          'A title filter triggers a full table scan. `CREATE INDEX idx_books_title ON books(title);` adds a B-tree, and EXPLAIN shows `type: ref` with `key: idx_books_title` instead of `type: ALL`. That is proof, not guesswork.',
          'Transactions make risky changes reversible. `BEGIN` snapshots the whole database; an INSERT inside it is invisible and safe to undo — `ROLLBACK` restores the exact pre-change state, so you can test a batch with zero risk.',
        ],
        targetQuery: {
          sql: "CREATE INDEX idx_books_title ON books(title);\nEXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';",
          explanation: 'Create the index, then let EXPLAIN prove the filter no longer scans.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Add a column without losing data',
            sqlSnippet: "ALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT 'first';",
            explanation: 'ALTER grows the live table and backfills every existing row with the default — no data loss.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Speed up a filter with an index and prove it',
            sqlSnippet: "CREATE INDEX idx_books_title ON books(title);\nEXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';",
            explanation: 'The filter jumps from a full scan (type: ALL) to an indexed lookup (type: ref, key: idx_books_title).',
          },
          {
            stepNumber: 3,
            stepTitle: 'Experiment inside a transaction, then roll back',
            sqlSnippet: 'BEGIN; INSERT …; ROLLBACK;',
            explanation: 'BEGIN snapshots the database; ROLLBACK restores it — a safe sandbox for a risky batch.',
          },
        ],
        keyTakeaway: 'A live schema evolves: ALTER adds columns safely, an index makes filters fast (proven by EXPLAIN), and a transaction lets you experiment and undo with zero risk.',
        exampleQuery: "ALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT 'first';",
        exampleQueryExplanation: 'A non-destructive schema change on the live table.',
        mcqs: [
          {
            question: 'What does ALTER TABLE … ADD COLUMN … DEFAULT do to existing rows?',
            options: [
              'A. It deletes them',
              'B. It backfills them with the default value so no data is lost',
              'C. It requires a SELECT first',
              'D. It only affects new rows and clears old ones',
            ],
            correctIndex: 1,
            explanation: 'The DEFAULT fills the new column on every existing row — the table and its data survive the change.',
          },
          {
            question: 'What does EXPLAIN prove after you CREATE INDEX?',
            options: [
              'A. The query returns more rows',
              'B. The plan type changed from ALL (scan) to ref (indexed lookup)',
              'C. The index was deleted',
              'D. Nothing at all',
            ],
            correctIndex: 1,
            explanation: 'EXPLAIN lets you SEE the access method; ref + your index name is proof the lookup is now indexed.',
          },
          {
            question: 'How does ROLLBACK protect an experiment?',
            options: [
              'A. It re-runs the INSERT',
              'B. It restores the exact pre-transaction state, undoing everything inside the BEGIN',
              'C. It commits the changes',
              'D. It locks the table forever',
            ],
            correctIndex: 1,
            explanation: 'ROLLBACK restores the snapshot taken at BEGIN, so the INSERT (and any other change) is completely undone.',
          },
        ],
        commonMistakes: [
          'Dropping and recreating a table to add a column — that orphans every foreign key pointing at it.',
          'Trusting an index exists without proving it with EXPLAIN.',
          'Forgetting the COMMIT/ROLLBACK, leaving the transaction mid-air.',
        ],
        masteryPoints: ['Add a backfilled column with ALTER', 'Prove an index with EXPLAIN', 'Run and undo a batch inside a transaction'],
      },
      tasks: [
        {
          id: 'cap-c5-t1',
          title: 'Task 1 (Guided): Add an edition column to books',
          description: 'The store now sells multiple editions. Add an `edition` column to the live books table with a default so every existing row gets a value.',
          instructions: [
            "Run `ALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT 'first';`",
            'The DEFAULT backfills all existing books rows.',
          ],
          type: 'guided',
          primaryTable: 'books',
          initialSql: '-- Stage 5: add the edition column\n',
          solutionSql: "ALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT 'first';",
          solutionExplanation: 'ALTER grows the live table; the DEFAULT backfills existing rows so no data is lost.',
          hints: [{ level: 1, text: "ALTER TABLE books ADD COLUMN edition VARCHAR(20) DEFAULT 'first';" }],
          validation: { targetTable: 'books', expectedRowCount: 1 },
          successMessage: 'books grew an edition column — the schema evolved live.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c5-t2',
          title: 'Task 2 (Independent): Index titles and prove it with EXPLAIN',
          description: 'Title lookups are slow. Create an index on books(title), then EXPLAIN a title filter to confirm it no longer scans.',
          instructions: [
            'Run `CREATE INDEX idx_books_title ON books(title);`.',
            "Then `EXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';`.",
            'Expect type: ref with key: idx_books_title (not ALL).',
          ],
          type: 'independent',
          primaryTable: 'books',
          initialSql: '-- Stage 5: index + explain\n',
          solutionSql: "CREATE INDEX idx_books_title ON books(title);\nEXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';",
          solutionExplanation: 'The index turns the title filter from a full scan into a ref lookup, proven by EXPLAIN.',
          hints: [{ level: 1, text: "CREATE INDEX idx_books_title ON books(title); then EXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';" }],
          validation: {
            targetTable: 'books',
            requiredColumns: ['type', 'key'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'ref' && row.key === 'idx_books_title'
                ? { valid: true }
                : { valid: false, message: `Expected ref with key idx_books_title. Got ${row?.type ?? '?'}/${row?.key ?? '?'}. Create the index, then EXPLAIN the title filter.` };
            },
          },
          successMessage: 'Proven: the title lookup is now an indexed ref, not a scan.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'cap-c5-t3',
          title: 'Task 3 (Challenge): The Rollback Lab',
          description: 'Test adding a book inside a transaction, then roll it back and prove the count returned to 4 — atomicity in action.',
          instructions: [
            'Open a transaction with `BEGIN;`.',
            "Insert a temporary book: `INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Rollback Me', 1, 1, 'Test', 9.99, 5);`",
            'Undo it with `ROLLBACK;`, then run `SELECT COUNT(*) AS cnt FROM books;`.',
            'The count must be back to 4 — the insert was undone.',
          ],
          type: 'challenge',
          primaryTable: 'books',
          initialSql: '-- Stage 5: rollback lab\n',
          solutionSql:
            "BEGIN; INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Rollback Me', 1, 1, 'Test', 9.99, 5); ROLLBACK; SELECT COUNT(*) AS cnt FROM books;",
          solutionExplanation: 'BEGIN snapshots the 4-book state; the INSERT adds a 5th; ROLLBACK restores the snapshot; the SELECT proves 4 rows remain.',
          hints: [{ level: 1, text: 'BEGIN; INSERT INTO books (…) VALUES (…); ROLLBACK; SELECT COUNT(*) AS cnt FROM books;' }],
          validation: {
            targetTable: 'books',
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const cnt = Number(result?.rows?.[0]?.cnt);
              return cnt === 4
                ? { valid: true }
                : { valid: false, message: `Expected 4 books after ROLLBACK (the insert must be undone). Got ${cnt ?? '?'}.` };
            },
          },
          successMessage: 'Atomicity proven: the rolled-back insert left the table unchanged.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
  ],
  challenge: {
    id: 'capstone-bookstore-challenge',
    title: 'Day 32 Capstone - SQLens Bookstore (Ending Activity)',
    scenario:
      'The COO wants one clean, replayable migration that rebuilds the Bookstore from scratch: create the full 4-table schema, seed it, answer the leadership revenue dashboard, and keep the catalog fast. Prove the whole pipeline end to end.',
    databaseLifecycle: 'inherit',
    tasks: [
      {
        id: 'cap-ch-t1',
        title: 'Task 1: Create the full schema from scratch',
        description: 'Create all four tables in one script, parents before children, with every constraint.',
        instructions: [
          'Create `publishers (publisher_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE)`.',
          'Create `authors (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL)`.',
          'Create `books` with its constraint ladder and both foreign keys.',
          'Create `sales` as the child of books.',
        ],
        type: 'challenge',
        primaryTable: 'books',
        secondaryTables: ['publishers', 'authors', 'sales'],
        initialSql: '-- Capstone Task 1: the schema from scratch\n',
        solutionSql:
          "CREATE TABLE publishers (publisher_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE);\nCREATE TABLE authors (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL);\nCREATE TABLE books (book_id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200) NOT NULL, author_id INT NOT NULL, publisher_id INT NOT NULL, genre VARCHAR(50) NOT NULL, price DECIMAL(8,2) NOT NULL CHECK (price >= 0), quantity_in_stock INT NOT NULL DEFAULT 0, FOREIGN KEY (author_id) REFERENCES authors(author_id), FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id));\nCREATE TABLE sales (sale_id INT PRIMARY KEY AUTO_INCREMENT, book_id INT NOT NULL, sale_date DATE NOT NULL, quantity INT NOT NULL CHECK (quantity > 0), unit_price DECIMAL(8,2) NOT NULL, FOREIGN KEY (book_id) REFERENCES books(book_id));",
        solutionExplanation: 'Parents (publishers, authors) first, then books (their child), then sales (the child of books) — the full constraint ladder rebuilt in one script.',
        hints: [{ level: 1, text: 'Order matters: publishers and authors before books, and books before sales, so every foreign key reference exists.' }],
        validation: { targetTable: 'books', expectedRowCount: 1 },
        successMessage: 'The whole schema is recreated from nothing.',
        databaseLifecycle: 'inherit',
      },
      {
        id: 'cap-ch-t2',
        title: 'Task 2: Seed the whole store',
        description: 'Load every table with multi-row INSERTs, letting AUTO_INCREMENT assign the ids (parents first).',
        instructions: [
          "Insert 3 authors and 2 publishers.",
          "Insert 4 books referencing the generated author and publisher ids.",
          "Insert 5 sales referencing the generated book ids.",
        ],
        type: 'challenge',
        primaryTable: 'sales',
        secondaryTables: ['authors', 'publishers', 'books'],
        initialSql: '-- Capstone Task 2: seed the store\n',
        solutionSql:
          "INSERT INTO authors (name) VALUES ('James Clear'), ('Michelle Obama'), ('Matt Haig');\nINSERT INTO publishers (name) VALUES ('HarperCollins'), ('Penguin Random House');\nINSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Atomic Habits', 1, 1, 'Self-Help', 16.99, 40), ('Becoming', 2, 2, 'Memoir', 14.50, 22), ('The Midnight Library', 3, 2, 'Fiction', 11.25, 30), ('Think Again', 1, 1, 'Self-Help', 14.00, 25);\nINSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (1, '2026-01-15', 3, 16.99), (2, '2026-01-20', 2, 14.50), (1, '2026-02-02', 5, 16.99), (4, '2026-02-14', 1, 14.00), (3, '2026-03-05', 4, 11.25);",
        solutionExplanation: 'Seed in parent→child order so every foreign key reference is valid: authors and publishers, then books, then sales.',
        hints: [{ level: 1, text: 'Authors and publishers first (they have no dependencies), then books (reference both), then sales (reference books). Let AUTO_INCREMENT number every id.' }],
        validation: { targetTable: 'sales', expectedRowCount: 5 },
        successMessage: 'The full store is seeded — a complete, queryable catalog.',
        databaseLifecycle: 'inherit',
      },
      {
        id: 'cap-ch-t3',
        title: 'Task 3: The leadership revenue dashboard',
        description: 'Answer the COO: total revenue per author, richest first.',
        instructions: [
          'Select `a.name AS author` and `SUM(s.quantity * s.unit_price) AS revenue`.',
          'Join sales→books→authors and GROUP BY a.name.',
          'Order by revenue descending. Expect exactly 3 rows.',
        ],
        type: 'challenge',
        primaryTable: 'sales',
        secondaryTables: ['books', 'authors'],
        initialSql: '-- Capstone Task 3: revenue per author\n',
        solutionSql:
          "SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue FROM sales s JOIN books b ON s.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id GROUP BY a.name ORDER BY revenue DESC;",
        solutionExplanation: 'The 3-way JOIN feeds the GROUP BY: revenue per author, sorted richest-first.',
        hints: [{ level: 1, text: 'SELECT a.name AS author, SUM(s.quantity * s.unit_price) AS revenue FROM sales s JOIN books b ON s.book_id=b.book_id JOIN authors a ON b.author_id=a.author_id GROUP BY a.name ORDER BY revenue DESC;' }],
        validation: {
          targetTable: 'sales',
          requireJoin: true,
          requireGroupBy: true,
          requiredColumns: ['author', 'revenue'],
          expectedRowCount: 3,
        },
        successMessage: 'Dashboard delivered — James Clear is the top earner.',
        databaseLifecycle: 'inherit',
      },
      {
        id: 'cap-ch-t4',
        title: 'Task 4: Keep the catalog fast',
        description: 'Add an index on books(title), then prove with EXPLAIN that a title lookup no longer scans.',
        instructions: [
          'Run `CREATE INDEX idx_books_title ON books(title);`.',
          "Then `EXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';`.",
          'Expect type: ref with key: idx_books_title.',
        ],
        type: 'challenge',
        primaryTable: 'books',
        initialSql: '-- Capstone Task 4: index + proof\n',
        solutionSql:
          "CREATE INDEX idx_books_title ON books(title);\nEXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';",
        solutionExplanation: 'The index turns the title filter into an indexed ref lookup — proven by EXPLAIN.',
        hints: [{ level: 1, text: "CREATE INDEX idx_books_title ON books(title); then EXPLAIN SELECT * FROM books WHERE title = 'Atomic Habits';" }],
        validation: {
          targetTable: 'books',
          requiredColumns: ['type', 'key'],
          expectedRowCount: 1,
          customValidator: (parsed: any, result: any) => {
            const row = result?.rows?.[0];
            return row && row.type === 'ref' && row.key === 'idx_books_title'
              ? { valid: true }
              : { valid: false, message: `Expected ref with key idx_books_title. Got ${row?.type ?? '?'}/${row?.key ?? '?'}.` };
          },
        },
        successMessage: 'Capstone complete — schema, seed, dashboard, and index, all from scratch.',
        databaseLifecycle: 'inherit',
      },
    ],
  },
};
















