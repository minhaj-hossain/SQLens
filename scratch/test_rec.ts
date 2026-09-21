import { SqlExecutor } from '../src/lib/sql-engine/executor';

const ex = new SqlExecutor();
const r1 = ex.executeQuery(
  "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER); INSERT INTO employees (emp_id, name, manager_id) VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);"
);
console.log('Setup result:', r1);

const r2 = ex.executeQuery(
  "WITH RECURSIVE chain AS (SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 4 UNION ALL SELECT e.emp_id, e.name, e.manager_id, chain.level + 1 FROM employees e JOIN chain ON e.emp_id = chain.manager_id) SELECT name, level FROM chain ORDER BY level;"
);
console.log('CTE result:', r2);
