import { adminStats } from "@/data/mockData";
import { Download, TrendingUp, IndianRupee, Users, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const reportCards = [{
  title: "Monthly Revenue Report",
  description: "Detailed revenue breakdown by vendor, category, and payment method",
  icon: IndianRupee,
  type: "Revenue"
}, {
  title: "User Acquisition Report",
  description: "New sign-ups, retention rates, and user activity metrics",
  icon: Users,
  type: "Users"
}, {
  title: "Order Analytics Report",
  description: "Order volume, fulfillment rates, cancellation trends",
  icon: ShoppingBag,
  type: "Orders"
}, {
  title: "Growth Summary",
  description: "Platform growth metrics, GMV trends, and vendor performance",
  icon: TrendingUp,
  type: "Growth"
}];
export default function ReportsPage() {
  return <div className="space-y-6">
      {/* Quick reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportCards.map(r => <Card key={r.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 h-8 gap-1 text-xs">
                  <Download className="h-3 w-3" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={adminStats.platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000000}M`} />
                <Tooltip contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }} formatter={v => [`₹${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={adminStats.platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{
                r: 4
              }} name="Users" />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary) / 0.5)" strokeWidth={2} dot={{
                r: 3
              }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>;
}
