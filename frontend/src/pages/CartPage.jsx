import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ShoppingBag, ShoppingCart, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/utils/getImageUrl";
import LoginPrompt from "@/components/LoginPrompt";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { isLoggedIn } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return <LoginPrompt title="Sign In to View Cart" description="Log in to add items to your cart and start shopping from India's finest jewellers." icon={<ShoppingCart className="h-10 w-10 text-primary" />} />;
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <ShoppingCart className={styles.cartIcon} />
        <h1 className={styles.pageTitle}>Your Cart</h1>
        <p className={styles.emptyMessage}>Your cart is empty. Start browsing our collection!</p>
        <Link to="/products" className={styles.continueShoppingButton}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const cartTotal = getCartTotal();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <ShoppingCart className={styles.cartIcon} />
          <h1 className={styles.pageTitle}>Your Cart</h1>
        </div>
        {items.length > 0 && (
          <button onClick={handleClearCart} className={styles.clearCartButton}>
            Clear Cart
          </button>
        )}
      </div>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {items.map((item) => (
            <div key={item._id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <img src={getImageUrl(item.images?.[0])} alt={item.name} />
              </div>
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemMeta}>
                  {item.category} · {item.weight}g · {item.purity}
                </p>
                <p className={styles.itemPrice}>Rs{item.price.toLocaleString()}</p>
              </div>
              <div className={styles.itemControls}>
                <div className={styles.quantityControls}>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className={styles.quantityButton}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className={styles.quantityDisplay}>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className={styles.quantityButton}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className={styles.removeButton}
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className={styles.itemTotal}>
                Rs{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs{cartTotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>Rs{cartTotal.toLocaleString()}</span>
            </div>
            <button className={styles.checkoutButton} onClick={() => navigate('/checkout')}>
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/products" className={styles.continueShoppingButton}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
