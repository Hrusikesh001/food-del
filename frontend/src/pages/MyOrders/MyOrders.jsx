
import React, { useContext, useEffect, useState } from 'react'
import Invoice from '../../components/Invoice/Invoice';
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {

    const {url,token} = useContext(StoreContext);
    const [data,setData] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        const response = await axios.post(
            url + "/api/order/userorders",
            {},
            { headers: { token } }
        );
        setData(response.data.data);
        console.log(response.data.data);
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>

            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className='my-orders-order'>
                            <img src={assets.parcel_icon} alt="" />

                            <p>
                                {order.items.map((item, index) => {
                                    if (index === order.items.length - 1) {
                                        return item.name + " x " + item.quantity
                                    } else {
                                        return item.name + " x " + item.quantity + ", "
                                    }
                                })}
                            </p>

                            <p>₹{Number(order.amount).toFixed(2)}</p>

                            <p>Items: {order.items.length}</p>

                            <p>
                                <span>&#x25cf;</span>
                                <b>{order.status}</b>
                            </p>
                        <div className="order-actions">
                            <button onClick={fetchOrders}>
                                Track Order
                            </button>

                            {order.payment === true && (
                                <button className="invoice-btn" onClick={() => setSelectedOrder(order)}>
                                    Download Invoice
                                </button>
                            )}
                        </div>
                        </div>
                    )
                })}
            </div>

            {selectedOrder && (
                <Invoice
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    )
}

export default MyOrders
