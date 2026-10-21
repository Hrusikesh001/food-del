
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { assets } from "../../assets/assets";
import "./Invoice.css";

const Invoice = ({ order, onClose }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadInvoice = async () => {
    if (!order?.payment || !invoiceRef.current || downloading) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageData = canvas.toDataURL("image/png");

      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, pageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, pageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`FoodTaxi-Invoice-${order._id}.pdf`);
    } catch (error) {
      console.error("Invoice PDF generation failed:", error);
      alert("Could not generate the invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const address = order.address || {};
  const addressText =
    typeof address === "string"
      ? address
      : Object.values(address)
          .filter((value) => value !== null && value !== undefined && value !== "")
          .join(", ");

  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString("en-IN")
    : "Not available";

  return (
    <div className="invoice-overlay">
      <div className="invoice-modal">
        <div className="invoice-actions">
          <button
            type="button"
            onClick={downloadInvoice}
            disabled={!order.payment || downloading}
          >
            {downloading ? "Generating PDF..." : "Download Invoice PDF"}
          </button>

          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="invoice-paper" ref={invoiceRef}>
          <header className="invoice-header">
            <div className="invoice-brand">
              <img src={assets.logo} alt="FoodTaxi logo" />
              <p>DELICIOUS FOOD · FASTER DELIVERY</p>
            </div>
            <div className="invoice-heading">
              <h1>INVOICE</h1>
              <p>Thank you for your order!</p>
            </div>
          </header>

          <section className="invoice-order-info">
            <div>
              <p><strong>Invoice / Order ID:</strong> {order._id}</p>
              <p><strong>Order Date:</strong> {orderDate}</p>
              <p>
                <strong>Payment Status:</strong>{" "}
                {order.payment ? "Paid" : "Payment not verified"}
              </p>
              <p><strong>Order Status:</strong> {order.status}</p>
            </div>
          </section>

          <section className="invoice-address">
            <h2>Delivery Details</h2>
            <p>{addressText || "Address not available"}</p>
          </section>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {(Array.isArray(order.items) ? order.items : []).map(
                (item, index) => (
                  <tr key={item._id || item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.name || "Food item"}</td>
                    <td>₹{Number(item.price || 0).toFixed(2)}</td>
                    <td>{Number(item.quantity || 0)}</td>
                    <td>
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <section className="invoice-total">
            <p>
              <span>Order Total</span>
              <strong>₹{Number(order.amount || 0).toFixed(2)}</strong>
            </p>
            <p className="invoice-paid">
              {order.payment ? "PAYMENT PAID" : "PAYMENT NOT VERIFIED"}
            </p>
          </section>

          <footer className="invoice-footer">
            <h2>Thank you for choosing FoodTaxi!</h2>
            <p>Enjoy your food. Order again soon!</p>
            <small>Invoice generated from your FoodTaxi order.</small>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
