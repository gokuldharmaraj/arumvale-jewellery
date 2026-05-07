import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Heart, GitCompareArrows, Star, ChevronRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/utils/getImageUrl";
import axios from "axios";
import styles from "./ProductDetailPage.module.css";
export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });
  const [userOrders, setUserOrders] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const {
    addToCompare,
    removeFromCompare,
    isInCompare
  } = useCompare();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/${id}`, {
          withCredentials: true
        });
        setProduct(response.data);
        // Set active image to first image when product loads
        setActiveImage(response.data.images?.[0] || null);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reviews/product/${id}`, {
          withCredentials: true
        });
        setReviews(response.data.reviews || []);
        setReviewStats(response.data.ratingStats || { averageRating: 0, totalReviews: 0 });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const fetchUserOrders = async () => {
      if (user) {
        try {
          const response = await axios.get("http://localhost:5000/api/orders/my", {
            withCredentials: true
          });
          setUserOrders(response.data.orders || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
      fetchUserOrders();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <div className={styles.notFound}>{error || "Product not found."}</div>;
  }
  const inCompare = isInCompare(product._id);
  const imageUrl = getImageUrl(activeImage);

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }

    // Find delivered order containing this product
    const deliveredOrder = userOrders.find(order => 
      order.status === 'delivered' && 
      order.items.some(item => item.product._id === id)
    );

    if (!deliveredOrder) {
      toast({
        title: "Cannot Review",
        description: "You can only review products from delivered orders",
        variant: "destructive"
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          productId: id,
          orderId: deliveredOrder._id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content
        },
        { withCredentials: true }
      );

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted for approval"
      });

      // Reset form
      setReviewForm({ rating: 5, title: '', content: '' });
      
      // Refresh reviews
      const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/product/${id}`, {
        withCredentials: true
      });
      setReviews(reviewsResponse.data.reviews || []);
      setReviewStats(reviewsResponse.data.ratingStats || { averageRating: 0, totalReviews: 0 });

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmittingReview(false);
    }
  };
  return <div className={styles.container}>
      <Link to="/products" className={styles.backLink}>
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className={styles.productGrid}>
        <div className={styles.productImageSection}>
          <div className={styles.productImageContainer}>
            <img src={imageUrl} alt={product.name} className={styles.productImage} />
          </div>
          
          {/* Thumbnail Gallery - Only show if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div className={styles.thumbnailGallery}>
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(image)}
                  className={`${styles.thumbnail} ${activeImage === image ? styles.activeThumbnail : ''}`}
                  title={`View image ${index + 1}`}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`${product.name} - Image ${index + 1}`}
                    className={styles.thumbnailImage}
                  />
                  {index === 0 && (
                    <span className={styles.coverBadge}>Cover</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.productDetails}>
          <p className={styles.productMeta}>{product.vendor?.username || 'Unknown Vendor'} · {product.category}</p>
          <h1 className={styles.productTitle}>{product.name}</h1>
          <div className={styles.ratingSection}>
            <Star className={styles.ratingStar} />
            <span className={styles.ratingValue}>{reviewStats.averageRating?.toFixed(1) || 0}/5</span>
            <span className={styles.valueScore}>· {reviewStats.totalReviews || 0} reviews</span>
          </div>
          {product.comparePrice && product.comparePrice > product.price ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-xl text-muted-foreground line-through">
                  Rs{product.comparePrice.toLocaleString()}
                </span>
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-sm font-medium rounded-full">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </span>
              </div>
              <p className={styles.price}>Rs{product.price.toLocaleString()}</p>
              <p className="text-sm text-green-600 font-medium">
                You save: Rs{(product.comparePrice - product.price).toLocaleString()}
              </p>
            </>
          ) : (
            <p className={styles.price}>Rs{product.price.toLocaleString()}</p>
          )}
          <div className={styles.productSpecs}>
            <span className={styles.specItem}>Weight: {product.weight}g</span>
            <span className={styles.specItem}>Purity: {product.purity}</span>
            <span className={styles.specItem}>Stock: {product.stock} left</span>
          </div>
          <p className={styles.description}>{product.description}</p>
          
          {/* Quantity Selector */}
          <div className={styles.quantitySection}>
            <label className={styles.quantityLabel}>Quantity:</label>
            <div className={styles.quantityControls}>
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className={styles.quantityButton}
              >
                -
              </button>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
                max={product.stock}
                className={styles.quantityInput}
              />
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className={styles.quantityButton}
              >
                +
              </button>
            </div>
            <span className={styles.stockInfo}>
              {product.stock} available
            </span>
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={styles.addToCartButton}
            >
              <ShoppingCart className="h-4 w-4" /> 
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button onClick={() => inCompare ? removeFromCompare(product._id) : addToCompare(product)} className={`${styles.compareButton} ${inCompare ? styles.active : ''}`}>
              <GitCompareArrows className="h-4 w-4" />
              {inCompare ? "In Compare" : "Compare"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {/* Review Form */}
        {user && (
          <div className="bg-card border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star 
                        className={`h-6 w-6 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief summary of your review"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Review</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Share your experience with this product"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.customer?.firstName} {review.customer?.lastName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <Check className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold mb-1">{review.title}</h4>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>;
}
