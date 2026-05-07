import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, TrendingUp, Users, ShoppingCart, Eye, DollarSign, ArrowUp, ArrowDown, Loader2, IndianRupee, ShoppingBag, ArrowUpRight, ArrowDownRight, Warehouse, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/getImageUrl";
import axios from "axios";
import styles from "./VendorDashboard.module.css";
const getStatusClass = (status) => {
  switch(status) {
    case "Delivered":
      return styles.statusDelivered;
    case "Shipped":
      return styles.statusShipped;
    case "Processing":
      return styles.statusProcessing;
    case "Pending":
      return styles.statusPending;
    default:
      return styles.statusPending;
  }
};
export default function VendorDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalSales: 0,
      totalOrders: 0,
      conversionRate: 0
    },
    monthlySales: [],
    topProducts: [],
    recentOrders: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor's products
      const productsResponse = await axios.get(
        'http://localhost:5000/api/products/my?limit=100',
        { withCredentials: true }
      );
      
      const products = productsResponse.data.products || [];
      const activeProducts = products.filter(p => p.status === 'active');
      
      // Calculate stats from real data
      const stats = {
        totalSales: activeProducts.reduce((sum, p) => sum + (p.price * p.stock), 0),
        totalOrders: Math.floor(Math.random() * 50) + 10, // Mock orders for now
        totalProducts: activeProducts.length,
        conversionRate: 3.2 // Mock conversion rate for now
      };
      
      // Mock monthly sales data (can be replaced with real analytics API)
      const monthlySales = [
        { month: 'Jan', sales: stats.totalSales * 0.1 },
        { month: 'Feb', sales: stats.totalSales * 0.15 },
        { month: 'Mar', sales: stats.totalSales * 0.2 },
        { month: 'Apr', sales: stats.totalSales * 0.18 },
        { month: 'May', sales: stats.totalSales * 0.22 },
        { month: 'Jun', sales: stats.totalSales * 0.15 }
      ];
      
      // Fetch recent orders
      try {
        const ordersResponse = await axios.get(
          'http://localhost:5000/api/orders/vendor/my?limit=5',
          { withCredentials: true }
        );
        const recentOrdersData = (ordersResponse.data.orders || []).slice(0, 5);
        
        // Generate recent activity from orders and products
        const recentActivityData = [];
        
        // Add recent order activities
        recentOrdersData.slice(0, 3).forEach((order, index) => {
          const timeAgo = index === 0 ? '2 hours ago' : index === 1 ? '5 hours ago' : '1 day ago';
          const customerName = order.customer?.firstName && order.customer?.lastName 
            ? `${order.customer.firstName} ${order.customer.lastName}`
            : 'Customer';
          const productName = order.items?.[0]?.product?.name || 'Product';
          
          recentActivityData.push({
            text: `New order #${order.orderNumber || order._id?.slice(-8).toUpperCase()} received`,
            time: timeAgo,
            icon: ShoppingBag
          });
        });
        
        // Add low stock alerts
        const lowStockProducts = activeProducts.filter(p => p.stock < 5);
        if (lowStockProducts.length > 0) {
          recentActivityData.push({
            text: `Product '${lowStockProducts[0].name}' stock low`,
            time: '5 hours ago',
            icon: Package
          });
        }
        
        // Add payment activity
        const paidOrders = recentOrdersData.filter(o => o.paymentStatus === 'paid');
        if (paidOrders.length > 0) {
          const paidOrder = paidOrders[0];
          recentActivityData.push({
            text: `Payment of Rs${paidOrder.total?.toLocaleString() || '0'} settled`,
            time: '1 day ago',
            icon: IndianRupee
          });
        }
        
        setDashboardData({
          stats,
          monthlySales,
          topProducts: activeProducts.slice(0, 4),
          recentOrders: recentOrdersData,
          recentActivity: recentActivityData.slice(0, 4)
        });
        
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        setDashboardData({
          stats,
          monthlySales,
          topProducts: activeProducts.slice(0, 4),
          recentOrders: [],
          recentActivity: []
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [{
    title: "Total Revenue",
    value: `Rs${(dashboardData.stats.totalSales / 100000).toFixed(1)}L`,
    icon: IndianRupee,
    trend: "+12.5%",
    up: true,
    sub: "vs last month"
  }, {
    title: "Total Orders",
    value: String(dashboardData.stats.totalOrders),
    icon: ShoppingBag,
    trend: "+8.2%",
    up: true,
    sub: "vs last month"
  }, {
    title: "Active Products",
    value: String(dashboardData.stats.totalProducts),
    icon: Package,
    trend: "+3",
    up: true,
    sub: "new this week"
  }, {
    title: "Conversion Rate",
    value: "3.2%",
    icon: TrendingUp,
    trend: "-0.4%",
    up: false,
    sub: "vs last month"
  }];
  return <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {user?.name || "Vendor"} 👋
          </h1>
          <p className={styles.welcomeSubtitle}>Here's what's happening with your store today.</p>
        </div>
        <div className={styles.headerActions}>
          <select className={styles.dateSelector}>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map(s => <div key={s.title} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <s.icon />
              </div>
              <span className={`${styles.statTrend} ${s.up ? styles.trendUp : styles.trendDown}`}>
                {s.up ? <ArrowUpRight className={styles.trendIcon} /> : <ArrowDownRight className={styles.trendIcon} />}
                {s.trend}
              </span>
            </div>
            <p className={styles.statValue}>{s.value}</p>
            <p className={styles.statLabel}>{s.title} · <span className={styles.statSub}>{s.sub}</span></p>
          </div>)}
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Revenue Chart */}
        <div className={styles.revenueChart}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Revenue Overview</h2>
              <p className={styles.chartSubtitle}>Monthly sales performance</p>
            </div>
            <div className={styles.chartControls}>
              {["Bar", "Area"].map(t => <button key={t} className={styles.chartControlButton}>{t}</button>)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboardData.monthlySales}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))"
            }} formatter={v => [`₹${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className={styles.topProducts}>
          <div className={styles.topProductsHeader}>
            <h2 className={styles.topProductsTitle}>Top Products</h2>
            <button className={styles.viewAllButton}>View All</button>
          </div>
          <div className={styles.productList}>
            {dashboardData.topProducts.map((p, i) => <div key={p._id} className={styles.productItem}>
                <span className={styles.productRank}>#{i + 1}</span>
                <img src={getImageUrl(p.images?.[0])} alt={p.name} className={styles.productImage} />
                <div className={styles.productInfo}>
                  <p className={styles.productName}>{p.name}</p>
                  <p className={styles.productStock}>{p.stock} in stock</p>
                </div>
                <p className={styles.productPrice}>Rs{(p.price / 1000).toFixed(0)}K</p>
              </div>)}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.recentOrders}>
        <div className={styles.ordersHeader}>
          <div>
            <h2 className={styles.ordersTitle}>Recent Orders</h2>
            <p className={styles.ordersSubtitle}>Latest customer orders for your store</p>
          </div>
         <Link to="/vendor/orders" >
          <button className={styles.viewAllButton}>
            View All Orders  <ArrowUpRight className="h-3 w-3" />
          </button>
          </Link>
        </div>
        <div className={styles.ordersTableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr className={styles.ordersTableHead}>
                <th className={styles.ordersTableCell}>Order ID</th>
                <th className={styles.ordersTableCell}>Customer</th>
                <th className={`${styles.ordersTableCell} ${styles.hiddenMd}`}>Product</th>
                <th className={styles.ordersTableCell}>Amount</th>
                <th className={`${styles.ordersTableCell} ${styles.hiddenSm}`}>Date</th>
                <th className={styles.ordersTableCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders.map(order => {
                const orderNumber = order.orderNumber || order._id?.slice(-8).toUpperCase();
                const customerName = order.customer?.firstName && order.customer?.lastName 
                  ? `${order.customer.firstName} ${order.customer.lastName}`
                  : 'Customer';
                const productName = order.items?.[0]?.product?.name || 'Product';
                const orderDate = (order.orderDate || order.createdAt) ? new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short' 
                }) : 'Unknown';
                const orderStatus = order.vendorStatus || order.status || 'pending';
                const totalAmount = order.total || 0;
                
                return <tr key={order._id} className="ordersTableBody tr">
                  <td className={`${styles.ordersTableCell} ${styles.orderId}`}>{orderNumber}</td>
                  <td className={`${styles.ordersTableCell} text-foreground`}>{customerName}</td>
                  <td className={`${styles.ordersTableCell} text-muted-foreground ${styles.hiddenMd}`}>{productName}</td>
                  <td className={`${styles.ordersTableCell} text-foreground font-semibold`}>Rs{totalAmount.toLocaleString()}</td>
                  <td className={`${styles.ordersTableCell} text-muted-foreground ${styles.hiddenSm}`}>{orderDate}</td>
                  <td className={styles.ordersTableCell}>
                    <span className={`${styles.statusBadge} ${getStatusClass(orderStatus)}`}>{orderStatus}</span>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions + Activity */}
      <div className={styles.actionsActivityRow}>
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionButtonsGrid}>
            {[{
            label: "Add Product",
            icon: Package,
            path: "/vendor/add-product",
            color: styles.actionPrimary
          }, {
            label: "View Orders",
            icon: ShoppingBag,
            path: "/vendor/orders",
            color: styles.actionBlue
          }, {
            label: "Check Stock",
            icon: Warehouse,
            path: "/vendor/inventory",
            color: styles.actionAmber
          }, {
            label: "Analytics",
            icon: TrendingUp,
            path: "/vendor/analytics",
            color: styles.actionGreen
          }].map(action => <a key={action.label} href={action.path} className={styles.actionButton}>
                <div className={`${styles.actionIcon} ${action.color}`}>
                  <action.icon />
                </div>
                <span className={styles.actionLabel}>{action.label}</span>
              </a>)}
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            {dashboardData.recentActivity.map((activity, i) => <div key={i} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <activity.icon />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{activity.text}</p>
                  <p className={styles.activityTime}>
                    <Clock className="h-3 w-3" /> {activity.time}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}
