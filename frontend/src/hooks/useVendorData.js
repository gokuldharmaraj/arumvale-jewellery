import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Shared vendor data hook for global search
export default function useVendorData() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVendorData = useCallback(async () => {
    try {
      // Only fetch vendor data if user is an approved vendor
      if (!user || user.role !== "vendor" || !user.isApproved) {
        setProducts([]);
        setOrders([]);
        setRequests([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch all data in parallel
      const [productsRes, ordersRes, requestsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products/my`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/api/orders/vendor/my`, {
          withCredentials: true,
        }),
        axios.get(
          `${API_BASE_URL}/api/custom-requests/vendor?status=pending,under_review,estimated,approved,ordered,converted`,
          { withCredentials: true },
        ),
      ]);

      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setRequests(requestsRes.data || []);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      // Set empty arrays on error to prevent undefined errors
      setProducts([]);
      setOrders([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
