import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { RoleGuard } from "@/components/RoleGuard";
import { ChartGrid, ChartPlaceholder } from "@/components/ChartPlaceholder";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { SalesTable } from "@/components/SalesTable";
import { getKpis, repeatCustomerRate, salesByProduct, topCustomers } from "@/data/queries";
import { UserDashboardContent } from "./dashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SalesOS" }] }),
  component: AdminPage,
});

export function AdminContent() {
  const k = getKpis();
  const repeat = repeatCustomerRate();
  const top = salesByProduct()[0];
  const topCust = topCustomers()[0];
  return (
    <>
      <KpiGrid>
        <KpiCard
          label="Repeat Rate"
          value={`${(repeat.rate * 100).toFixed(1)}%`}
          hint={`${repeat.repeats}/${repeat.total} customers`}
        />
        <KpiCard label="Best Product" value={top.productId} hint={`${top.count} sales`} />
        <KpiCard label="Top Customer" value={topCust.customerId} hint={`${topCust.count} orders`} />
        <KpiCard label="Avg / Customer" value={(k.total / k.customers).toFixed(2)} />
      </KpiGrid>
      <ChartGrid>
        <ChartPlaceholder type="line" title="Team revenue trend" subtitle="Monthly volume" />
        <ChartPlaceholder type="bar" title="Sales per product code" subtitle="All products" />
        <ChartPlaceholder type="pie" title="Revenue split" subtitle="By product family" />
        <ChartPlaceholder type="funnel" title="Team pipeline" subtitle="Acquisition stages" />
        <ChartPlaceholder type="heatmap" title="Activity matrix" subtitle="Weekday × month" />
        <ChartPlaceholder type="scatter" title="Customer behavior" subtitle="Frequency vs recency" />
      </ChartGrid>
      <SalesTable />
    </>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex gap-1 border-b border-border">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 ${
            value === o.id
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AdminPage() {
  const [tab, setTab] = useState<"admin" | "user">("admin");
  return (
    <RoleGuard required="admin">
      <DashboardShell title="Admin Dashboard">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "admin", label: "Admin View" },
            { id: "user", label: "User View" },
          ]}
        />
        {tab === "admin" ? <AdminContent /> : <UserDashboardContent />}
      </DashboardShell>
    </RoleGuard>
  );
}