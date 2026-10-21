import orderModel from "../models/orderModel.js";
import { sendEmail } from "../services/emailService.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// placing user order for frontend
const placeOrder = async (req, res) => {

    const frontend_url = "http://localhost:5173"

    try {
        const newOrder = new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency: "inr",
                product_data:{
                    name:item.name
                },
                unit_amount: item.price*100*80
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency: "inr",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount: 2*100*80
            },
            quantity:1
        })


const session = await stripe.checkout.sessions.create({
  line_items,
  mode: "payment",
  client_reference_id: String(newOrder._id),
  metadata: {
    orderId: String(newOrder._id),
  },
  success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
  cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
});

// Save the Stripe session ID for later verification
newOrder.stripeSessionId = session.id;
await newOrder.save();

res.json({
  success: true,
  session_url: session.url,
});


    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


const verifyPayment = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.stripeSessionId) {
      return res.status(400).json({
        success: false,
        message: "Stripe session not found",
      });
    }

    // Verify payment directly with Stripe
    const session = await stripe.checkout.sessions.retrieve(
      order.stripeSessionId
    );

    // Ensure this Stripe session belongs to this order
    if (session.metadata?.orderId !== String(order._id)) {
      return res.status(400).json({
        success: false,
        message: "Payment session does not match this order",
      });
    }

    if (session.payment_status !== "paid") {
      return res.json({
        success: false,
        message: "Payment is not completed",
      });
    }

    // Avoid sending another email if the order is already marked paid
    const wasAlreadyPaid = order.payment === true;

    if (!wasAlreadyPaid) {
      order.payment = true;
      await order.save();

      const user = await userModel.findById(order.userId);

      if (user) {
        void sendEmail({
          to: user.email,
          subject: `FoodTaxi Order Confirmed - ${order._id}`,
          text: `Hi ${user.name},

Great news! Your payment has been successfully received.

Order ID: ${order._id}
Order Amount: ₹${order.amount}

Your FoodTaxi order is now confirmed. Thank you for ordering with us!

Team FoodTaxi`,
        });
      }
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not verify payment",
    });
  }
};


// user orders for frontend
const userOrders = async (req,res)=> {
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }

}


// Listing orders for admin panel
const listOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// api for updating order status

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Find the order
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether the status actually changed
    const oldStatus = order.status;

    if (oldStatus === status) {
      return res.json({
        success: true,
        message: "Order status is already up to date",
      });
    }

    // Update and save the order status
    order.status = status;
    await order.save();

    // Find the customer who placed the order
    const user = await userModel.findById(order.userId);

    // Send an email notification to the customer
    if (user && user.email) {
      const emailText = `Hi ${user.name},

Your FoodTaxi order status has been updated!

Order ID: ${order._id}
Previous Status: ${oldStatus}
Current Status: ${status}

Thank you for ordering with FoodTaxi!

Team FoodTaxi`;

      // Don't make the API response depend on email delivery
      void sendEmail({
        to: user.email,
        subject: `FoodTaxi Order Update: ${status}`,
        text: emailText,
      });
    }

    return res.json({
      success: true,
      message: "Status Updated",
    });
  } catch (error) {
    console.error("Update status error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating order status",
    });
  }
};


export { placeOrder, verifyPayment as verifyOrder, userOrders,listOrders,updateStatus };
