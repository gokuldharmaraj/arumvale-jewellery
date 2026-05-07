import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity }],
        };
      }
    }

    case CART_ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isLoggedIn, loading } = useAuth();

  // Load cart from localStorage on mount and when login status changes
  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) return;
    
    if (isLoggedIn) {
      const savedCart = localStorage.getItem(`cart_${isLoggedIn.user?._id}`);
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    } else {
      // Clear cart when logged out
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isLoggedIn, loading]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn && state.items.length > 0) {
      localStorage.setItem(`cart_${isLoggedIn.user?._id}`, JSON.stringify(state.items));
    } else if (state.items.length === 0) {
      localStorage.removeItem(`cart_${isLoggedIn.user?._id}`);
    }
  }, [state.items, isLoggedIn]);

  const addToCart = (product, quantity = 1) => {
    if (!isLoggedIn) {
      throw new Error('Please login to add items to cart');
    }
    
    // Check if product has sufficient stock
    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { ...product, quantity },
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: productId,
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { _id: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
