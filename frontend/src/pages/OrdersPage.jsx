import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/getImageUrl";
import axios from "axios";
import LoginPrompt from "@/components/LoginPrompt";

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders/my", {
          withCredentials: true,
        });
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginPrompt title="Sign In to View Orders" description="Log in to track your orders and view your purchase history." icon={<Package className="h-10 w-10 text-primary" />} />;
  }

  if (loading) {
    return <div className="container py-20 text-center">Loading orders...</div>;
  }

  if (error) {
    return <div className="container py-20 text-center text-red-500">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border rounded-lg p-6 bg-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">Rs{order.total.toLocaleString()}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "confirmed"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "shipped"
                    ? "bg-purple-100 text-purple-800"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => {
                const imageUrl = getImageUrl(item.product.images?.[0]);
                
                return (
                  <div key={item.product._id} className="flex items-center space-x-4">
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × Rs{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rs{item.total.toLocaleString()}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
