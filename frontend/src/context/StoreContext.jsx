
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // Backend URL
  const url = "http://localhost:4000";

  // Add food to cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Failed to add item to cart:", error);
      }
    }
  };

  // Remove food from cart
  const removeFromCart = async (itemId) => {
    if (!cartItems[itemId] || cartItems[itemId] <= 0) return;

    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] - 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
      }
    }
  };

  // Calculate cart total
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find(
          (product) => product._id === item
        );

        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }

    return totalAmount;
  };

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);

      console.log("Food API response:", response.data);

      // Your API currently returns { success: true, date: [...] }
      const foods = response.data.date;

      setFoodList(Array.isArray(foods) ? foods : []);
    } catch (error) {
      console.error("Failed to fetch food list:", error);
      setFoodList([]);
    }
  };

  // Load cart from backend
  const loadCartData = async (userToken) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: userToken } }
      );

      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      }
    };

    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,

    // Expose search state to other components
    searchQuery,
    setSearchQuery,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
