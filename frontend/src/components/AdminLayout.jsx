import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Store, Package, ShoppingBag, FileText, ChevronLeft, Bell, Search, LogOut, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import GlobalSearch from "@/components/GlobalSearch";
import styles from "./AdminLayout.module.css";
const navItems = [{
  label: "Dashboard",
  path: "/admin",
  icon: LayoutDashboard
}, {
  label: "Users",
  path: "/admin/users",
  icon: Users
}, {
  label: "Vendors",
  path: "/admin/vendors",
  icon: Store
}, {
  label: "Products",
  path: "/admin/products",
  icon: Package
}, {
  label: "Orders",
  path: "/admin/orders",
  icon: ShoppingBag
}, {
  label: "Reports",
  path: "/admin/reports",
  icon: FileText
}];
export default function AdminLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { logout } = useAuth();
  const currentPage = navItems.find(i => i.path === location.pathname)?.label || "Dashboard";
  
  // Fetch notification data
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch pending vendors
        const vendorsResponse = await axios.get("http://localhost:5000/api/vendors", { withCredentials: true });
        const pendingVendors = vendorsResponse.data.filter(v => v.status === 'Pending').length;
        
        // Fetch pending orders
        const ordersResponse = await axios.get("http://localhost:5000/api/orders", { withCredentials: true });
        const pendingOrders = ordersResponse.data.filter(o => o.status === 'pending').length;
        
        const notificationData = [];
        if (pendingVendors > 0) {
          notificationData.push({
            id: 'pending-vendors',
            type: 'vendor',
            count: pendingVendors,
            label: 'Pending vendor approvals',
            link: '/admin/vendors',
            icon: Store
          });
        }
        if (pendingOrders > 0) {
          notificationData.push({
            id: 'pending-orders',
            type: 'order',
            count: pendingOrders,
            label: 'New orders to process',
            link: '/admin/orders',
            icon: ShoppingBag
          });
        }
        
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    await logout();
  };
  return <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Brand */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>
            <div className={styles.sidebarLogoIcon}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className={styles.sidebarLogoText}>GoldVault</h2>
              <p className={styles.sidebarSubtitle}>Admin Console</p>
            </div>
          </div>
          <Link to="/" className={styles.backLink}>
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <p className={styles.navSectionTitle}>Navigation</p>
          {navItems.map(item => {
          const active = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={`${styles.navItem} ${active ? styles.active : ''}`}>
                <item.icon className={styles.navIcon} />
                {item.label}
                {item.label === "Orders" && <span className={styles.navBadge}>
                    12
                  </span>}
              </Link>;
        })}
        </nav>

        {/* Admin profile */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <span className={styles.userAvatarText}>SA</span>
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>Super Admin</p>
              <p className={styles.userEmail}>admin@goldvault.in</p>
            </div>
            <button className={styles.userMenuButton} onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.header}>
          <div className={styles.headerContainer}>
            <div className={styles.headerLeft}>
              {/* Mobile brand */}
              <div className={styles.mobileBrand}>
                <div className={styles.mobileLogo}>
                  <Shield className="h-4 w-4" />
                </div>
                <span className={styles.mobileBrandText}>Admin</span>
              </div>
              <div className={styles.pageTitle}>
                <h1 className={styles.headerTitle}>{currentPage}</h1>
                <p className={styles.headerSubtitle}>Manage your platform operations</p>
              </div>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.searchContainer}>
                <GlobalSearch />
              </div>
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <button className={styles.notificationButton}>
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className={styles.notificationBadge} />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No new notifications</p>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map(notification => (
                          <DropdownMenuItem key={notification.id} asChild>
                            <Link to={notification.link} className="flex items-center gap-3 p-2 cursor-pointer">
                              <notification.icon className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{notification.label}</p>
                                <p className="text-xs text-muted-foreground">{notification.count} item{notification.count !== 1 ? 's' : ''}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {notification.count}
                              </Badge>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className={styles.mobileNav}>
            {navItems.map(item => {
            const active = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ''}`}>
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
