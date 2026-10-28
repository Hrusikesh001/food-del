
import React, { useCallback, useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${url}/api/order/list`,
        {
          headers: {
            token: adminToken
          }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message || 'Unable to load orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }, [url]);

  const statusHandler = async (event, orderId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');

      const response = await axios.post(
        `${url}/api/order/status`,
        {
          orderId,
          status: event.target.value
        },
        {
          headers: {
            token: adminToken
          }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to update status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return (
    <div className="order add">
      <h3>Order Page</h3>

      <div className="order-list">
        {orders.length === 0 && (
          <p>No orders found.</p>
        )}

        {orders.map((order) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="Order parcel" />

            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => (
                  <React.Fragment key={`${item.name}-${index}`}>
                    {item.name} x {item.quantity}
                    {index < order.items.length - 1 ? ', ' : ''}
                  </React.Fragment>
                ))}
              </p>

              <p className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </p>

              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state},{' '}
                  {order.address.country}, {order.address.zipcode}
                </p>
              </div>

              <p className="order-item-phone">
                {order.address.phone}
              </p>
            </div>

            <p>Items: {order.items.length}</p>
            <p>₹{order.amount}</p>

            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
