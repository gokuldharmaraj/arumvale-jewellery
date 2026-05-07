import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Mail, UserPlus, Eye, Ban, Check, Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import styles from "./ManageUsersPage.module.css";

const getStatusClass = (status) => {
  switch(status) {
    case "Active":
      return styles.statusActive;
    case "Suspended":
      return styles.statusSuspended;
    case "Inactive":
      return styles.statusInactive;
    default:
      return styles.statusInactive;
  }
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    newToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserStats();
    fetchUsers();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/stats", {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user statistics",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        withCredentials: true
      });
      setUsers(response.data.users || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`, {
        withCredentials: true
      });
      setSelectedUser(response.data);
      setShowUserDetails(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive"
      });
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        isActive
      }, {
        withCredentials: true
      });
      
      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'suspended'} successfully`
      });
      
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.firstName?.toLowerCase().includes(search.toLowerCase()) || 
                         u.lastName?.toLowerCase().includes(search.toLowerCase()) || 
                         u.email?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && u.isActive === true;
    if (statusFilter === "suspended") return matchesSearch && u.isActive === false;
    
    return matchesSearch;
  });
  if (loading) {
    return <div className={styles.container}>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    </div>;
  }

  return <div className={styles.container}>
      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        {[{
        label: "Total Users",
        value: stats.total.toString(),
        sub: "Registered users"
      }, {
        label: "Active",
        value: stats.active.toString(),
        sub: `${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%`
      }, {
        label: "Suspended",
        value: stats.suspended.toString(),
        sub: `${stats.total > 0 ? ((stats.suspended / stats.total) * 100).toFixed(1) : 0}%`
      }, {
        label: "New Today",
        value: stats.newToday.toString(),
        sub: "Joined today"
      }].map(s => <Card key={s.label} className={styles.summaryCard}>
            <CardContent className={styles.summaryCardContent}>
              <p className={styles.summaryLabel}>{s.label}</p>
              <p className={styles.summaryValue}>{s.value}</p>
              <p className={styles.summarySub}>{s.sub}</p>
            </CardContent>
          </Card>)}
      </div>

      {/* Table */}
      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <div className={styles.tableHeaderContentRow}>
            <CardTitle className={styles.tableTitle}>All Users</CardTitle>
            <div className={styles.tableActions}>
              <div className={styles.searchContainer}>
                <div className="flex items-center gap-2">
                  <Search className={styles.searchIcon} />
                  <Input 
                    placeholder="Search users..." 
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
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>
                    Suspended Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableCell}>User</th>
                  <th className={`${styles.tableCell} ${styles.hiddenMd}`}>Joined</th>
                  <th className={`${styles.tableCell} ${styles.hiddenLg}`}>Orders</th>
                  <th className={`${styles.tableCell} ${styles.hiddenSm}`}>Total Spent</th>
                  <th className={styles.tableCell}>Status</th>
                  <th className={styles.tableCell}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted-foreground">
                      {search ? "No users found matching your search" : "No users found"}
                    </td>
                  </tr>
                ) : filtered.map(u => {
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
                  const status = u.isActive === false ? "Suspended" : "Active";
                  return <tr key={u._id} className="tableBody tr">
                    <td className={styles.tableCell}>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{initials}</div>
                        <div className={styles.userInfo}>
                          <p className={styles.userName}>{fullName}</p>
                          <p className={styles.userEmail}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} text-muted-foreground ${styles.hiddenMd}`}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`${styles.tableCell} text-foreground font-medium ${styles.hiddenLg}`}>{u.orderCount || 0}</td>
                    <td className={`${styles.tableCell} text-foreground font-medium ${styles.hiddenSm}`}>
                      ₹{(u.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>{status}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionCell}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleViewUser(u._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className={`${styles.actionButton} ${status === "Suspended" ? styles.success : styles.danger}`}
                          onClick={() => handleToggleUserStatus(u._id, status === "Suspended")}
                        >
                          {status === "Suspended" ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button 
                onClick={() => setShowUserDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg">{`${selectedUser.user.firstName || ''} ${selectedUser.user.lastName || ''}`.trim() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{selectedUser.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg">{selectedUser.user.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-lg capitalize">{selectedUser.user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-lg">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedUser.user.isActive === false ? "Suspended" : "Active")}`}>
                      {selectedUser.user.isActive === false ? "Suspended" : "Active"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined Date</label>
                  <p className="text-lg">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Address Information */}
              {selectedUser.user.address && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Address</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>{selectedUser.user.address.fullAddress}</p>
                    <p>{selectedUser.user.address.city}, {selectedUser.user.address.state} {selectedUser.user.address.pincode}</p>
                    <p>{selectedUser.user.address.country}</p>
                  </div>
                </div>
              )}

              {/* Order Statistics */}
              <div>
                <h3 className="text-lg font-medium mb-2">Order Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.user.orderCount || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">₹{(selectedUser.user.totalSpent || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Recent Orders</h3>
                  <div className="space-y-2">
                    {selectedUser.recentOrders.map(order => (
                      <div key={order._id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Order #{order._id?.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.total.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{order.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    handleToggleUserStatus(selectedUser.user._id, selectedUser.user.isActive === false);
                    setShowUserDetails(false);
                  }}
                  className={`px-4 py-2 rounded text-white ${
                    selectedUser.user.isActive === false 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {selectedUser.user.isActive === false ? 'Activate User' : 'Suspend User'}
                </button>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}
