import { ModuleData } from '../../types/curriculum';

export const Day_34_MODULE: ModuleData = {
  id: 'day-34',
  slug: 'project-part-3-integration-queries',
  day: 34,
  title: 'Day 34 - Apply Skills to Backend API: Production Integration Queries',
  shortTitle: 'Project: Backend API Queries',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Write production-ready integration queries: product detail view payloads, customer profile order histories, and executive dashboard KPIs delivered in single round trips - eliminating chatty network calls.',
  estimatedMinutes: 120,
  completionLearnings: [
    'Build single-payload Product Detail Page queries joining products, categories, and suppliers',
    'Hydrate customer profile screens with distinct order counts and monetary spend metrics',
    'Generate executive KPI dashboards in one query to eliminate API round-trip latency',
  ],
  concepts: [
    {
      id: 'full-stack-query-patterns',
      order: 1,
      title: '1. Production Backend API Query Patterns',
      shortDescription: 'Product detail pages, customer profiles, and executive KPIs.',
      theory: {
        summary: 'In real full-stack web applications, backend route handlers issue rich SQL queries to hydrate entire UI screens in a single database round trip, avoiding chatty network calls.',
        introTable: {
          tableName: 'products & categories & suppliers',
          description: 'Data sources for single-payload Product Detail View',
          columns: ['p.name', 'p.price', 'c.name (Category)', 's.name (Supplier)'],
          rows: [
            ['Wireless Mouse', 15.99, 'Accessories', 'LogiTech Direct'],
            ['Mechanical Keyboard', 65.00, 'Electronics', 'KeyChron Components'],
          ],
        },
        explanation: [
          '### 1. The Single-Payload Product Detail View (`GET /api/products/:id`)',
          'Instead of 3 separate queries, join `products` $\\rightarrow$ `categories` $\\rightarrow$ `suppliers` in one query.',
          '### 2. The Customer Profile Endpoint (`GET /api/customers/:id`)',
          'Combines customer attributes with distinct order counts and lifetime spend totals.',
          '### 3. The Executive Dashboard KPI Endpoint (`GET /api/admin/dashboard`)',
          'Aggregates total distinct orders and grand total revenue in a single pass.',
        ],
        targetQuery: {
          sql: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
          explanation: 'Hydrate an entire production product detail view across 3 joined tables in 1 database round trip.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Hydrating Product Detail Payload',
            sqlSnippet: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
            explanation: 'Consolidates product attributes, category label, and supplier info in 1 query.',
            tableData: {
              tableName: 'Hydrated View Payload',
              columns: ['product_id', 'name', 'price', 'category_name', 'supplier_name'],
              highlightedColumns: ['name', 'category_name', 'supplier_name'],
              rows: [
                [1, 'Wireless Mouse', 15.99, 'Accessories', 'LogiTech Direct'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Product detail page backend query',
            sql: 'SELECT p.product_id, p.name, p.price, p.quantity_in_stock,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
            description: 'Hydrates a full product detail view in 1 round trip.',
          },
        ],
        keyTakeaway: 'Design comprehensive multi-table queries that satisfy full UI view requirements in a single round trip.',
        exampleQuery: 'SELECT p.product_id, p.name, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        exampleQueryExplanation: 'Hydrates detail view for product 1.',
        liveDemoSql: 'SELECT p.product_id, p.name, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        liveDemoNotes: 'Displays product detail payload.',
        mcqs: [
          {
            question: 'Why is it preferable to fetch all product page details in a single joined query rather than multiple separate queries?',
            options: [
              'A. It minimizes network latency and round trips between backend API and database',
              'B. SQL only allows 1 query per hour',
              'C. It saves hard drive space',
              'D. It disables indexes',
            ],
            correctIndex: 0,
            explanation: 'Consolidating into a single query eliminates unnecessary network latency round trips.',
          },
        ],
        masteryPoints: ['Write multi-entity UI hydration queries', 'Construct executive KPI summaries'],
      },
      tasks: [
        {
          id: 'day22-c1-t1',
          title: 'Mission 1 (Guided): Product Detail View Endpoint Query',
          description: 'Retrieve product information with category name and supplier name for `product_id = 1`.',
          instructions: [
            'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['categories', 'suppliers'],
          initialSql: '-- Mission 1: Product detail page query\n',
          solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
          solutionExplanation: 'Hydrates the product detail view across 3 joined tables in one round trip.',
          hints: [{ level: 1, text: 'Use `WHERE p.product_id = 1;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requireJoin: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Mission 1 complete! Product detail endpoint query verified.',
        },
        {
          id: 'day22-c1-t2',
          title: 'Mission 2 (Independent): Executive Dashboard KPI Summary Query',
          description: 'Calculate overall total distinct orders and grand total revenue in a single query.',
          instructions: [
            'Query `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
            'Select `COUNT(DISTINCT o.order_id) AS total_orders` and `SUM(oi.quantity * oi.unit_price) AS total_revenue`.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- Executive dashboard summary\n',
          solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
          solutionExplanation: 'Two aggregates in a single pass — total orders and total revenue — so the dashboard gets its headline numbers without extra round-trips.',
          hints: [{ level: 1, text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'orders',
            requireJoin: true,
            expectedRowCount: 1,
          },
          successMessage: 'Mission 2 complete! Executive dashboard KPI query verified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 22 CHALLENGE: DELIVER THE BACKEND API ENDPOINT QUERY SUITE (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-34-homework',
    title: 'Day 34 — Deliver the Backend API Endpoint Query Suite (Ending Activity)',
    scenario: 'Construct the production backend integration queries independently:',
    tasks: [
      {
        id: 'day22-hw-1',
        title: 'Endpoint 1: "Get Product Detail Page" Query',
        description: 'Product info + category name + supplier name for product 1.',
        instructions: [
          'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['categories', 'suppliers'],
        initialSql: '-- Endpoint 1: Product Detail Page query\n',
        solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        solutionExplanation: 'Multi-table join hydrating the full product page payload.',
        hints: [{ level: 1, text: 'Use `WHERE p.product_id = 1;`' }],
        validation: {
          requireExactResult: true,
          targetTable: 'products',
          requireJoin: true,
          requireWhere: true,
          expectedRowCount: 1,
        },
        successMessage: 'Endpoint 1 verified! Product detail query active.',
      },
      {
        id: 'day22-hw-2',
        title: 'Endpoint 2: "Executive Dashboard KPI Query" (Revenue & Orders)',
        description: 'Calculate grand total revenue and total distinct order count in a single query.',
        instructions: [
          'Select `COUNT(DISTINCT o.order_id) AS total_orders`, `SUM(oi.quantity * oi.unit_price) AS total_revenue` from `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Endpoint 2: Executive Dashboard KPI Query\n',
        solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
        solutionExplanation: 'Computes high-level KPI metrics in a single query.',
        hints: [{ level: 1, text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`' }],
        validation: {
          requireExactResult: true,
          targetTable: 'orders',
          requireJoin: true,
          expectedRowCount: 1,
        },
        successMessage: 'Endpoint 2 verified! Executive KPI summary verified.',
      },
    ],
  },
};
