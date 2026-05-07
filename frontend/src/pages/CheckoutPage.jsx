import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Truck, CreditCard, Smartphone, Building } from "lucide-react";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "",
      phone: user?.phone || "",
      address: user?.address?.fullAddress || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || ""
    },
    billingAddress: {
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "",
      phone: user?.phone || "",
      address: user?.address?.fullAddress || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || ""
    },
    paymentMethod: "cod",
    orderNotes: "",
    sameAsShipping: true
  });

  const cartTotal = getCartTotal();
  const tax = cartTotal * 0.03; // 3% tax
  const shipping = cartTotal > 1000 ? 0 : 50; // Free shipping over 1000
  const orderTotal = cartTotal + tax + shipping;

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSameAsShippingChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsShipping: checked,
      billingAddress: checked ? prev.shippingAddress : {
        fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        pincode: ""
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        orderNotes: formData.orderNotes
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        { withCredentials: true }
      );

      if (response.data) {
        console.log("Order placed successfully:", response.data);
        // Clear cart after successful order
        clearCart();
        // Navigate to success page in Phase 2
        alert("Order placed successfully! Order ID: " + response.data.order._id);
        navigate("/orders");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h1 className={styles.emptyCartTitle}>Your cart is empty</h1>
          <p className={styles.emptyCartMessage}>Add items to your cart to proceed with checkout.</p>
          <button
            onClick={() => navigate("/products")}
            className={styles.continueShoppingButton}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        onClick={() => navigate("/cart")}
        className={styles.backButton}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </button>

      <h1 className={styles.pageTitle}>Checkout</h1>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div>
          {/* Shipping Address */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <Truck className="h-5 w-5 mr-2" />
              Shipping Address
            </h2>
            <div className={styles.addressGrid}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.shippingAddress.fullName}
                onChange={(e) => handleInputChange("shippingAddress", "fullName", e.target.value)}
                className={`${styles.input} ${styles.colSpan2}`}
                required
              />
              <input
                type="text"
                placeholder="Street Address"
                value={formData.shippingAddress.address}
                onChange={(e) => handleInputChange("shippingAddress", "address", e.target.value)}
                className={`${styles.input} ${styles.colSpan2}`}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.shippingAddress.city}
                onChange={(e) => handleInputChange("shippingAddress", "city", e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={formData.shippingAddress.state}
                onChange={(e) => handleInputChange("shippingAddress", "state", e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={formData.shippingAddress.pincode}
                onChange={(e) => handleInputChange("shippingAddress", "pincode", e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.shippingAddress.phone}
                onChange={(e) => handleInputChange("shippingAddress", "phone", e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Billing Address */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Billing Address</h2>
            <div className="mb-4">
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.sameAsShipping}
                  onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                  className="mr-2"
                />
                Same as shipping address
              </label>
            </div>
            {!formData.sameAsShipping && (
              <div className={styles.addressGrid}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.billingAddress.fullName}
                  onChange={(e) => handleInputChange("billingAddress", "fullName", e.target.value)}
                  className={`${styles.input} ${styles.colSpan2}`}
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.billingAddress.address}
                  onChange={(e) => handleInputChange("billingAddress", "address", e.target.value)}
                  className={`${styles.input} ${styles.colSpan2}`}
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange("billingAddress", "city", e.target.value)}
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange("billingAddress", "state", e.target.value)}
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={formData.billingAddress.pincode}
                  onChange={(e) => handleInputChange("billingAddress", "pincode", e.target.value)}
                  className={styles.input}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.billingAddress.phone}
                  onChange={(e) => handleInputChange("billingAddress", "phone", e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <div>
              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="mr-3"
                />
                <Truck className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className={styles.paymentOptionTitle}>Cash on Delivery (COD)</div>
                  <div className={styles.paymentOptionDescription}>Pay when you receive your order</div>
                </div>
              </label>
              
              <label className={`${styles.paymentOption} ${styles.disabled}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="mr-3"
                  disabled
                />
                <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className={styles.paymentOptionTitle}>Credit/Debit Card</div>
                  <div className={styles.paymentOptionDescription}>Coming soon</div>
                </div>
              </label>
              
              <label className={`${styles.paymentOption} ${styles.disabled}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === "upi"}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="mr-3"
                  disabled
                />
                <Smartphone className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className={styles.paymentOptionTitle}>UPI</div>
                  <div className={styles.paymentOptionDescription}>Coming soon</div>
                </div>
              </label>
              
              <label className={`${styles.paymentOption} ${styles.disabled}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={formData.paymentMethod === "netbanking"}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="mr-3"
                  disabled
                />
                <Building className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className={styles.paymentOptionTitle}>Net Banking</div>
                  <div className={styles.paymentOptionDescription}>Coming soon</div>
                </div>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Order Notes (Optional)</h2>
            <textarea
              placeholder="Any special instructions for your order..."
              value={formData.orderNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, orderNotes: e.target.value }))}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className={styles.orderSummary}>
            <h2 className={styles.orderSummaryTitle}>Order Summary</h2>
            
            <div className={styles.orderItems}>
              {items.map((item) => (
                <div key={item._id} className={styles.orderItem}>
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>Rs{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.orderSummaryBorder}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>Rs{cartTotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (3%)</span>
                <span>Rs{tax.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `Rs${shipping}`}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
                <span>Total</span>
                <span>Rs{orderTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.placeOrderButton}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            <p className={styles.termsText}>
              By placing this order, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
