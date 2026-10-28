
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Invoice from '../../components/Invoice/Invoice';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        if (!token) return;

        try {
            setLoading(true);

            const response = await axios.post(
                `${url}/api/order/userorders`,
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token, url]);

    return (
        <div className="my-orders">
            <h2>My Orders</h2>

            {!token && <p>Please log in to view your orders.</p>}

            {loading && <p>Loading orders...</p>}

            <div className="container">
                {data.map((order) => (
                    <div key={order._id} className="my-orders-order">
                        <img src={assets.parcel_icon} alt="Order parcel" />

                        <p>
                            {order.items.map((item, index) => (
                                <React.Fragment
                                    key={`${order._id}-${item.name}-${index}`}
                                >
                                    {item.name} x {item.quantity}
                                    {index < order.items.length - 1
                                        ? ', '
                                        : ''}
                                </React.Fragment>
                            ))}
                        </p>

                        <p>₹{Number(order.amount).toFixed(2)}</p>

                        <p>Items: {order.items.length}</p>

                        <p>
                            <span>&#x25cf;</span>
                            <b>{order.status}</b>
                        </p>

                        <div className="order-actions">
                            <button
                                onClick={() =>
                                    navigate(`/track-order/${order._id}`)
                                }
                            >
                                Track Order
                            </button>

                            {order.payment === true && (
                                <button
                                    className="invoice-btn"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    Download Invoice
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {data.length === 0 && !loading && token && (
                <p>You haven't placed any orders yet.</p>
            )}

            {selectedOrder && (
                <Invoice
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default MyOrders;
