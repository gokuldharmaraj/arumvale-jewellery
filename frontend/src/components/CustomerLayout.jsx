import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, BarChart3, ShoppingCart, Package, User, Menu, X, LogIn, UserPlus, LogOut, Palette } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import styles from "./CustomerLayout.module.css";
const navItems = [{
  label: "Home",
  path: "/",
  icon: Home
}, {
  label: "Products",
  path: "/products",
  icon: Search
}, {
  label: "Custom Design",
  path: "/custom-requests",
  icon: Palette
}, {
  label: "Compare",
  path: "/compare",
  icon: BarChart3
}, {
  label: "Cart",
  path: "/cart",
  icon: ShoppingCart
}, {
  label: "Orders",
  path: "/orders",
  icon: Package
}];
export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    compareItems
  } = useCompare();
  const {
    user,
    isLoggedIn,
    logout
  } = useAuth();
  const { getCartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  return <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>Arumvale</span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.navLinks}>
            {navItems.map(item => {
            // Hide Custom Design for vendors and admins
            if (item.label === "Custom Design" && user && (user.role === 'vendor' || user.role === 'admin')) {
              return null;
            }
            const active = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={`${styles.navLink} ${active ? styles.active : ''}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.label === "Compare" && compareItems.length > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {compareItems.length}
                    </span>}
                  {item.label === "Cart" && isLoggedIn && getCartItemCount() > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {getCartItemCount()}
                    </span>}
                </Link>;
          })}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`${styles.navLink} ${location.pathname === "/profile" ? styles.active : ''}`}>
                  <User className="h-4 w-4" />
                  Account
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isLoggedIn ? <>
                    {/* Role-based menu items */}
                    {user?.role === 'user' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" /> My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                            <Package className="h-4 w-4" /> My Orders
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {user?.role === 'vendor' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/vendor" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" /> Vendor Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </> : <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="flex items-center gap-2 cursor-pointer">
                        <LogIn className="h-4 w-4" /> Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="flex items-center gap-2 cursor-pointer">
                        <UserPlus className="h-4 w-4" /> Register as Customer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register/vendor" className="flex items-center gap-2 cursor-pointer">
                        <UserPlus className="h-4 w-4" /> Register as Shop Owner
                      </Link>
                    </DropdownMenuItem>
                  </>}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.mobileMenuButton}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && <nav className={`${styles.mobileMenu} ${styles.open}`}>
            {navItems.map(item => {
          // Hide Custom Design for vendors and admins
          if (item.label === "Custom Design" && user && (user.role === 'vendor' || user.role === 'admin')) {
            return null;
          }
          const active = location.pathname === item.path;
          return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`${styles.mobileMenuLink} ${active ? styles.active : ''}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.label === "Compare" && compareItems.length > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {compareItems.length}
                    </span>}
                  {item.label === "Cart" && isLoggedIn && getCartItemCount() > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {getCartItemCount()}
                    </span>}
                </Link>;
        })}
            <div className="border-t border-border my-2 pt-2">
              {isLoggedIn ? <>
                    {/* Role-based mobile menu items */}
                    {user?.role === 'user' && (
                      <>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                          <Package className="h-4 w-4" /> My Orders
                        </Link>
                      </>
                    )}
                    
                    {user?.role === 'vendor' && (
                      <>
                        <Link to="/vendor" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                          <User className="h-4 w-4" /> Vendor Dashboard
                        </Link>
                      </>
                    )}
                    
                    {user?.role === 'admin' && (
                      <>
                        <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                          <User className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      </>
                    )}
                    
                  <button onClick={handleLogout} className={`${styles.mobileMenuLink} ${styles.dropdownDestructive}`}>
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </> : <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                    <UserPlus className="h-4 w-4" /> Register as Customer
                  </Link>
                  <Link to="/register/vendor" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>
                    <UserPlus className="h-4 w-4" /> Register as Shop Owner
                  </Link>
                </>}
            </div>
          </nav>}
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <p className={styles.logoText}>Arumvale</p>
          <p className="text-sm text-muted-foreground">Smart Jewellery Comparison Platform © 2026</p>
        </div>
      </footer>
    </div>;
}
