import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/DashboardShell";
import { ChartGrid, ChartPlaceholder } from "@/components/ChartPlaceholder";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { getKpis } from "@/data/queries";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "User Dashboard — SalesOS" }] }),
  component: UserDashboard,
});

export function UserDashboardContent() {
  const k = getKpis();
  return (
    <>
      <KpiGrid>
        <KpiCard label="Transactions" value={k.total} />
        <KpiCard label="Unique Customers" value={k.customers} />
        <KpiCard label="Unique Products" value={k.products} />
        <KpiCard label="Latest Sale" value={k.latest} />
      </KpiGrid>
      <ChartGrid>
        <ChartPlaceholder type="line" title="Sales over time" subtitle="Monthly transaction count" />
        <ChartPlaceholder type="bar" title="Sales by product" subtitle="Top product codes" />
        <ChartPlaceholder type="pie" title="Product mix" subtitle="Share by product code" />
        <ChartPlaceholder type="funnel" title="Personal funnel" subtitle="Browse → buy → repeat" />
        <ChartPlaceholder type="heatmap" title="Activity heatmap" subtitle="Day × month" />
        <ChartPlaceholder type="scatter" title="Recency vs frequency" subtitle="Transaction patterns" />
      </ChartGrid>
    </>
  );
}

function UserDashboard() {
  return (
    <DashboardShell title="User Dashboard">
      <UserDashboardContent />
    </DashboardShell>
  );
}