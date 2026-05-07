import { Link } from "react-router-dom";
import { X, Award, GitCompareArrows, Star, Trophy } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/getImageUrl";
import LoginPrompt from "@/components/LoginPrompt";
import styles from "./ComparePage.module.css";
// Helper: Convert purity string to tiered numeric (0.5-5 range)
const getPurityValue = (purity) => {
  const purityMap = {
    "Platinum": 5.0,
    "24K": 4.0,
    "22K": 3.5,
    "18K": 3.0,
    "14K": 2.5,
    "925 Silver": 1.0
  };
  return purityMap[purity] || 0;
};

// Helper: Normalize higher-is-better to 0-1
const normalizeHigher = (value, min, max) => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

// Helper: Normalize lower-is-better to 0-1
const normalizeLower = (value, min, max) => {
  if (max === min) return 0.5;
  return (max - value) / (max - min);
};

// Calculate Value Score for a single product
const calculateValueScore = (product, comparisonSet) => {
  // Derived metrics
  const purityValue = getPurityValue(product.purity);
  const pricePerGram = product.price / product.weight;
  const reviewConfidence = Math.min(product.reviewCount / 20, 1);
  const hasHallmark = product.hallmark && product.hallmark.trim().length > 0 ? 1 : 0;

  // Get min/max across comparison set for normalization
  const purityValues = comparisonSet.map(p => getPurityValue(p.purity));
  const pricePerGrams = comparisonSet.map(p => p.price / p.weight);
  const reviewCounts = comparisonSet.map(p => p.reviewCount);

  const purityMin = Math.min(...purityValues);
  const purityMax = Math.max(...purityValues);
  const priceMin = Math.min(...pricePerGrams);
  const priceMax = Math.max(...pricePerGrams);
  const reviewMin = Math.min(...reviewCounts);
  const reviewMax = Math.max(...reviewCounts);

  // Normalize each metric to 0-1
  const purityScore = normalizeHigher(purityValue, purityMin, purityMax);
  const valueScore = normalizeLower(pricePerGram, priceMin, priceMax); // Lower price/gram = better
  const hallmarkScore = hasHallmark; // Already 0 or 1

  // Rating: neutral (0.5) if no reviews, otherwise normalize
  let ratingScore;
  if (product.reviewCount === 0) {
    ratingScore = 0.5; // Neutral for new products
  } else {
    const ratings = comparisonSet.map(p => p.averageRating);
    const ratingMin = Math.min(...ratings);
    const ratingMax = Math.max(...ratings);
    ratingScore = normalizeHigher(product.averageRating, ratingMin, ratingMax);
  }

  // Confidence: normalize review count
  const confidenceScore = normalizeHigher(reviewConfidence, 0, 1);

  // Weighted score (revised weights)
  const finalScore =
    (purityScore * 0.25) +      // 25% purity
    (valueScore * 0.25) +       // 25% price-per-gram
    (hallmarkScore * 0.20) +    // 20% hallmark
    (ratingScore * 0.20) +      // 20% rating
    (confidenceScore * 0.10);   // 10% review confidence

  return finalScore;
};

// Calculate scores for all products and find best overall
const calculateBestOverall = (compareItems) => {
  const productsWithScores = compareItems.map(product => ({
    ...product,
    valueScore: calculateValueScore(product, compareItems)
  }));

  const bestOverall = [...productsWithScores].sort((a, b) => b.valueScore - a.valueScore)[0];
  return { bestOverall, productsWithScores };
};

