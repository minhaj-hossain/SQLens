'use client';

import React, { useState } from 'react';
import { Layers, ArrowDown, Filter, HelpCircle, Check, X } from 'lucide-react';

interface RawItem {
  id: number;
  product: string;
  category: 'Electronics' | 'Apparel' | 'Books';
  price: number;
}

const RAW_PRODUCTS: RawItem[] = [
  { id: 1, product: 'Laptop', category: 'Electronics', price: 999 },
  { id: 2, product: 'Headphones', category: 'Electronics', price: 149 },
  { id: 3, product: 'Smartwatch', category: 'Electronics', price: 299 },
  { id: 4, product: 'T-Shirt', category: 'Apparel', price: 25 },
  { id: 5, product: 'Jeans', category: 'Apparel', price: 65 },
  { id: 6, product: 'SQL Handbook', category: 'Books', price: 40 },
];

export const GroupBucketingVisualizer: React.FC = () => {
  const [minCountThreshold, setMinCountThreshold] = useState<number>(2);

  // Group raw rows into category buckets
  const buckets = React.useMemo(() => {
    const map = new Map<string, RawItem[]>();
    RAW_PRODUCTS.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });

    return Array.from(map.entries()).map(([category, items]) => {
      const count = items.length;
      const totalRevenue = items.reduce((acc, i) => acc + i.price, 0);
      const avgPrice = Math.round(totalRevenue / count);
      const passesHaving = count >= minCountThreshold;

      return { category, items, count, totalRevenue, avgPrice, passesHaving };
    });
  }, [minCountThreshold]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-text my-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-soft">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Data Reduction & Summarization
          </span>
          <h3 className="font-display font-semibold text-[17px] text-text mt-0.5">
            GROUP BY Bucket Collapse & Aggregate Funnel
          </h3>
        </div>

        {/* HAVING Threshold interactive slider */}
        <div className="flex items-center gap-2 bg-surface-2 px-3 py-1.5 rounded-lg border border-border text-xs font-mono">
          <span className="text-text-faint">HAVING COUNT(*) &gt;=</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((val) => (
              <button
                key={val}
                onClick={() => setMinCountThreshold(val)}
                className={`w-6 h-6 rounded flex items-center justify-center font-bold transition cursor-pointer ${
                  minCountThreshold === val
                    ? 'bg-func text-ink'
                    : 'bg-surface-3 text-text-dim hover:text-text'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        <strong className="text-text font-semibold">GROUP BY collapses $N$ individual records into $1$ summary row per group.</strong> Individual raw row details disappear inside the bucket; only aggregate calculations survive.
      </p>

      {/* Raw Row Cards Flowing into Category Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {buckets.map((b) => (
          <div
            key={b.category}
            className={`rounded-lg border transition-all p-3.5 flex flex-col justify-between ${
              b.passesHaving
                ? 'bg-surface-2 border-border'
                : 'bg-surface-2/40 border-border-soft opacity-60'
            }`}
          >
            <div>
              {/* Bucket Label */}
              <div className="flex items-center justify-between pb-2 border-b border-border-soft">
                <span className="font-mono text-xs font-bold text-func flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  {b.category}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  b.passesHaving
                    ? 'bg-success-bg text-success-text border border-success-border'
                    : 'bg-error-bg text-error-text border border-error-border'
                }`}>
                  {b.passesHaving ? 'Passes HAVING' : 'Filtered Out'}
                </span>
              </div>

              {/* Items in this bucket */}
              <div className="mt-2.5 space-y-1 text-xs font-mono">
                {b.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-text-dim text-[11px] p-1 rounded bg-surface/60">
                    <span>{i.product}</span>
                    <span>${i.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapse Arrow and Aggregated Result */}
            <div className="mt-3 pt-2.5 border-t border-border-soft flex flex-col items-center">
              <ArrowDown className="w-3.5 h-3.5 text-text-faint my-1" />
              <div className="w-full bg-surface border border-border rounded p-2 text-center font-mono text-[11px]">
                <div className="text-text font-semibold">{b.category}</div>
                <div className="text-text-dim text-[10px] mt-0.5">
                  COUNT: <b className="text-func">{b.count}</b> · SUM: <b className="text-func">${b.totalRevenue}</b>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why un-aggregated columns are illegal */}
      <div className="mt-4 p-3 rounded-lg bg-surface-2 border border-border-soft flex items-start gap-2 text-xs">
        <HelpCircle className="w-4 h-4 text-func shrink-0 mt-0.5" />
        <p className="text-text-dim leading-relaxed">
          <strong className="text-text">The Single-Value Rule:</strong> In <code className="text-func">GROUP BY category</code>, asking for <code className="text-error-text">SELECT product</code> is invalid because the Electronics bucket holds Laptop, Headphones, and Smartwatch. The database cannot decide which single product name to display!
        </p>
      </div>
    </div>
  );
};

export default GroupBucketingVisualizer;
