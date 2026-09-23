import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DatabaseExplorer } from '../../src/components/learning/DatabaseExplorer';

/**
 * Workstream F — the explorer's expected-schema panel:
 *  - contract columns come ONLY from the explicit `expectedColumns` prop
 *    (= validation.requiredColumns for DDL tasks, gated in PracticeTaskView),
 *    never from solutionSql;
 *  - shows for a not-yet-created table (the schema fallback would otherwise
 *    display `products` under the wrong header) and for pending ALTER columns;
 *  - stays hidden for SELECT tasks (highlightedColumns alone never triggers it).
 */
describe('DatabaseExplorer expected-schema panel (Workstream F)', () => {
  it('shows the contract for a not-yet-created table', () => {
    const html = renderToStaticMarkup(
      <DatabaseExplorer
        initialTableName="product_tags"
        highlightedColumns={['tag_id', 'tag_name']}
        expectedColumns={['tag_id', 'tag_name']}
      />,
    );
    expect(html).toContain('id="expected-schema-panel"');
    expect(html).toContain('EXPECTED SCHEMA · product_tags (not created yet)');
    expect(html).toContain('tag_id');
    expect(html).toContain('tag_name');
    expect(html).toContain('see the instructions');
  });

  it('lists pending ALTER columns for an existing table', () => {
    const html = renderToStaticMarkup(
      <DatabaseExplorer
        initialTableName="products"
        highlightedColumns={['tagline']}
        expectedColumns={['tagline']}
      />,
    );
    expect(html).toContain('EXPECTED COLUMNS · products (to be added)');
    expect(html).toContain('tagline');
    expect(html).not.toContain('not created yet');
  });

  it('stays hidden for SELECT tasks (highlightedColumns alone never triggers it)', () => {
    const html = renderToStaticMarkup(
      <DatabaseExplorer initialTableName="students" highlightedColumns={['name']} />,
    );
    expect(html).not.toContain('expected-schema-panel');
  });
});