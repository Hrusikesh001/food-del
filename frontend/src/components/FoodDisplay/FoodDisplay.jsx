
import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import Fooditem from "../Fooditem/Fooditem";

const FoodDisplay = ({ category }) => {
  const { food_list, searchQuery } = useContext(StoreContext);

  const foods = Array.isArray(food_list) ? food_list : [];
  const query = searchQuery.trim().toLowerCase();

  const filteredFoodList = foods.filter((item) => {
    const matchesCategory =
      category === "All" || item.category === category;

    const searchableText = [
      item.name,
      item.description,
      item.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="food-display" id="food-display">
      <h2>
        {query ? `Search results for "${searchQuery}"` : "Top dishes near you"}
      </h2>

      <div className="food-display-list">
        {filteredFoodList.map((item) => (
          <Fooditem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>

      {filteredFoodList.length === 0 && (
        <p className="no-food-found">
          No dishes found. Try another search or category.
        </p>
      )}
    </div>
  );
};

export default FoodDisplay;
