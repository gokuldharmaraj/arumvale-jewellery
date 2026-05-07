import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, GitCompareArrows, Loader2 } from "lucide-react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import { useCompare } from "@/context/CompareContext";
import styles from "./ProductsPage.module.css";

const categories = ["All", "Necklace", "Ring", "Bangle", "Earrings", "Pendant", "Anklet", "Chain", "Bracelet", "24K", "22K", "18K", "14K", "925 Silver", "Platinum"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const {
    compareItems
  } = useCompare();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (search) params.append('search', search);
      if (activeCategory !== "All") params.append('category', activeCategory);

      const response = await axios.get(
        `http://localhost:5000/api/products?${params}`,
        {
          withCredentials: true
        }
      );

      setProducts(response.data.products || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, activeCategory, pagination.page]);

  const filtered = products.filter(p => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory || p.purity === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>All Jewellery</h1>

      {/* Search & Filters */}
      <div className={styles.searchFilters}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search jewellery..." 
            className={styles.searchInput} 
          />
        </div>
        <div className={styles.categoryFilters}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`${styles.categoryButton} ${activeCategory === cat ? styles.active : styles.inactive}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.productsGrid}>
        {filtered.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <p className={styles.noProducts}>No products found.</p>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {/* Floating compare button */}
      {compareItems.length >= 2 && (
        <Link to="/compare" className={styles.floatingCompareButton}>
          <GitCompareArrows className="h-5 w-5" />
          Compare Selected ({compareItems.length})
        </Link>
      )}
    </div>
  );
}
