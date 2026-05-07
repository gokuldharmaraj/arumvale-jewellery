import { useState, useEffect } from "react";
import { Search, Filter, Eye, Ban, Star, Loader2, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import styles from "./AdminProductsPage.module.css";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    flagged: 0,
    avgRating: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/products", {
          withCredentials: true
        });
        const productList = response.data.products || [];
        setProducts(productList);
        
        // Fetch stats from admin endpoint
        const statsResponse = await axios.get("http://localhost:5000/api/admin/products/stats", {
          withCredentials: true
        });
        const statsData = statsResponse.data;
        setStats({
          totalProducts: statsData.total || 0,
          activeListings: statsData.active || 0,
          flagged: statsData.draft || 0,
          avgRating: statsData.averageRating || 0
        });
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && p.status === "active";
    if (statusFilter === "draft") return matchesSearch && p.status === "draft";
    if (statusFilter === "blocked") return matchesSearch && p.status === "blocked";
    
    return matchesSearch;
  });

  const handleViewProduct = async (product) => {
    try {
      setActionLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/products/${product._id}`, {
        withCredentials: true
      });
      setSelectedProduct(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleProductStatus = async (product) => {
    try {
      setActionLoading(true);
      const newStatus = product.status === "active" ? "draft" : "active";
      await axios.put(`http://localhost:5000/api/admin/products/${product._id}/toggle-status`, 
        { status: newStatus },
        { withCredentials: true }
      );
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p._id === product._id ? { ...p, status: newStatus } : p
      ));
      
      // Refresh stats
      const statsResponse = await axios.get("http://localhost:5000/api/admin/products/stats", {
        withCredentials: true
      });
      const statsData = statsResponse.data;
      setStats({
        totalProducts: statsData.total || 0,
        activeListings: statsData.active || 0,
        flagged: statsData.draft || 0,
        avgRating: statsData.averageRating || 0
      });
    } catch (error) {
      console.error("Error toggling product status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </div>;
  }
  return <div className={styles.container}>
      <div className={styles.summaryGrid}>
        {[{
        label: "Total Products",
        value: stats.totalProducts.toString()
      }, {
        label: "Active Listings",
        value: stats.activeListings.toString()
      }, {
        label: "Draft",
        value: stats.flagged.toString()
      }, {
        label: "Avg. Rating",
        value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"
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
            <CardTitle className={styles.tableTitle}>All Products</CardTitle>
            <div className={styles.tableActions}>
              <div className={styles.searchContainer}>
                <div className="flex items-center gap-2">
                  <Search className={styles.searchIcon} />
                  <Input 
                    placeholder="Search products..." 
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
                    All Products
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Draft Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("blocked")}>
                    Blocked Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableContainer}>
            <table className={styles.productsTable}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableCell}>Product</th>
                  <th className={`${styles.tableCell} ${styles.hiddenMd}`}>Vendor</th>
                  <th className={styles.tableCell}>Price</th>
                  <th className={`${styles.tableCell} ${styles.hiddenSm}`}>Category</th>
                  <th className={`${styles.tableCell} ${styles.hiddenLg}`}>Rating</th>
                  <th className={`${styles.tableCell} ${styles.hiddenLg}`}>Stock</th>
                  <th className={styles.tableCell}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => <tr key={p._id} className="tableBody tr">
                    <td className={styles.tableCell}>
                      <div className={styles.productCell}>
                        <div className={p.status === "draft" ? styles.blockedProductOverlay : ""}>
                          <img 
                            src={p.images?.[0] ? `http://localhost:5000${p.images[0]}` : "/placeholder.svg"} 
                            alt={p.name} 
                            className={`${styles.productImage} ${p.status === "draft" ? styles.blockedProductImage : ""}`}
                            onError={(e) => {
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className={styles.productInfo}>
                          <p className={`${styles.productName} ${p.status === "draft" ? styles.blockedProductName : ""}`}>{p.name}</p>
                          <p className={styles.productPurity}>{p.purity}</p>
                          <div className={styles.statusBadgeContainer}>
                            <Badge 
                              variant={p.status === "active" ? "default" : p.status === "blocked" ? "destructive" : "secondary"}
                              className={`${styles.statusBadge} ${p.status === "blocked" ? styles.blockedBadge : ""}`}
                            >
                              {p.status === "active" ? "Active" : p.status === "blocked" ? "Blocked" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} text-muted-foreground ${styles.hiddenMd}`}>{p.vendor?.username || 'Unknown'}</td>
                    <td className={`${styles.tableCell} text-foreground font-medium`}>Rs{p.price.toLocaleString()}</td>
                    <td className={`${styles.tableCell} ${styles.hiddenSm}`}>
                      <Badge variant="secondary" className={styles.categoryBadge}>{p.category}</Badge>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hiddenLg}`}>
                      <span className={styles.ratingDisplay}>
                        <Star className={styles.ratingStar} />
                        {p.averageRating > 0 ? p.averageRating.toFixed(1) : "N/A"}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hiddenLg}`}>
                      <span className={`${styles.stockDisplay} ${p.stock <= 5 ? styles.stockLow : ''}`}>
                        {p.stock} {p.stock <= 5 && <span className={styles.stockLowBadge}>Low</span>}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionCell}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleViewProduct(p)}
                          disabled={actionLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className={`${styles.actionButton} ${p.status === "blocked" ? styles.danger : ""}`}
                          onClick={() => p.status !== "draft" && handleToggleProductStatus(p)}
                          disabled={actionLoading || p.status === "draft"}
                          title={p.status === "active" ? "Block Product" : p.status === "blocked" ? "Unblock Product" : "Draft Product - Cannot Moderate"}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Product Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.productImages}>
                {selectedProduct.images?.map((image, index) => (
                  <img 
                    key={index}
                    src={`http://localhost:5000${image}`}
                    alt={`${selectedProduct.name} ${index + 1}`}
                    className={styles.modalImage}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                ))}
              </div>
              <div className={styles.productInfo}>
                <h3>{selectedProduct.name}</h3>
                <p className={styles.description}>{selectedProduct.description}</p>
                
                <div className={styles.productDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Vendor:</span>
                    <span>{selectedProduct.vendor?.username || 'Unknown'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Category:</span>
                    <Badge variant="secondary">{selectedProduct.category}</Badge>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Price:</span>
                    <span className={styles.price}>Rs{selectedProduct.price.toLocaleString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Stock:</span>
                    <span className={selectedProduct.stock <= 5 ? styles.lowStock : ''}>
                      {selectedProduct.stock} {selectedProduct.stock <= 5 && '(Low)'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Purity:</span>
                    <span>{selectedProduct.purity}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Weight:</span>
                    <span>{selectedProduct.weight}g</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Status:</span>
                    <Badge variant={selectedProduct.status === "active" ? "default" : selectedProduct.status === "blocked" ? "destructive" : "secondary"}>
                      {selectedProduct.status === "active" ? "Active" : selectedProduct.status === "blocked" ? "Blocked" : "Draft"}
                    </Badge>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Created:</span>
                    <span>{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Rating:</span>
                    <span>
                      {selectedProduct.averageRating > 0 
                        ? `${selectedProduct.averageRating.toFixed(1)} (${selectedProduct.reviewCount} reviews)`
                        : "No reviews"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}
