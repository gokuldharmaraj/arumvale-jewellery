import { Users, Store, Package, ShoppingBag, IndianRupee, TrendingUp, ArrowUpRight, Clock } from "lucide-react";
import { adminStats } from "@/data/mockData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const kpiCards = [{
  title: "Total Users",
  value: "1,250",
  change: "+8.2%",
  trend: "up",
  icon: Users,
  color: "text-blue-500",
  bg: "bg-blue-500/10"
}, {
  title: "Active Vendors",
  value: "45",
  change: "+3",
  trend: "up",
  icon: Store,
  color: "text-emerald-500",
  bg: "bg-emerald-500/10"
}, {
  title: "Total Products",
  value: "890",
  change: "+24",
  trend: "up",
  icon: Package,
  color: "text-violet-500",
  bg: "bg-violet-500/10"
}, {
  title: "Total Orders",
  value: "3,200",
  change: "+15.3%",
  trend: "up",
  icon: ShoppingBag,
  color: "text-primary",
  bg: "bg-primary/10"
}, {
  title: "Revenue",
  value: "₹4.5Cr",
  change: "+22.1%",
  trend: "up",
  icon: IndianRupee,
  color: "text-amber-500",
  bg: "bg-amber-500/10"
}];
const categoryData = [{
  name: "Gold",
  value: 45,
  fill: "hsl(43, 74%, 49%)"
}, {
  name: "Diamond",
  value: 28,
  fill: "hsl(280, 60%, 55%)"
}, {
  name: "Silver",
  value: 18,
  fill: "hsl(210, 15%, 65%)"
}, {
  name: "Platinum",
  value: 9,
  fill: "hsl(200, 40%, 55%)"
}];
const recentOrders = [{
  id: "ORD-3201",
  customer: "Priya Sharma",
  amount: "₹2,45,000",
  status: "Completed",
  time: "2 min ago"
}, {
  id: "ORD-3200",
  customer: "Rahul Verma",
  amount: "₹85,000",
  status: "Processing",
  time: "15 min ago"
}, {
  id: "ORD-3199",
  customer: "Anita Patel",
  amount: "₹1,20,000",
  status: "Shipped",
  time: "1 hr ago"
}, {
  id: "ORD-3198",
  customer: "Vikram Singh",
  amount: "₹65,000",
  status: "Completed",
  time: "2 hrs ago"
}, {
  id: "ORD-3197",
  customer: "Meera Joshi",
  amount: "₹3,10,000",
  status: "Processing",
  time: "3 hrs ago"
}];
const topVendors = [{
  name: "Tanishq",
  sales: "₹18.5L",
  orders: 156,
  growth: "+12%"
}, {
  name: "Kalyan Jewellers",
  sales: "₹14.2L",
  orders: 128,
  growth: "+8%"
}, {
  name: "Malabar Gold",
  sales: "₹12.8L",
  orders: 112,
  growth: "+15%"
}, {
  name: "Joyalukkas",
  sales: "₹10.4L",
  orders: 94,
  growth: "+6%"
}];
const statusColor = {
  Completed: "bg-emerald-500/10 text-emerald-600",
  Processing: "bg-primary/10 text-primary",
  Shipped: "bg-blue-500/10 text-blue-600",
  Pending: "bg-amber-500/10 text-amber-600"
};
export default function AdminDashboard() {
  return <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map(card => <Card key={card.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">{card.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.title}</p>
            </CardContent>
          </Card>)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend - takes 2 cols */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">Revenue Trend</CardTitle>
              <div className="flex gap-1">
                {["6M", "1Y", "All"].map(p => <button key={p} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${p === "6M" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    {p}
                  </button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={adminStats.platformData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000000}M`} />
                <Tooltip contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }} formatter={v => [`₹${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categoryData.map(c => <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{
                background: c.fill
              }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium text-foreground">{c.value}%</span>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User growth + top vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">User & Order Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={adminStats.platformData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} name="Users" />
                <Bar dataKey="orders" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} barSize={20} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">Top Vendors</CardTitle>
              <button className="text-xs text-primary hover:underline">View All</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVendors.map((v, i) => <div key={v.name} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{v.sales}</p>
                    <p className="text-xs text-emerald-500">{v.growth}</p>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">Recent Orders</CardTitle>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                  <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Amount</th>
                  <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 text-sm font-medium text-primary">{order.id}</td>
                    <td className="py-3 text-sm text-foreground">{order.customer}</td>
                    <td className="py-3 text-sm font-medium text-foreground hidden sm:table-cell">{order.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground text-right hidden md:table-cell">
                      <span className="flex items-center justify-end gap-1"><Clock className="h-3 w-3" />{order.time}</span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>;
}
