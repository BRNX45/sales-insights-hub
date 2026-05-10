import { useMemo, useState } from "react";
import { SALES } from "@/data/sales";

export function SalesTable() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return SALES;
    return SALES.filter(
      (s) =>
        s.id.toLowerCase().includes(term) ||
        s.customerId.toLowerCase().includes(term) ||
        s.productId.toLowerCase().includes(term) ||
        s.date.includes(term),
    );
  }, [q]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Raw Sales Data</h3>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search…"
          className="text-xs px-2 py-1 rounded-md border border-border bg-background"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Transaction</th>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Product</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono">{s.id}</td>
                <td className="px-3 py-2">{s.date}</td>
                <td className="px-3 py-2 font-mono">{s.customerId}</td>
                <td className="px-3 py-2 font-mono">{s.productId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
        <span>
          {filtered.length} rows · Page {safePage + 1} / {pages}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="px-2 py-1 rounded border border-border disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={safePage >= pages - 1}
            className="px-2 py-1 rounded border border-border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}