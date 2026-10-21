
import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import Fooditem from '../Fooditem/Fooditem';

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  // Ensure food_list is always treated as an array.
  const foods = Array.isArray(food_list) ? food_list : [];

  // Filter food items based on the selected category.
  const filteredFoodList =
    category === 'All'
      ? foods
      : foods.filter((item) => item.category === category);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

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

      {foods.length === 0 && (
        <p>Unable to display food items. Please check the food API.</p>
      )}
    </div>
  );
};

export default FoodDisplay;