export default function ComparePage() {
  const {
    compareItems,
    removeFromCompare,
    clearCompare
  } = useCompare();
  const {
    isLoggedIn
  } = useAuth();
  if (!isLoggedIn) {
    return <LoginPrompt title="Sign In to Compare" description="Log in to use our Smart Jewellery Comparison Engine — compare price, purity, weight & AI value scores side by side." icon={<GitCompareArrows className="h-10 w-10 text-primary" />} />;
  }
  if (compareItems.length < 2) {
    return <div className={styles.emptyState}>
        <h1 className={styles.emptyStateTitle}>Smart Jewellery Comparison Engine</h1>
        <p className={styles.emptyStateDescription}>Select at least 2 products from the <Link to="/products" className={styles.emptyStateLink}>products page</Link> to compare.</p>
      </div>;
  }
  const bestRating = [...compareItems].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))[0];
  const { bestOverall, productsWithScores } = calculateBestOverall(compareItems);
  const allNoRatings = compareItems.every(p => p.reviewCount === 0);
  const rows = [{
    label: "Price",
    key: "price",
    format: v => `₹${v.toLocaleString()}`,
    highlight: "min"
  }, {
    label: "Original Price",
    key: "comparePrice",
    format: v => v ? `₹${v.toLocaleString()}` : "N/A",
    highlight: "min"
  }, {
    label: "Discount",
    key: "discountPercent",
    format: (v, product) => {
      if (!product.comparePrice || product.comparePrice <= product.price) return "N/A";
      const percent = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
      return `${percent}%`;
    },
    highlight: "max",
    useProductObject: true
  }, {
    label: "Weight",
    key: "weight",
    format: v => `${v}g`
  }, {
    label: "Gold Purity",
    key: "purity"
  }, {
    label: "Rating",
    key: "averageRating",
    format: v => v ? `${v}/5` : "N/A",
    highlight: allNoRatings ? null : "max"
  }, {
    label: "Value Score",
    key: "valueScore",
    format: v => v ? `${(v * 10).toFixed(1)}/10` : "N/A",
    highlight: "max",
    useScoredProducts: true
  }, {
    label: "Vendor",
    key: "vendor",
    format: v => v?.username || "Unknown Vendor"
  }];
  const getBest = (key, type, useScoredProducts = false, useProductObject = false) => {
    if (key === "vendor") return null;
    const sourceProducts = useScoredProducts ? productsWithScores : compareItems;
    
    if (useProductObject) {
      // For derived values like discount percentage
      const vals = sourceProducts.map(p => {
        if (key === "discountPercent") {
          if (!p.comparePrice || p.comparePrice <= p.price) return 0;
          return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
        }
        return p[key];
      });
      return type === "max" ? Math.max(...vals) : Math.min(...vals);
    }
    
    const vals = sourceProducts.map(p => p[key]);
    return type === "max" ? Math.max(...vals) : Math.min(...vals);
  };
  return <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Smart Jewellery Comparison Engine</h1>
          <p className={styles.headerSubtitle}>Comparing {compareItems.length} products</p>
        </div>
        <button onClick={clearCompare} className={styles.clearButton}>Clear All</button>
      </div>

      <div className={styles.recommendationsGrid}>
        {[{
        label: "Best Rating",
        icon: Star,
        product: bestRating,
        color: "text-primary"
      }, {
        label: "Best Overall",
        icon: Trophy,
        product: bestOverall,
        color: "text-primary"
      }].map(rec => <div key={rec.label} className={styles.recommendationCard}>
            <div className={styles.recommendationIcon}>
              <rec.icon className={rec.color} />
            </div>
            <div className={styles.recommendationContent}>
              <p className={styles.recommendationLabel}>{rec.label}</p>
              <p className={styles.recommendationName}>{rec.product.name}</p>
              <p className={styles.recommendationScore}>{rec.label === "Best Overall" ? `${(rec.product.valueScore * 10).toFixed(1)}/10 Value Score` : `${rec.product.averageRating || 0}/5 Rating`}</p>
            </div>
          </div>)}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Feature</th>
              {compareItems.map(product => <th key={product._id} className={`${styles.productHeader} ${product._id === bestOverall._id ? styles.bestPick : ''}`}>
                  <div className={styles.productHeaderContent}>
                    <button onClick={() => removeFromCompare(product._id)} className={styles.removeButton}>
                      <X className="h-3 w-3" />
                    </button>
                    <img src={getImageUrl(product.images?.[0])} alt={product.name} className={styles.productImage} />
                    <p className={styles.productName}>{product.name}</p>
                    {product._id === bestOverall._id && <span className={styles.bestPickBadge}>
                        <Award className="h-3 w-3" /> Best Pick
                      </span>}
                  </div>
                </th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => <tr key={row.label}>
                <td className={styles.featureCell}>{row.label}</td>
                {(row.useScoredProducts ? productsWithScores : compareItems).map(product => {
              const val = product[row.key];
              const formatted = row.format ? (row.useProductObject ? row.format(val, product) : row.format(val)) : val;
              const isBest = row.highlight && val === getBest(row.key, row.highlight, row.useScoredProducts, row.useProductObject);
              return <td key={product._id} className={`${styles.valueCell} ${isBest ? styles.bestValue : ''} ${product._id === bestOverall._id ? styles.bestPick : ''}`}>
                      {formatted}
                      {isBest && <span className={styles.valueStar}>★</span>}
                    </td>;
            })}
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}
