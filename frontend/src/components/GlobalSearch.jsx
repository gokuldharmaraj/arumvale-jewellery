import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, ShoppingBag, FileText, ChevronRight } from "lucide-react";
import useVendorData from "@/hooks/useVendorData";
import styles from "./GlobalSearch.module.css";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({
    products: [],
    orders: [],
    requests: []
  });
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Use real vendor data
  const { products, orders, requests, loading } = useVendorData();

  // Filter data based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], requests: [] });
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filteredProducts = products
      .filter(p => 
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery) ||
        p.sku?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3);

    const filteredOrders = orders
      .filter(o => 
        o._id?.toLowerCase().includes(lowerQuery) ||
        o.customerName?.toLowerCase().includes(lowerQuery) ||
        o.productName?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3);

    const filteredRequests = requests
      .filter(r => 
        r.title?.toLowerCase().includes(lowerQuery) ||
        r.customer?.username?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3);

    setResults({
      products: filteredProducts,
      orders: filteredOrders,
      requests: filteredRequests
    });
  }, [query, products, orders, requests]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && 
          !e.target.matches('input, textarea')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery("");
    
    switch(type) {
      case 'products':
        navigate(`/vendor/products`);
        break;
      case 'orders':
        navigate(`/vendor/orders`);
        break;
      case 'requests':
        navigate(`/vendor/custom-requests`);
        break;
    }
  };

  const hasResults = results.products.length > 0 || 
                   results.orders.length > 0 || 
                   results.requests.length > 0;

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search products, orders, requests..."
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query && (
        <div className={styles.dropdown} ref={dropdownRef}>
          {hasResults ? (
            <>
              {/* Products Section */}
              {results.products.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <Package className={styles.sectionIcon} />
                    <span>Products</span>
                  </div>
                  <div className={styles.sectionContent}>
                    {results.products.map(product => (
                      <button
                        key={product._id || product.id}
                        className={styles.resultItem}
                        onClick={() => handleResultClick('products', product)}
                      >
                        <div className={styles.resultMain}>
                          <span className={styles.resultTitle}>{product.name}</span>
                          <span className={styles.resultSubtitle}>{product.category}</span>
                        </div>
                        <ChevronRight className={styles.resultArrow} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <ShoppingBag className={styles.sectionIcon} />
                    <span>Orders</span>
                  </div>
                  <div className={styles.sectionContent}>
                    {results.orders.map(order => (
                      <button
                        key={order._id || order.id}
                        className={styles.resultItem}
                        onClick={() => handleResultClick('orders', order)}
                      >
                        <div className={styles.resultMain}>
                          <span className={styles.resultTitle}>{order.orderId}</span>
                          <span className={styles.resultSubtitle}>{order.customerName}</span>
                        </div>
                        <ChevronRight className={styles.resultArrow} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Requests Section */}
              {results.requests.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <FileText className={styles.sectionIcon} />
                    <span>Custom Requests</span>
                  </div>
                  <div className={styles.sectionContent}>
                    {results.requests.map(request => (
                      <button
                        key={request._id || request.id}
                        className={styles.resultItem}
                        onClick={() => handleResultClick('requests', request)}
                      >
                        <div className={styles.resultMain}>
                          <span className={styles.resultTitle}>{request.title}</span>
                          <span className={styles.resultSubtitle}>{request.customerName}</span>
                        </div>
                        <ChevronRight className={styles.resultArrow} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noResults}>
              <Search className={styles.noResultsIcon} />
              <span>No matches found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
