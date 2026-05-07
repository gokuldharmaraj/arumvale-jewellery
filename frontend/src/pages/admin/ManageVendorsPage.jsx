import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle, Clock, XCircle, ExternalLink, Eye, Ban, Check, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import styles from "./ManageVendorsPage.module.css";

const getStatusConfig = (status) => {
  switch(status) {
    case "Verified":
      return {
        style: styles.statusVerified,
        icon: CheckCircle
      };
    case "Pending":
      return {
        style: styles.statusPending,
        icon: Clock
      };
    case "Suspended":
      return {
        style: styles.statusSuspended,
        icon: XCircle
      };
    default:
      return {
        style: styles.statusPending,
        icon: Clock
      };
  }
};

export default function ManageVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/vendors", {
        withCredentials: true
      });
      setVendors(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await axios.put(`http://localhost:5000/api/vendors/${vendorId}/approve`, {
        approved: true
      }, {
        withCredentials: true
      });
      
      toast({
        title: "Success",
        description: "Vendor approved successfully"
      });
      
      fetchVendors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve vendor",
        variant: "destructive"
      });
    }
  };

  const handleRejectVendor = async (vendorId) => {
    try {
      await axios.put(`http://localhost:5000/api/vendors/${vendorId}/approve`, {
        approved: false,
        rejectionReason: "Application rejected by admin"
      }, {
        withCredentials: true
      });
      
      toast({
        title: "Success",
        description: "Vendor rejected successfully"
      });
      
      fetchVendors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject vendor",
        variant: "destructive"
      });
    }
  };

  const handleToggleVendorStatus = async (vendorId, isActive) => {
    try {
      await axios.put(`http://localhost:5000/api/vendors/${vendorId}/toggle-status`, {
        isActive,
        suspensionReason: isActive ? null : "Suspended by admin"
      }, {
        withCredentials: true
      });
      
      toast({
        title: "Success",
        description: isActive ? "Vendor activated successfully" : "Vendor suspended successfully"
      });
      
      fetchVendors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    }
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorDetails(true);
  };

  const getStatusConfig = (vendor) => {
    if (!vendor.user?.isApproved) {
      return {
        style: styles.statusPending,
        icon: Clock,
        status: "Pending"
      };
    }
    
    if (!vendor.isActive) {
      return {
        style: styles.statusSuspended,
        icon: XCircle,
        status: "Suspended"
      };
    }
    
    if (vendor.isVerified) {
      return {
        style: styles.statusVerified,
        icon: CheckCircle,
        status: "Verified"
      };
    }
    
    return {
      style: styles.statusPending,
      icon: Clock,
      status: "Pending"
    };
  };

  const filtered = vendors.filter(v => {
    const matchesSearch = v.shopName?.toLowerCase().includes(search.toLowerCase()) ||
                         v.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                         v.user?.email?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "verified") return matchesSearch && v.isVerified && v.isActive;
    if (statusFilter === "pending") return matchesSearch && !v.user?.isApproved;
    if (statusFilter === "suspended") return matchesSearch && !v.isActive;
    
    return matchesSearch;
  });

  const stats = {
    total: vendors.length,
    verified: vendors.filter(v => v.isVerified && v.isActive).length,
    pending: vendors.filter(v => !v.user?.isApproved).length,
    suspended: vendors.filter(v => !v.isActive).length
  };

  if (loading) {
    return <div className={styles.container}>
      <div className="text-center py-8">Loading vendors...</div>
    </div>;
  }

  return <div className={styles.container}>
      <div className={styles.summaryGrid}>
        {[{
        label: "Total Vendors",
        value: stats.total.toString()
      }, {
        label: "Verified",
        value: stats.verified.toString()
      }, {
        label: "Pending Review",
        value: stats.pending.toString()
      }, {
        label: "Suspended",
        value: stats.suspended.toString()
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
            <CardTitle className={styles.tableTitle}>All Vendors</CardTitle>
            <div className={styles.tableActions}>
              <div className={styles.searchContainer}>
                <div className="flex items-center gap-2">
                  <Search className={styles.searchIcon} />
                  <Input 
                    placeholder="Search vendors..." 
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
                    All Vendors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("verified")}>
                    Verified Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending Only
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
            <table className={styles.vendorsTable}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableCell}>Vendor</th>
                  <th className={`${styles.tableCell} ${styles.hiddenMd}`}>Products</th>
                  <th className={`${styles.tableCell} ${styles.hiddenSm}`}>Revenue</th>
                  <th className={styles.tableCell}>Status</th>
                  <th className={styles.tableCell}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                const sc = getStatusConfig(v);
                const StatusIcon = sc.icon;
                return <tr key={v._id} className="tableBody tr">
                      <td className={styles.tableCell}>
                        <div className={styles.vendorInfo}>
                          <p className={styles.vendorName}>{v.shopName}</p>
                          <p className={styles.vendorOwner}>{v.user?.firstName} {v.user?.lastName}</p>
                        </div>
                      </td>
                      <td className={`${styles.tableCell} text-foreground font-medium ${styles.hiddenMd}`}>{v.totalProducts || 0}</td>
                      <td className={`${styles.tableCell} text-foreground font-medium ${styles.hiddenSm}`}>${(v.totalSales || 0).toLocaleString()}</td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${sc.style}`}>
                          <StatusIcon className={styles.statusIcon} /> {sc.status}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionCell}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={styles.actionButton}>
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleApproveVendor(v._id)} disabled={v.user?.isApproved}>
                                <Check className="h-4 w-4 mr-2" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectVendor(v._id)} disabled={v.user?.isApproved}>
                                <XCircle className="h-4 w-4 mr-2" /> Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVendorStatus(v._id, !v.isActive)}>
                                {v.isActive ? <Ban className="h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                {v.isActive ? "Suspend" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewVendor(v)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>;
              })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Details Modal */}
      {showVendorDetails && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Vendor Details</h2>
              <button 
                onClick={() => setShowVendorDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Shop Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Shop Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shop Name</label>
                    <p className="text-lg">{selectedVendor.shopName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shop Type</label>
                    <p className="text-lg capitalize">{selectedVendor.shopType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Years in Business</label>
                    <p className="text-lg">{selectedVendor.yearsInBusiness || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="text-lg">
                      {selectedVendor.website ? (
                        <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedVendor.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg">
                      {selectedVendor.user?.firstName && selectedVendor.user?.lastName 
                        ? `${selectedVendor.user.firstName} ${selectedVendor.user.lastName}`
                        : selectedVendor.user?.firstName || 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{selectedVendor.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg">{selectedVendor.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined Date</label>
                    <p className="text-lg">{new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Status Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor Status</label>
                    <p className="text-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        !selectedVendor.isActive 
                          ? styles.statusSuspended 
                          : selectedVendor.isVerified 
                            ? styles.statusVerified 
                            : styles.statusPending
                      }`}>
                        {!selectedVendor.isActive 
                          ? "Suspended" 
                          : selectedVendor.isVerified 
                            ? "Verified" 
                            : "Pending"
                        }
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approval Status</label>
                    <p className="text-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedVendor.user?.isApproved 
                          ? styles.statusVerified 
                          : styles.statusPending
                      }`}>
                        {selectedVendor.user?.isApproved ? "Approved" : "Pending Approval"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Performance */}
              <div>
                <h3 className="text-lg font-medium mb-2">Business Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedVendor.totalProducts || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${(selectedVendor.totalSales || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Business Documents */}
              <div>
                <h3 className="text-lg font-medium mb-2">Business Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">GST Number</label>
                    <p className="text-lg">{selectedVendor.gstNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">PAN Number</label>
                    <p className="text-lg">{selectedVendor.panNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">BIS Hallmark</label>
                    <p className="text-lg">{selectedVendor.bisHallmark || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-lg font-medium mb-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bank Name</label>
                    <p className="text-lg">{selectedVendor.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Number</label>
                    <p className="text-lg">****{selectedVendor.accountNumber?.slice(-4) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                    <p className="text-lg">{selectedVendor.ifscCode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    handleToggleVendorStatus(selectedVendor._id, !selectedVendor.isActive);
                    setShowVendorDetails(false);
                  }}
                  className={`px-4 py-2 rounded text-white ${
                    !selectedVendor.isActive 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {!selectedVendor.isActive ? 'Activate Vendor' : 'Suspend Vendor'}
                </button>
                <button
                  onClick={() => setShowVendorDetails(false)}
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
