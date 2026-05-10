import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { RoleGuard } from "@/components/RoleGuard";
import { ChartGrid, ChartPlaceholder } from "@/components/ChartPlaceholder";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { SalesTable } from "@/components/SalesTable";
import { getKpis, salesByMonth, salesByProduct } from "@/data/queries";
import { UserDashboardContent } from "./dashboard";
import { AdminContent, Tabs } from "./admin";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin Panel — SalesOS" }] }),
  component: SuperAdminPage,
});

function SuperContent() {
  const k = getKpis();
  const months = salesByMonth();
  const top = salesByProduct()[0];
  const peak = months.reduce((a, b) => (a.count > b.count ? a : b));
  return (
    <>
      <KpiGrid>
        <KpiCard label="Total Volume" value={k.total} hint="All transactions" />
        <KpiCard label="Active Months" value={months.length} />
        <KpiCard label="Peak Month" value={peak.month} hint={`${peak.count} sales`} />
        <KpiCard label="Top Product" value={top.productId} hint={`${top.count} sales`} />
      </KpiGrid>
      <ChartGrid>
        <ChartPlaceholder type="line" title="Company revenue" subtitle="Multi-year trend" />
        <ChartPlaceholder type="bar" title="Revenue by department" subtitle="Org breakdown" />
        <ChartPlaceholder type="pie" title="Market share" subtitle="By product line" />
        <ChartPlaceholder type="funnel" title="Acquisition funnel" subtitle="Org-wide" />
        <ChartPlaceholder type="heatmap" title="Global heatmap" subtitle="Region × month" />
        <ChartPlaceholder type="scatter" title="Performance vs target" subtitle="All teams" />
      </ChartGrid>
      <SalesTable />
    </>
  );
}

function SuperAdminPage() {
  const [tab, setTab] = useState<"super" | "admin" | "user">("super");
  return (
    <RoleGuard required="super_admin">
      <DashboardShell title="Super Admin Panel">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "super", label: "Super Admin" },
            { id: "admin", label: "Admin View" },
            { id: "user", label: "User View" },
          ]}
        />
        {tab === "super" && <SuperContent />}
        {tab === "admin" && <AdminContent />}
        {tab === "user" && <UserDashboardContent />}
      </DashboardShell>
    </RoleGuard>
  );
}