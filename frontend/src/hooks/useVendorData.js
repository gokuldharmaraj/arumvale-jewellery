import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Shared vendor data hook for global search
export default function useVendorData() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendorData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [productsRes, ordersRes, requestsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products/my", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/orders/vendor/my", {
          withCredentials: true,
        }),
        axios.get(
          "http://localhost:5000/api/custom-requests/vendor?status=pending,under_review,estimated,approved,ordered,converted",
          { withCredentials: true },
        ),
      ]);

      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setRequests(requestsRes.data || []);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  return {
    products,
    orders,
    requests,
    loading,
    refetch: fetchVendorData,
  };
}
