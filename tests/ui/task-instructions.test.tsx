import { describe, expect, it } from 'vitest';
import { StepText } from '../../src/components/learning/TaskInstructions';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Batch 1 (visible instructions): `task.instructions[]` used to be dead data —
 * the grader enforced exact tuples (tx-c1-t1's 'Flash Sale Mouse') that never
 * appeared on screen. These pin the renderer that closes that hole: steps are
 * visible, backtick spans become code chips, plain prose renders as-is.
 */
describe('TaskInstructions StepText', () => {
  it('renders plain prose without code chips', () => {
    const html = renderToStaticMarkup(<StepText text="Run `BEGIN;`" />);
    expect(html).toContain('<code');
    expect(html).toContain('BEGIN;');
    expect(html).not.toContain('`');
  });

  it('renders the exact INSERT tuple the grader enforces (tx-c1-t1)', () => {
    const html = renderToStaticMarkup(
      <StepText
        text="Run `INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20);`"
      />,
    );
    expect(html).toContain('Flash Sale Mouse');
    expect(html).toContain('<code');
  });

  it('leaves steps without backticks untouched', () => {
    const html = renderToStaticMarkup(<StepText text="Run COMMIT; - now the row is durable." />);
    expect(html).not.toContain('<code');
    expect(html).toContain('Run COMMIT;');
  });
});
