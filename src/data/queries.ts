import { SALES, type Sale } from "./sales";

export const getKpis = (rows: Sale[] = SALES) => ({
  total: rows.length,
  customers: new Set(rows.map((r) => r.customerId)).size,
  products: new Set(rows.map((r) => r.productId)).size,
  latest: rows.reduce((a, b) => (a.date > b.date ? a : b)).date,
});

export const salesByMonth = (rows: Sale[] = SALES) => {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = r.date.slice(0, 7);
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
};

export const salesByProduct = (rows: Sale[] = SALES) => {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.productId, (map.get(r.productId) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([productId, count]) => ({ productId, count }))
    .sort((a, b) => b.count - a.count);
};

export const repeatCustomerRate = (rows: Sale[] = SALES) => {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.customerId, (map.get(r.customerId) ?? 0) + 1));
  const repeats = Array.from(map.values()).filter((n) => n > 1).length;
  return { repeats, total: map.size, rate: repeats / map.size };
};

export const topCustomers = (rows: Sale[] = SALES, n = 5) => {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.customerId, (map.get(r.customerId) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([customerId, count]) => ({ customerId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
};