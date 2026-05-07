import { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, Package, Truck, CheckCircle, Clock, XCircle, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import styles from "./AdminOrdersPage.module.css";
const getStatusConfig = (status) => {
  switch(status) {
    case "delivered":
      return {
        style: styles.statusCompleted,
        icon: CheckCircle
      };
    case "processing":
      return {
        style: styles.statusProcessing,
        icon: Package
      };
    case "shipped":
      return {
        style: styles.statusShipped,
        icon: Truck
      };
    case "pending":
      return {
        style: styles.statusPending,
        icon: Clock
      };
    case "cancelled":
      return {
        style: styles.statusCancelled,
        icon: XCircle
      };
    case "confirmed":
      return {
        style: styles.statusProcessing,
        icon: Package
      };
    default:
      return {
        style: styles.statusPending,
        icon: Clock
      };
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/orders", {
          withCredentials: true
        });
        const orderList = response.data.orders || [];
        setOrders(orderList);
        
        // Fetch stats from admin endpoint
        const statsResponse = await axios.get("http://localhost:5000/api/admin/orders/stats", {
          withCredentials: true
        });
        const statsData = statsResponse.data;
        setStats({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          confirmed: statsData.confirmed || 0,
          processing: statsData.processing || 0,
          shipped: statsData.shipped || 0,
          delivered: statsData.delivered || 0,
          cancelled: statsData.cancelled || 0
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchesSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || 
                         o._id?.toLowerCase().includes(search.toLowerCase()) || 
                         (o.customer?.firstName?.toLowerCase().includes(search.toLowerCase()) || 
                          o.customer?.lastName?.toLowerCase().includes(search.toLowerCase()));
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "pending") return matchesSearch && o.status === "pending";
    if (statusFilter === "processing") return matchesSearch && o.status === "processing";
    if (statusFilter === "shipped") return matchesSearch && o.status === "shipped";
    if (statusFilter === "delivered") return matchesSearch && o.status === "delivered";
    if (statusFilter === "cancelled") return matchesSearch && o.status === "cancelled";
    if (statusFilter === "confirmed") return matchesSearch && o.status === "confirmed";
    
    return matchesSearch;
  });

  const handleViewOrder = async (order) => {
    try {
      setActionLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/orders/${order._id}`, {
        withCredentials: true
      });
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getVendorDisplay = (order) => {
    if (!order.vendors || order.vendors.length === 0) {
      return "Unknown";
    }
    if (order.vendors.length === 1) {
      return order.vendors[0].vendor?.username || "Unknown";
    }
    return "Multiple Vendors";
  };

  const formatCustomerName = (customer) => {
    if (!customer) return "Unknown";
    return `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className={styles.container}>
        <div className="flex items-center justify-center py-20">
          <Package className="animate-spin h-8 w-8 text-primary" />
        </div>
      </div>;
  }
  return <div className={styles.container}>
      <div className={styles.summaryGrid}>
        {[{
        label: "Total Orders",
        value: stats.total.toString()
      }, {
        label: "Pending",
        value: stats.pending.toString()
      }, {
        label: "Processing",
        value: stats.processing.toString()
      }, {
        label: "Shipped",
        value: stats.shipped.toString()
      }, {
        label: "Delivered",
        value: stats.delivered.toString()
      }, {
        label: "Cancelled",
        value: stats.cancelled.toString()
      }].map(s => <Card key={s.label} className={styles.summaryCard}>
            <CardContent className={styles.summaryCardContent}>
              <p className={styles.summaryLabel}>{s.label}</p>
              <p className={styles.summaryValue}>{s.value}</p>
            </CardContent>
          </Card>)}
      </div>

      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <div className={styles.tableHeaderContentRow}>
            <CardTitle className={styles.tableTitle}>All Orders</CardTitle>
            <div className={styles.tableActions}>
              <div className={styles.searchContainer}>
                <div className="flex items-center gap-2">
                  <Search className={styles.searchIcon} />
                  <Input 
                    placeholder="Search orders..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className={styles.searchInput} 
                  />
                </div>
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={styles.filterButton}>
                    <Filter className="h-3.5 w-3.5" /> Filter
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                    Processing Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>
                    Shipped Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
                    Delivered Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                    Cancelled Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>
                    Confirmed Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className={styles.exportButton}><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableCell}>Order ID</th>
                  <th className={styles.tableCell}>Customer</th>
                  <th className={`${styles.tableCell} ${styles.hiddenMd}`}>Vendor</th>
                  <th className={`${styles.tableCell} ${styles.hiddenSm}`}>Amount</th>
                  <th className={styles.tableCell}>Status</th>
                  <th className={`${styles.tableCell} ${styles.hiddenLg}`}>Date</th>
                  <th className={styles.tableCell}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                const sc = getStatusConfig(o.status);
                const StatusIcon = sc.icon;
                return <tr key={o._id} className="tableBody tr">
                      <td className={`${styles.tableCell} ${styles.orderId}`}>{o.orderNumber || `ORD${o._id?.slice(-8)?.toUpperCase()}`}</td>
                      <td className={`${styles.tableCell} text-foreground`}>{formatCustomerName(o.customer)}</td>
                      <td className={`${styles.tableCell} text-muted-foreground ${styles.hiddenMd}`}>{getVendorDisplay(o)}</td>
                      <td className={`${styles.tableCell} text-foreground font-medium ${styles.hiddenSm}`}>₹{o.total?.toLocaleString() || "0"}</td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${sc.style}`}>
                          <StatusIcon className={styles.statusIcon} /> {o.status?.charAt(0)?.toUpperCase() + o.status?.slice(1)}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} text-muted-foreground ${styles.hiddenLg}`}>{formatDate(o.orderDate || o.createdAt)}</td>
                      <td className={styles.tableCell}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleViewOrder(o)}
                          disabled={actionLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>;
              })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderInfo}>
                <div className={styles.orderHeader}>
                  <div>
                    <h3>{selectedOrder.orderNumber || `ORD${selectedOrder._id?.slice(-8)?.toUpperCase()}`}</h3>
                    <p className={styles.orderDate}>Order Date: {formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</p>
                  </div>
                  <div className={styles.orderStatus}>
                    <Badge variant={selectedOrder.status === "delivered" ? "default" : "secondary"}>
                      {selectedOrder.status?.charAt(0)?.toUpperCase() + selectedOrder.status?.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4>Customer Information</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Name:</span>
                      <span>{formatCustomerName(selectedOrder.customer)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Email:</span>
                      <span>{selectedOrder.customer?.email || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Phone:</span>
                      <span>{selectedOrder.customer?.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4>Shipping Address</h4>
                  <div className={styles.address}>
                    <p>{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                    <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4>Order Items</h4>
                  <div className={styles.itemsList}>
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.product?.name || "Unknown Product"}</span>
                          <span className={styles.itemDetails}>Qty: {item.quantity} × ₹{item.price?.toLocaleString() || "0"}</span>
                        </div>
                        <span className={styles.itemTotal}>₹{item.total?.toLocaleString() || "0"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.vendors && selectedOrder.vendors.length > 0 && (
                  <div className={styles.infoSection}>
                    <h4>Vendor Breakdown</h4>
                    <div className={styles.vendorsList}>
                      {selectedOrder.vendors.map((vendor, index) => (
                        <div key={index} className={styles.vendorInfo}>
                          <div className={styles.vendorName}>{vendor.vendor?.username || "Unknown Vendor"}</div>
                          <div className={styles.vendorDetails}>
                            <span>Items: {vendor.items?.length || 0}</span>
                            <span>Subtotal: ₹{vendor.subtotal?.toLocaleString() || "0"}</span>
                            <span>Status: {vendor.status?.charAt(0)?.toUpperCase() + vendor.status?.slice(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.infoSection}>
                  <h4>Payment Information</h4>
                  <div className={styles.paymentInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Method:</span>
                      <span>{selectedOrder.paymentMethod?.toUpperCase() || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Status:</span>
                      <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "secondary"}>
                        {selectedOrder.paymentStatus?.charAt(0)?.toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                      </Badge>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Payment ID:</span>
                      <span>{selectedOrder.paymentId || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.orderTotals}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString() || "0"}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Tax:</span>
                    <span>₹{selectedOrder.tax?.toLocaleString() || "0"}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.shipping?.toLocaleString() || "0"}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className={styles.totalRow}>
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount?.toLocaleString() || "0"}</span>
                    </div>
                  )}
                  <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                    <span>Total:</span>
                    <span>₹{selectedOrder.total?.toLocaleString() || "0"}</span>
                  </div>
                </div>


                {selectedOrder.adminNotes && (
                  <div className={styles.infoSection}>
                    <h4>Admin Notes</h4>
                    <p className={styles.adminNotes}>{selectedOrder.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}
