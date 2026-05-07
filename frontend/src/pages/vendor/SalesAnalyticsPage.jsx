import { vendorStats } from "@/data/mockData";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, IndianRupee, Eye, ShoppingBag, Users } from "lucide-react";
import styles from "./SalesAnalyticsPage.module.css";
const categoryData = [{
  name: "Gold",
  value: 55
}, {
  name: "Diamond",
  value: 25
}, {
  name: "Silver",
  value: 15
}, {
  name: "Platinum",
  value: 5
}];
const COLORS = ["hsl(43, 74%, 49%)", "hsl(200, 70%, 55%)", "hsl(0, 0%, 65%)", "hsl(270, 50%, 60%)"];
const kpis = [{
  label: "Avg. Order Value",
  value: "₹26,042",
  icon: IndianRupee,
  change: "+5.2%"
}, {
  label: "Page Views",
  value: "3,842",
  icon: Eye,
  change: "+18.4%"
}, {
  label: "Orders",
  value: "48",
  icon: ShoppingBag,
  change: "+8.2%"
}, {
  label: "Unique Visitors",
  value: "1,290",
  icon: Users,
  change: "+12.1%"
}];
export default function SalesAnalyticsPage() {
  return <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSubtitle}>Track your store's performance and growth.</p>
        </div>
        <select className={styles.dateSelector}>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* KPIs */}
      <div className={styles.kpisGrid}>
        {kpis.map(k => <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon}>
                <k.icon />
              </div>
              <span className={styles.kpiChange}>
                <ArrowUpRight /> {k.change}
              </span>
            </div>
            <p className={styles.kpiValue}>{k.value}</p>
            <p className={styles.kpiLabel}>{k.label}</p>
          </div>)}
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Revenue Trend */}
        <div className={styles.revenueChart}>
          <h2 className={styles.chartTitle}>Revenue Trend</h2>
          <p className={styles.chartSubtitle}>Monthly sales over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={vendorStats.monthlySales}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `Rs${v / 1000}K`} />
              <Tooltip contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))"
            }} formatter={v => [`Rs${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#analyticsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className={styles.categoryChart}>
          <h2 className={styles.chartTitle}>Sales by Category</h2>
          <p className={styles.chartSubtitle}>Revenue distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legendContainer}>
            {categoryData.map((c, i) => <div key={c.name} className={styles.legendItem}>
                <div className={styles.legendLabel}>
                  <div className={styles.legendColor} style={{
                background: COLORS[i]
              }} />
                  <span className={styles.legendName}>{c.name}</span>
                </div>
                <span className={styles.legendValue}>{c.value}%</span>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}
