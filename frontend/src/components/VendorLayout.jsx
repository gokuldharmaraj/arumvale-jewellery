import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Package, ShoppingBag, Warehouse, TrendingUp, ChevronLeft, Store, Bell, Search, Settings, HelpCircle, LogOut, FileText, CheckCircle } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import useVendorData from "@/hooks/useVendorData";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./VendorLayout.module.css";
const navItems = [{
  label: "Dashboard",
  path: "/vendor",
  icon: LayoutDashboard
}, {
  label: "Add Product",
  path: "/vendor/add-product",
  icon: PlusCircle
}, {
  label: "Products",
  path: "/vendor/products",
  icon: Package
}, {
  label: "Orders",
  path: "/vendor/orders",
  icon: ShoppingBag
}, {
  label: "Custom Requests",
  path: "/vendor/custom-requests",
  icon: FileText
}, {
  label: "Approved Requests",
  path: "/vendor/approved-requests",
  icon: CheckCircle
}, {
  label: "Inventory",
  path: "/vendor/inventory",
  icon: Warehouse
}, {
  label: "Analytics",
  path: "/vendor/analytics",
  icon: TrendingUp
}];
;
export default function VendorLayout() {
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const [orderCount, setOrderCount] = useState(0);

  // Use shared vendor data for badge computation
  const { products, orders, requests, loading } = useVendorData();

  // Fetch vendor order count (for existing orders badge)
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/orders/vendor/my',
          { withCredentials: true }
        );
        setOrderCount(response.data.orders?.length || 0);
      } catch (error) {
        console.error('Error fetching order count:', error);
        setOrderCount(0);
      }
    };

    if (user?.role === 'vendor') {
      fetchOrderCount();
    }
  }, [user]);

  // Compute notification badge count
  const getNotificationBadgeCount = () => {
    if (loading) return 0;

    // 1. Pending orders needing vendor action (orders that are not "Delivered" or "Shipped")
    const pendingOrders = orders.filter(order => 
      order.status !== 'Delivered' && order.status !== 'Shipped'
    ).length;

    // 2. Low stock products (stock < 5)
    const lowStockItems = products.filter(product => product.stock < 5).length;

    // 3. Pending custom requests awaiting response
    const pendingCustomRequests = requests.filter(request => 
      request.status === 'pending' || request.status === 'under_review'
    ).length;

    return pendingOrders + lowStockItems + pendingCustomRequests;
  };

  const badgeCount = getNotificationBadgeCount();
  return <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Brand */}
        <div className={styles.sidebarHeader}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-primary">Vendor Hub</h2>
              <p className="text-xs text-muted-foreground">Shop Management</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Store
          </Link>
        </div>

        {/* Vendor Profile Card */}
        <div className={styles.sidebarProfile}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
              {user?.username?.[0]?.toUpperCase() || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.username || "Vendor"}</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">{user?.email || "vendor@goldvault.in"}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20" />
          </div>
        </div>

        {/* Main Nav */}
        <nav className={styles.sidebarNav}>
          <p className={styles.navSectionTitle}>Main Menu</p>
          {navItems.map(item => {
          const active = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={`${styles.navItem} ${active ? styles.active : ''}`}>
                <item.icon className={styles.navIcon} />
                {item.label}
                {item.label === "Orders" && orderCount > 0 && (
                  <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">{orderCount}</span>
                )}
              </Link>;
        })}

          <div className="my-3 border-t border-sidebar-border" />
         
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.navItem}>
            <ChevronLeft className="h-4 w-4" /> Back to Store
          </Link>
          <button onClick={logout} className={`${styles.navItem} ${styles.dropdownDestructive}`}>
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.header}>
          <div className="flex items-center w-full px-4 md:px-8 h-16">            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-primary">GoldVault</span>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center max-w-md">
              <GlobalSearch />
            </div>

            {/* Right actions */}
            <div className={styles.headerActions}>
              <button className={styles.notificationButton}>
                <Bell className="h-4 w-4 text-muted-foreground" />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </button>
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {user?.username?.[0]?.toUpperCase() || "V"}
                </div>
                <span className="text-sm font-medium text-foreground">{user?.username || "Vendor"}</span>
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="lg:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
            {navItems.map(item => {
            const active = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted hover:text-foreground"}`}>
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </Link>;
          })}
          </nav>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>;
}
