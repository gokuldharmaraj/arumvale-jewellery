import { User, Package, Heart, ChevronRight, Star, ShoppingBag, GitCompareArrows, Eye, EyeOff, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const quickLinks = [{
  icon: Package,
  label: "My Orders",
  desc: "Track & manage orders",
  path: "/orders"
}, {
  icon: Palette,
  label: "My Custom Requests",
  desc: "Track & manage custom designs",
  path: "/custom-requests"
}, {
  icon: Heart,
  label: "Cart",
  desc: "See Cart items",
  path: "/cart"
}, {
  icon: GitCompareArrows,
  label: "Comparisons",
  desc: "Compare products",
  path: "/compare"
}];
export default function ProfilePage() {
  const { user } = useAuth();
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Fetch recent orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setLoadingOrders(true);
        try {
          const response = await axios.get("http://localhost:5000/api/orders/my", {
            withCredentials: true
          });
          setRecentOrders(response.data.orders?.slice(0, 3) || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    fetchOrders();
  }, [user]);
  
  // Format member since date
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';
  
  // Get user location
  const userLocation = user?.address?.city 
    ? `${user.address.city}${user.address.state ? ', ' + user.address.state : ''}${user.address.country ? ', ' + user.address.country : ''}`
    : 'Location not set';

  return <div className="container py-10">
      {/* Welcome Header */}
      <div className="bg-luxury-black rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
            <User className="h-9 w-9 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-cream mb-1">
              Welcome back, {user?.firstName || 'User'}
            </h1>
           
          </div>
        </div>
      </div>

      {/* Personal Information Toggle */}
      <div className="mb-8">
        <button
          onClick={() => setShowPersonalInfo(!showPersonalInfo)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          {showPersonalInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="font-medium text-foreground">
            {showPersonalInfo ? 'Hide' : 'View'} Personal Information
          </span>
        </button>
        
        {showPersonalInfo && (
          <div className="mt-4 bg-card border border-border rounded-xl p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-medium text-foreground">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Username</p>
                <p className="font-medium text-foreground">{user?.username || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="font-medium text-foreground">{user?.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                <p className="font-medium text-foreground">{user?.phone || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-medium text-foreground">
                  {user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="font-medium text-foreground capitalize">{user?.gender || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-medium text-foreground">
                  {user?.address?.fullAddress || 'Not set'}
                  {user?.address?.city && `, ${user.address.city}`}
                  {user?.address?.state && `, ${user.address.state}`}
                  {user?.address?.pincode && ` - ${user.address.pincode}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>


      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-foreground">Recent Orders</h2>
            <Link to="/orders" className="text-xs text-primary hover:text-gold-dark transition-colors flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loadingOrders ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No orders yet. Start shopping to see your recent orders here.
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <div key={order._id} className={`flex items-center justify-between p-5 hover:bg-muted/50 transition-colors ${i < recentOrders.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {order.items?.[0]?.product?.name || 'Order Items'}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {order.orderNumber} · {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold text-foreground text-sm">₹{order.total.toLocaleString()}</p>
                    <span className={`text-xs font-medium ${
                      order.status === "delivered" ? "text-green-600" : 
                      order.status === "shipped" ? "text-blue-600" : 
                      "text-yellow-600"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-5">Quick Links</h2>
          <div className="space-y-3">
            {quickLinks.map(link => <Link key={link.label} to={link.path} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <link.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{link.label}</p>
                  <p className="text-muted-foreground text-xs">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>)}
          </div>
        </div>
      </div>

    </div>;
}
