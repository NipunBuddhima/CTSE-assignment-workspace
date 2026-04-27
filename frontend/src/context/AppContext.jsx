import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const safeParseJSON = (value) => {
  if (value === null || value === undefined || value === 'undefined' || value === 'null') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedCart = localStorage.getItem('cart');

    const parsedUser = safeParseJSON(storedUser);
    if (parsedUser && storedToken) {
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else if (storedUser || storedToken) {
      // Clean only broken auth data while keeping cart intact.
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    const parsedCart = safeParseJSON(storedCart);
    if (Array.isArray(parsedCart)) {
      setCart(parsedCart);
    } else if (storedCart && storedCart !== '[]') {
      localStorage.removeItem('cart');
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const login = (user, token) => {
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    showNotification('Welcome back! Logged in successfully.', 'success');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showNotification('Logged out successfully. Your cart has been kept.', 'success');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.productId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    showNotification(`"${product.name}" added to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    showNotification('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotification({ message, type, id });
    setTimeout(() => setNotification(null), 3500);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price?.currentPrice || item.currentPrice || 0) * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        isAuthenticated,
        loading,
        notification,
        darkMode,
        toggleDarkMode,
        login,
        logout,
        updateUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        showNotification,
        setLoading,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
