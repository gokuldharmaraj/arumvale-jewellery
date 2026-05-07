import Product from "../models/Product.js";
import User from "../models/User.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name images price stock vendor status isDeleted",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out unavailable products
    const availableCartItems = user.cart.filter((item) => {
      return (
        item.product &&
        !item.product.isDeleted &&
        item.product.status === "active" &&
        item.product.stock > 0
      );
    });

    // Calculate totals
    const subtotal = availableCartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const tax = subtotal * 0.03; // 3% tax
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
    const total = subtotal + tax + shipping;

    res.status(200).json({
      items: availableCartItems,
      summary: {
        subtotal,
        tax,
        shipping,
        total,
        itemCount: availableCartItems.reduce(
          (count, item) => count + item.quantity,
          0,
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.status !== "active") {
      return res.status(400).json({ message: "Product is not available" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    // Check custom product ownership
    if (product.isCustom === true) {
      if (
        !product.customForCustomer ||
        product.customForCustomer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized to purchase this custom product",
        });
      }
    }

    const user = await User.findById(req.user._id);

    // Check if product is already in cart
    const existingCartItem = user.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (existingCartItem) {
      // Update quantity if already in cart
      const newQuantity = existingCartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
        });
      }

      existingCartItem.quantity = newQuantity;
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity,
      });
    }

    await user.save();

    // Get updated cart with populated products
    const updatedUser = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name images price stock vendor status isDeleted",
    });

    res.status(200).json({
      message: "Item added to cart successfully",
      cart: updatedUser.cart,
      itemCount: updatedUser.cart.reduce(
        (count, item) => count + item.quantity,
        0,
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Check if product exists and has sufficient stock
    const product = await Product.findById(productId);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    const user = await User.findById(req.user._id);

    // Find the cart item
    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Get updated cart with populated products
    const updatedUser = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name images price stock vendor status isDeleted",
    });

    res.status(200).json({
      message: "Cart item updated successfully",
      cart: updatedUser.cart,
      itemCount: updatedUser.cart.reduce(
        (count, item) => count + item.quantity,
        0,
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.user._id);

    // Remove item from cart
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId,
    );

    await user.save();

    // Get updated cart with populated products
    const updatedUser = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name images price stock vendor status isDeleted",
    });

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: updatedUser.cart,
      itemCount: updatedUser.cart.reduce(
        (count, item) => count + item.quantity,
        0,
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = [];
    await user.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart: [],
      itemCount: 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Move item to wishlist
export const moveToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.user._id);

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove from cart
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId,
    );

    // Add to wishlist if not already there
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
      message: "Item moved to wishlist successfully",
      cart: user.cart,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart summary (for quick cart display)
export const getCartSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name images price stock status isDeleted",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out unavailable products
    const availableCartItems = user.cart.filter((item) => {
      return (
        item.product &&
        !item.product.isDeleted &&
        item.product.status === "active" &&
        item.product.stock > 0
      );
    });

    const itemCount = availableCartItems.reduce(
      (count, item) => count + item.quantity,
      0,
    );
    const subtotal = availableCartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    res.status(200).json({
      itemCount,
      subtotal,
      estimatedTotal: subtotal + subtotal * 0.03 + (subtotal > 1000 ? 0 : 50),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
