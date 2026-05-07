import { useState, useEffect } from "react";
import { Search, Download, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import styles from "./VendorOrdersPage.module.css";
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
    case "Cancelled":
      return styles.statusCancelled;
    default:
      return styles.statusPending;
  }
};

const getPaymentClass = (payment) => {
  switch(payment) {
    case "Paid":
      return styles.paymentPaid;
    case "Pending":
      return styles.paymentPending;
    case "Refunded":
      return styles.paymentRefunded;
    default:
      return styles.paymentPending;
  }
};

const getSummaryBorderClass = (status) => {
  switch(status) {
    case "Pending":
      return styles.summaryPending;
    case "Processing":
      return styles.summaryProcessing;
    case "Shipped":
      return styles.summaryShipped;
    case "Delivered":
      return styles.summaryDelivered;
    default:
      return styles.summaryPending;
  }
};

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [orderStatuses, setOrderStatuses] = useState({});

  const fetchOrders = async (search = '', status = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'All Status') params.append('status', status.toLowerCase());
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/vendor/my?${params}`,
        { withCredentials: true }
      );
      
      const fetchedOrders = response.data.orders || [];
      setAllOrders(fetchedOrders);
      setOrders(fetchedOrders);
      
      // Initialize order statuses
      const initialStatuses = {};
      fetchedOrders.forEach(order => {
        initialStatuses[order._id] = order.vendorStatus || order.status || 'pending';
      });
      setOrderStatuses(initialStatuses);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Get valid next statuses based on current status
  const getValidStatusTransitions = (currentStatus) => {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['refunded'],
      cancelled: [],
      refunded: []
    };
    return transitions[currentStatus] || [];
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: newStatus }));
  };


  const updateOrderStatus = async (orderId) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId));
      
      const status = orderStatuses[orderId];
      
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      
      // Refresh orders
      await fetchOrders();
      
      // Show success message
      alert('Order status updated successfully');
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchOrders(); // Fetch all orders initially
  }, []);

  // Apply client-side filtering
  useEffect(() => {
    // Apply client-side filtering only when allOrders has data
    if (allOrders.length === 0) return;
    
    let filtered = allOrders;

    

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'All Status') {
      filtered = filtered.filter(order => 
        (order.vendorStatus || order.status || 'pending').toLowerCase() === statusFilter.toLowerCase()
      );
    }


    setOrders(filtered);
  }, [allOrders, searchTerm, statusFilter]);

  // Calculate summary statistics from ALL orders (not filtered)
  const summaryStats = allOrders.reduce((acc, order) => {
    const status = (order.vendorStatus || order.status || 'pending').toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const summaryCards = [
    { label: "Pending", count: summaryStats.pending || 0, status: "Pending" },
    { label: "Processing", count: summaryStats.processing || 0, status: "Processing" },
    { label: "Shipped", count: summaryStats.shipped || 0, status: "Shipped" },
    { label: "Delivered", count: summaryStats.delivered || 0, status: "Delivered" }
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button onClick={fetchOrders} className={styles.retryButton}>Retry</button>
        </div>
      </div>
    );
  }

  return <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>{orders.length} total orders</p>
        </div>
        <button className={styles.exportButton}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by order ID, customer..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        {summaryCards.map(s => <div key={s.label} className={`${styles.summaryCard} ${getSummaryBorderClass(s.status)}`}>
            <p className={styles.summaryLabel}>{s.label}</p>
            <p className={styles.summaryCount}>{s.count}</p>
          </div>)}
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.ordersTable}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.tableCell}>Order</th>
                <th className={styles.tableCell}>Customer</th>
                <th className={`${styles.tableCell} ${styles.hiddenLg}`}>Product</th>
                <th className={styles.tableCell}>Amount</th>
                <th className={`${styles.tableCell} ${styles.hiddenSm}`}>Payment</th>
                <th className={`${styles.tableCell} ${styles.hiddenMd}`}>Date</th>
                <th className={styles.tableCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const orderNumber = o.orderNumber || o._id?.slice(-8).toUpperCase();
                const customerName = o.customer?.firstName && o.customer?.lastName 
                  ? `${o.customer.firstName} ${o.customer.lastName}`
                  : 'Customer';
                const customerEmail = o.customer?.email || '';
                const productName = o.items?.[0]?.product?.name || 'Product';
                const orderDate = (o.orderDate || o.createdAt) ? new Date(o.orderDate || o.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'Unknown';
                const orderStatus = o.vendorStatus || o.status || 'pending';
                const paymentStatus = o.paymentStatus || 'pending';
                const totalAmount = o.total || 0;

                return <tr key={o._id || o.id} className="tableBody tr">
                  <td className={`${styles.tableCell} ${styles.orderId}`}>{orderNumber}</td>
                  <td className={styles.tableCell}>
                    <p className={styles.customerName}>{customerName}</p>
                    {customerEmail && <p className={styles.customerEmail}>{customerEmail}</p>}
                  </td>
                  <td className={`${styles.tableCell} text-muted-foreground ${styles.hiddenLg}`}>{productName}</td>
                  <td className={`${styles.tableCell} ${styles.amount}`}>Rs{totalAmount.toLocaleString()}</td>
                  <td className={`${styles.tableCell} ${getPaymentClass(paymentStatus)} ${styles.hiddenSm}`}>{paymentStatus}</td>
                  <td className={`${styles.tableCell} text-muted-foreground ${styles.hiddenMd}`}>{orderDate}</td>
                  <td className={styles.tableCell}>
                    <div className={styles.statusControls}>
                      <select 
                        value={orderStatuses[o._id] || orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className={`${styles.statusSelect} ${getStatusClass(orderStatuses[o._id] || orderStatus)}`}
                        disabled={updatingOrders.has(o._id)}
                      >
                        <option value={orderStatus}>{orderStatus}</option>
                        {getValidStatusTransitions(orderStatuses[o._id] || orderStatus).map(nextStatus => (
                          <option key={nextStatus} value={nextStatus}>{nextStatus}</option>
                        ))}
                      </select>
                      
                      
                      {(orderStatuses[o._id] !== orderStatus) && (
                        <button 
                          onClick={() => updateOrderStatus(o._id)}
                          disabled={updatingOrders.has(o._id)}
                          className={styles.updateButton}
                        >
                          {updatingOrders.has(o._id) ? 'Updating...' : 'Update'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}
