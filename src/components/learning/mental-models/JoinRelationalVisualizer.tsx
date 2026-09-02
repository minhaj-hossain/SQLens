'use client';

import React, { useState } from 'react';
import { Link2, AlertTriangle, ArrowRight } from 'lucide-react';

type JoinMode = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';

interface CustomerRow {
  id: number;
  name: string;
}

interface OrderRow {
  order_id: number;
  customer_id: number | null;
  amount: number;
}

const CUSTOMERS: CustomerRow[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }, // Has no orders
];

const ORDERS: OrderRow[] = [
  { order_id: 101, customer_id: 1, amount: 80 },  // Alice
  { order_id: 102, customer_id: 1, amount: 150 }, // Alice (fanout!)
  { order_id: 103, customer_id: 2, amount: 45 },  // Bob
  { order_id: 104, customer_id: null, amount: 99 }, // Guest order (no customer)
];

export const JoinRelationalVisualizer: React.FC = () => {
  const [joinMode, setJoinMode] = useState<JoinMode>('LEFT');

  // Compute the joined rows based on join mode
  const joinedRows = React.useMemo(() => {
    const res: Array<{
      customer: CustomerRow | null;
      order: OrderRow | null;
      isMatch: boolean;
      isFanout: boolean;
    }> = [];

    if (joinMode === 'CROSS') {
      CUSTOMERS.forEach((c) => {
        ORDERS.forEach((o) => {
          res.push({ customer: c, order: o, isMatch: c.id === o.customer_id, isFanout: false });
        });
      });
      return res;
    }

    if (joinMode === 'INNER') {
      CUSTOMERS.forEach((c) => {
        const matches = ORDERS.filter((o) => o.customer_id === c.id);
        matches.forEach((o, idx) => {
          res.push({ customer: c, order: o, isMatch: true, isFanout: idx > 0 });
        });
      });
    } else if (joinMode === 'LEFT') {
      CUSTOMERS.forEach((c) => {
        const matches = ORDERS.filter((o) => o.customer_id === c.id);
        if (matches.length > 0) {
          matches.forEach((o, idx) => {
            res.push({ customer: c, order: o, isMatch: true, isFanout: idx > 0 });
          });
        } else {
          res.push({ customer: c, order: null, isMatch: false, isFanout: false });
        }
      });
    } else if (joinMode === 'RIGHT') {
      ORDERS.forEach((o) => {
        const match = CUSTOMERS.find((c) => c.id === o.customer_id);
        res.push({ customer: match || null, order: o, isMatch: Boolean(match), isFanout: false });
      });
    } else if (joinMode === 'FULL') {
      // All Left plus unmatched Right
      CUSTOMERS.forEach((c) => {
        const matches = ORDERS.filter((o) => o.customer_id === c.id);
        if (matches.length > 0) {
          matches.forEach((o, idx) => res.push({ customer: c, order: o, isMatch: true, isFanout: idx > 0 }));
        } else {
          res.push({ customer: c, order: null, isMatch: false, isFanout: false });
        }
      });
      ORDERS.filter((o) => !CUSTOMERS.some((c) => c.id === o.customer_id)).forEach((orphanOrder) => {
        res.push({ customer: null, order: orphanOrder, isMatch: false, isFanout: false });
      });
    }

    return res;
  }, [joinMode]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-text my-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-soft">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Relational Algebra & JOINs
          </span>
          <h3 className="font-display font-semibold text-[17px] text-text mt-0.5">
            Interactive Multi-Table JOIN Simulator
          </h3>
        </div>

        {/* Join Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
          {(['INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS'] as JoinMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setJoinMode(mode)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
                joinMode === mode
                  ? 'bg-func text-ink shadow-sm'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-text-dim leading-relaxed">
        {joinMode === 'INNER' && 'Returns only rows with matching keys on both sides. Unmatched customers and guest orders are omitted.'}
        {joinMode === 'LEFT' && 'Preserves ALL rows from Left table (Customers). If a customer has no orders, order fields are filled with NULL.'}
        {joinMode === 'RIGHT' && 'Preserves ALL rows from Right table (Orders). Orders with no customer link to NULL.'}
        {joinMode === 'FULL' && 'Preserves every row from both tables. Missing sides are filled with NULL.'}
        {joinMode === 'CROSS' && 'Cartesian product: every row of Customers paired with every row of Orders (3 × 4 = 12 combinations).'}
      </div>

      {/* Relational Tables Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Left Table */}
        <div className="rounded-lg border border-border bg-surface-2/70 p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-soft">
            <span className="font-mono text-[11px] font-bold text-func">LEFT TABLE: customers</span>
            <span className="text-[10px] font-mono text-text-faint">PK: id</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {CUSTOMERS.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft"
              >
                <span>id: <strong className="text-text">{c.id}</strong></span>
                <span className="text-text-dim">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Table */}
        <div className="rounded-lg border border-border bg-surface-2/70 p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-soft">
            <span className="font-mono text-[11px] font-bold text-func">RIGHT TABLE: orders</span>
            <span className="text-[10px] font-mono text-text-faint">FK: customer_id</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {ORDERS.map((o) => (
              <div
                key={o.order_id}
                className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft"
              >
                <span>#{o.order_id}</span>
                <span>FK: <strong className={o.customer_id ? 'text-func' : 'text-text-faint italic'}>{o.customer_id ?? 'NULL'}</strong></span>
                <span className="text-text-dim">${o.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Output Joined Grid */}
      <div className="mt-4 rounded-lg border border-border overflow-hidden bg-surface-2">
        <div className="flex items-center justify-between px-3 py-2 bg-surface-3 border-b border-border font-mono text-xs font-semibold text-text">
          <div className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-func" />
            <span>JOIN Result: {joinMode} JOIN ({joinedRows.length} rows)</span>
          </div>
          <span className="text-[11px] text-text-dim font-normal">ON customers.id = orders.customer_id</span>
        </div>

        <div className="max-h-56 overflow-y-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface sticky top-0 text-[10.5px] uppercase tracking-wider text-text-faint border-b border-border">
              <tr>
                <th className="p-2 border-r border-border-soft">cust.id</th>
                <th className="p-2 border-r border-border-soft">cust.name</th>
                <th className="p-2 border-r border-border-soft">orders.id</th>
                <th className="p-2">orders.amount</th>
              </tr>
            </thead>
            <tbody>
              {joinedRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-border-soft last:border-b-0 ${
                    row.isFanout ? 'bg-func/5' : 'hover:bg-surface-3/50'
                  }`}
                >
                  <td className="p-2 border-r border-border-soft">
                    {row.customer ? row.customer.id : <span className="text-text-faint italic">NULL</span>}
                  </td>
                  <td className="p-2 border-r border-border-soft">
                    {row.customer ? row.customer.name : <span className="text-text-faint italic">NULL</span>}
                  </td>
                  <td className="p-2 border-r border-border-soft">
                    {row.order ? row.order.order_id : <span className="text-text-faint italic">NULL</span>}
                  </td>
                  <td className="p-2">
                    {row.order ? `$${row.order.amount}` : <span className="text-text-faint italic">NULL</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JoinRelationalVisualizer;
