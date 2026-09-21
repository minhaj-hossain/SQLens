import { SqlExecutor } from '../src/lib/sql-engine/executor';

const ex = new SqlExecutor();
ex.executeQuery(
  "CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER); INSERT INTO employees (emp_id, name, manager_id) VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',2),(4,'Dave',3),(5,'Eve',2);"
);

let currentRows: any[] = [{ emp_id: 4, name: 'Dave', manager_id: 3, level: 1 }];

for (let step = 1; step <= 10; step++) {
  (ex as any).db.tables['chain'] = currentRows;
  const res = ex.executeQuery(
    "SELECT e.emp_id, e.name, e.manager_id, chain.level + 1 FROM employees e JOIN chain ON e.emp_id = chain.manager_id"
  );
  console.log(`Step ${step} returned ${res.rows?.length} rows:`, res.rows);
  if (!res.rows || res.rows.length === 0) break;
  currentRows = res.rows.map((r: any) => ({
    emp_id: r.emp_id,
    name: r.name,
    manager_id: r.manager_id,
    level: r['level + 1'] ?? r.level
  }));
}
