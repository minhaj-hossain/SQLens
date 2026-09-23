import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 55 — Users, Roles & Least Privilege (id: day-55 — order 55)
// Milestone 4, Phase 5: Operate
//   C1 Principals, Users & Roles (CREATE USER, CREATE ROLE)
//   C2 The Principle of Least Privilege (GRANT, REVOKE)
//   C3 Secure Views as Access Boundaries (Masking & Tenant Isolation)
// =============================================================================
export const Day_55_MODULE: ModuleData = {
  id: 'day-55',
  slug: 'users-roles-least-privilege',
  day: 55,
  title: 'Day 55 — Users, Roles & Least Privilege',
  shortTitle: 'Security & Least Privilege',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Giving your web application root database access is an invitation for disaster. In this module, you will master database security principles: creating scoped roles, enforcing the Principle of Least Privilege with GRANT and REVOKE, and using secure database views as airtight access boundaries.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Define the Principle of Least Privilege and why root access is forbidden in production',
    'Create dedicated database roles and grant granular permissions with GRANT and REVOKE',
    'Use secure database views to hide sensitive columns from unauthorized users',
    'Implement tenant boundary views to prevent cross-tenant data leaks',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Principals, Users & Roles
    // -------------------------------------------------------------------------
    {
      id: 'users-and-roles',
      order: 1,
      title: 'Principals, Users & Roles',
      shortDescription: 'Separate administrative power from application and reporting accounts.',
      theory: {
        summary:
          'A production database has multiple types of actors: backend apps, data analysts, automated migration scripts, and human administrators. Instead of assigning permissions to individuals, modern databases group permissions into ROLES and assign roles to USERS.',
        targetQuery: {
          sql: 'CREATE ROLE analyst_role;\nCREATE USER analyst_jane;\nGRANT analyst_role TO analyst_jane;',
          explanation: 'The RBAC trio: bundle privileges into a role, create a principal, then attach one to the other.',
          badge: "The provisioning script we'll dissect",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Bundle privileges',
            sqlSnippet: 'CREATE ROLE analyst_role',
            clause: 'CREATE ROLE',
            explanation: 'The role is the permission container — grant SELECT to the role once, not to every analyst account.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Create the principal',
            sqlSnippet: 'CREATE USER analyst_jane',
            clause: 'CREATE USER',
            explanation: 'The user is the login identity — it starts with no table privileges at all.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Attach the role',
            sqlSnippet: 'GRANT analyst_role TO analyst_jane',
            clause: 'GRANT',
            explanation: "Jane inherits everything the role holds; change the role's grants later and every member follows automatically.",
          },
        ],
        introTable: {
          tableName: 'RBAC actors and their privilege ceilings',
          description: 'The three production actors from this concept: each role gets exactly what it needs — and nothing it must never hold.',
          columns: ['role', 'needs', 'must never have'],
          rows: [
            ['App Server', 'SELECT, INSERT, UPDATE', 'DROP TABLE, ALTER TABLE'],
            ['Analyst / BI', 'SELECT only', 'row mutation, raw passwords'],
            ['Migration Runner', 'CREATE/ALTER TABLE (deploy time)', 'always-on application access'],
          ],
        },
        explanation: [
          'Why role-based access control (RBAC) matters:',
          '- **App Server Role**: Needs SELECT, INSERT, UPDATE on core tables. Should NEVER have DROP TABLE or ALTER TABLE permissions.',
          '- **Analyst / BI Role**: Needs SELECT only. Should NEVER be able to mutate rows or see raw passwords/credit card numbers.',
          '- **Migration Runner**: Needs DDL permissions (CREATE/ALTER TABLE) but is only invoked during deployments.',
          'Standard SQL syntax:',
          '```sql\nCREATE ROLE read_only_analyst;\nCREATE USER bi_dashboard IDENTIFIED BY \'secure_password\';\nGRANT read_only_analyst TO bi_dashboard;\n```',
          'QUESTION_BLOCK::BEFORE::Why should your web application connection never use the root or postgres superuser account?',
          'QUESTION_BLOCK::AFTER::Because if an attacker discovers an SQL injection vulnerability in your application, superuser access allows them to drop tables, access internal database files, or take over the operating system.',
        ],
        syntaxBlocks: [
          {
            title: 'Creating roles and users',
            sql: '-- Define a role and user:\nCREATE ROLE reporting_role;\nCREATE USER bi_app;\nGRANT reporting_role TO bi_app;',
            description:
              'Roles bundle permissions together. Users inherit all privileges granted to their assigned roles.',
          },
        ],
        keyTakeaway:
          'Never use superuser accounts in applications. Create purpose-built roles for application servers, background workers, and analysts.',
        exampleQuery:
          'CREATE ROLE analyst_role;\nCREATE USER analyst_jane;\nGRANT analyst_role TO analyst_jane;',
        exampleQueryExplanation:
          'Creates a dedicated role, a user account, and links them together.',
        liveDemoSql:
          'CREATE ROLE reporting_role;\nCREATE USER analyst_bob;\nGRANT reporting_role TO analyst_bob;\nSELECT 1 AS status;',
        liveDemoNotes:
          'Security management commands are DDL operations.',
        mcqs: [
          {
            question: 'What is the main advantage of assigning privileges to ROLES rather than individual USERS?',
            options: [
              'A. Roles bypass SQL validation',
              'B. Roles make permissions manageable: when an employee leaves or joins, you change their role assignment without rewriting table permissions',
              'C. Roles automatically encrypt the database tables',
              'D. Roles make queries run faster',
            ],
            correctIndex: 1,
            explanation:
              'Roles provide maintainable access control. Updating role permissions automatically updates all users assigned to that role.',
          },
        ],
        commonMistakes: [
          'Granting ALL PRIVILEGES ON *.* to an application service account.',
        ],
      },
      tasks: [
        {
          id: 'day55-t1',
          title: 'Provision a Secure Reporting View and Role',
          description:
            'Create a public view of suppliers exposing only supplier_id and name (hiding email), create a reporting role, and grant SELECT permission on the view.',
          instructions: [
            'CREATE VIEW v_public_suppliers AS SELECT supplier_id, name FROM suppliers',
            'CREATE ROLE reporting_role',
            'GRANT SELECT ON v_public_suppliers TO reporting_role',
            'SELECT * FROM v_public_suppliers',
          ],
          type: 'guided',
          primaryTable: 'suppliers',
          setupSql: '',
          initialSql: '-- Create masked supplier view and grant access to reporting role\n\n\n\n',
          solutionSql:
            'CREATE VIEW v_public_suppliers AS SELECT supplier_id, name FROM suppliers;\nCREATE ROLE reporting_role;\nGRANT SELECT ON v_public_suppliers TO reporting_role;\nSELECT * FROM v_public_suppliers;',
          solutionExplanation:
            'This creates a masked view without contact_email, sets up a dedicated reporting role, grants SELECT permission on the view, and verifies the view output.',
          hints: [
            { level: 1, text: 'Separate your statements with semicolons: CREATE VIEW ..., then CREATE ROLE ..., then GRANT ..., then SELECT * ...' },
            { level: 2, text: 'CREATE VIEW v_public_suppliers AS SELECT supplier_id, name FROM suppliers;\nCREATE ROLE reporting_role;\nGRANT SELECT ON v_public_suppliers TO reporting_role;\nSELECT * FROM v_public_suppliers;' },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Role and secure view provisioned! Confidential contact emails are hidden from this role.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Least Privilege & Tenant Boundaries
    // -------------------------------------------------------------------------
    {
      id: 'least-privilege-tenancy',
      order: 2,
      title: 'Tenant Isolation via Secure Views',
      shortDescription: 'Restrict regional staff or tenant users to only their slice of data.',
      theory: {
        summary:
          'In multi-tenant SaaS applications or regional franchises, users from one territory must never see data from another. A secure filtered view enforces this boundary at the database layer.',
        introTable: {
          tableName: 'v_dhaka_cust (engine output)',
          description: "Engine output of the live demo's SELECT * FROM v_dhaka_cust — only Dhaka customers cross the boundary; every other city is invisible through this view.",
          columns: ['customer_id', 'name', 'city'],
          rows: [
            [1, 'Rafiul Islam', 'Dhaka'],
            [2, 'Priya Akter', 'Dhaka'],
            [6, 'Farhana Rahman', 'Dhaka'],
            [8, 'Mim Akter', 'Dhaka'],
            [11, 'Imran Hossain', 'Dhaka'],
            [15, 'Jahid Karim', 'Dhaka'],
          ],
        },
        explanation: [
          'If you rely solely on application code (`WHERE tenant_id = 42`), a developer could forget the WHERE clause in a new endpoint, causing a catastrophic cross-tenant data leak.',
          'Database-enforced isolation:',
          'By pointing the tenant\'s database user directly at a VIEW (`CREATE VIEW v_dhaka_customers AS SELECT * FROM customers WHERE city = \'Dhaka\';`), the database physically refuses to return any rows outside Dhaka — regardless of what the application queries!',
          'QUESTION_BLOCK::BEFORE::Why is security at the database layer safer than relying exclusively on application code?',
          'QUESTION_BLOCK::AFTER::Application code changes constantly across hundreds of endpoints and developers. Database views provide a single, immovable security perimeter that cannot be forgotten or bypassed by a missing WHERE clause.',
        ],
        syntaxBlocks: [
          {
            title: 'Tenant isolation view pattern',
            sql: 'CREATE VIEW v_tenant_orders AS\nSELECT order_id, order_date, status\nFROM orders\nWHERE customer_id = 1;\n\nGRANT SELECT ON v_tenant_orders TO customer_role;\nSELECT * FROM v_tenant_orders;',
            description:
              'The view acts as a security boundary, filtering out all other customers permanently.',
          },
        ],
        keyTakeaway:
          'Database views act as security boundaries. Combined with GRANT, they guarantee that users and roles cannot query data outside their authorized domain.',
        exampleQuery:
          "CREATE VIEW v_sylhet_cust AS SELECT customer_id, name, city FROM customers WHERE city = 'Sylhet';\nSELECT * FROM v_sylhet_cust;",
        exampleQueryExplanation:
          'Only Sylhet customers are exposed through this view boundary.',
        liveDemoSql:
          "CREATE VIEW v_dhaka_cust AS SELECT customer_id, name, city FROM customers WHERE city = 'Dhaka';\nSELECT * FROM v_dhaka_cust;",
        liveDemoNotes:
          'Notice how non-Dhaka customers are completely omitted from the view.',
        mcqs: [
          {
            question: 'What happens when a user queries a view defined with WHERE city = "Dhaka"?',
            options: [
              'A. The database asks the user for a password',
              'B. Only rows where city equals "Dhaka" are accessible, regardless of what the user writes in their SELECT',
              'C. The entire table is deleted',
              'D. The query fails with a permission error',
            ],
            correctIndex: 1,
            explanation:
              'The view condition is baked into the query expansion. The database evaluates the WHERE city = "Dhaka" constraint automatically.',
          },
        ],
        commonMistakes: [
          'Granting direct table SELECT permissions to a role in addition to view permissions — direct table access bypasses the view filters completely.',
        ],
      },
      tasks: [
        {
          id: 'day55-t2',
          title: 'Build a Regional Boundary View',
          description:
            'Create a regional view named v_dhaka_customers showing customer_id, name, and city for Dhaka customers, grant access to regional_analyst, and query it.',
          instructions: [
            "CREATE VIEW v_dhaka_customers AS SELECT customer_id, name, city FROM customers WHERE city = 'Dhaka'",
            'CREATE ROLE regional_analyst',
            'GRANT SELECT ON v_dhaka_customers TO regional_analyst',
            'SELECT * FROM v_dhaka_customers',
          ],
          type: 'independent',
          primaryTable: 'customers',
          setupSql: '',
          initialSql: '-- Regional security view for Dhaka customers\n\n\n\n',
          solutionSql:
            "CREATE VIEW v_dhaka_customers AS SELECT customer_id, name, city FROM customers WHERE city = 'Dhaka';\nCREATE ROLE regional_analyst;\nGRANT SELECT ON v_dhaka_customers TO regional_analyst;\nSELECT * FROM v_dhaka_customers;",
          solutionExplanation:
            'This view creates an isolated boundary where regional_analyst can only see customers located in Dhaka.',
          hints: [
            { level: 1, text: "Filter by WHERE city = 'Dhaka' inside your CREATE VIEW definition." },
            { level: 2, text: "CREATE VIEW v_dhaka_customers AS SELECT customer_id, name, city FROM customers WHERE city = 'Dhaka';\nCREATE ROLE regional_analyst;\nGRANT SELECT ON v_dhaka_customers TO regional_analyst;\nSELECT * FROM v_dhaka_customers;" },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Tenant isolation view active! Only Dhaka customers are exposed.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day55-challenge',
    title: 'Customer Order Intelligence Boundary',
    scenario:
      'A partner analytics vendor needs access to order statistics by customer, but must never see order dates, prices, or line items. Build an aggregated security boundary view.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day55-ch1',
        title: 'Provision an Aggregated Boundary View',
        description:
          'Create a view named v_customer_order_counts that groups orders by customer_id and counts total orders as order_count. Grant SELECT to vendor_role and query the view.',
        instructions: [
          'CREATE VIEW v_customer_order_counts AS SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id',
          'CREATE ROLE vendor_role',
          'GRANT SELECT ON v_customer_order_counts TO vendor_role',
          'SELECT * FROM v_customer_order_counts',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        setupSql: '',
        initialSql: '-- Create aggregated boundary view for analytics vendor\n\n\n\n',
        solutionSql:
          'CREATE VIEW v_customer_order_counts AS SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id;\nCREATE ROLE vendor_role;\nGRANT SELECT ON v_customer_order_counts TO vendor_role;\nSELECT * FROM v_customer_order_counts;',
        solutionExplanation:
          'The vendor receives access only to customer_id and aggregated order_count. No individual order details are exposed.',
        hints: [
          { level: 1, text: 'Use GROUP BY customer_id with COUNT(*) AS order_count in the view definition.' },
          { level: 2, text: 'CREATE VIEW v_customer_order_counts AS SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id;\nCREATE ROLE vendor_role;\nGRANT SELECT ON v_customer_order_counts TO vendor_role;\nSELECT * FROM v_customer_order_counts;' },
        ],
        validation: {           requireSelect: true, expectedRowCount: { min: 1 },           judgment: [             { kind: 'choose-and-defend', prompt: 'The application connects with a role that can DROP TABLE. Why is that a problem?', options: ['One compromised query could destroy the database - the app needs only data-modification rights', 'DROP TABLE is a slow command', 'It blocks all other connections forever', 'It prevents backups from running'], correctIndex: 0, explanation: 'Least privilege: an application account limited to SELECT, INSERT, UPDATE and DELETE cannot become a destructive accident or an attacker weapon.' },           ],         },
        successMessage: 'Challenge complete! Aggregated boundary view protects raw transactional data from external vendors.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
