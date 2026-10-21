import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceFood from "../../assets/invoice-food.png";
import { assets } from "../../assets/assets";
import "./Invoice.css";

const Invoice = ({ order, onClose }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.address || {};

  const getAddressValue = (...keys) => {
    for (const key of keys) {
      if (
        address[key] !== undefined &&
        address[key] !== null &&
        String(address[key]).trim() !== ""
      ) {
        return address[key];
      }
    }
    return "";
  };

  const customerName =
    getAddressValue("name", "fullName") ||
    [getAddressValue("firstName"), getAddressValue("lastName")]
      .filter(Boolean)
      .join(" ") ||
    "Customer";

  const customerEmail = getAddressValue("email");
  const customerPhone = getAddressValue("phone", "mobile");

  const deliveryAddress =
    typeof address === "string"
      ? address
      : [
          getAddressValue("street", "address", "building"),
          getAddressValue("city", "town"),
          getAddressValue("state"),
          getAddressValue("zipcode", "zip", "postalCode"),
          getAddressValue("country"),
        ]
          .filter(Boolean)
          .join(", ");

  const orderDate = order.date
    ? new Date(order.date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const deliveryFee = 2;
  const discount = 0;

  const downloadInvoice = async () => {
    if (!order.payment || !invoiceRef.current || downloading) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const imageHeight = (canvas.height * usableWidth) / canvas.width;

      if (imageHeight <= usableHeight) {
        pdf.addImage(
          imageData,
          "PNG",
          margin,
          margin,
          usableWidth,
          imageHeight
        );
      } else {
        // Scale the complete invoice to fit on one A4 page.
        const scale = Math.min(
          usableWidth / canvas.width,
          usableHeight / canvas.height
        );
        const width = canvas.width * scale;
        const height = canvas.height * scale;

        pdf.addImage(
          imageData,
          "PNG",
          (pageWidth - width) / 2,
          margin,
          width,
          height
        );
      }

      pdf.save(`FoodTaxi-Invoice-${order._id}.pdf`);
    } catch (error) {
      console.error("Invoice PDF generation failed:", error);
      alert("Could not generate the invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

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
          {/* Header with FoodTaxi logo and food image on the right */}
          <header className="invoice-header">
            <div className="invoice-brand">
              <img
                className="invoice-logo"
                src={assets.logo}
                alt="FoodTaxi"
              />
              <p>DELICIOUS FOOD · FASTER DELIVERY</p>
            </div>

            <div className="invoice-header-food">
              <img
                src={invoiceFood}
                alt="Burger, fries and ketchup"
              />
            </div>
          </header>

          {/* Invoice title and order information */}
          <section className="invoice-intro">
            <div className="invoice-title">
              <h1>
                INV<span>OICE</span>
              </h1>
              <p>Thank you for your order!</p>
              <div className="invoice-title-underline" />
            </div>

            <div className="invoice-order-info">
              <p>
                <strong>Invoice No:</strong>
                <span>
                  FT-{String(order._id).slice(-8).toUpperCase()}
                </span>
              </p>

              <p>
                <strong>Order ID:</strong>
                <span>{order._id}</span>
              </p>

              <p>
                <strong>Order Date:</strong>
                <span>{orderDate}</span>
              </p>

              <p>
                <strong>Order Status:</strong>
                <span className="invoice-status">{order.status}</span>
              </p>

              <p>
                <strong>Payment Status:</strong>
                <span
                  className={
                    order.payment ? "invoice-paid" : "invoice-unpaid"
                  }
                >
                  {order.payment ? "✓ Paid" : "Not verified"}
                </span>
              </p>
            </div>
          </section>

          {/* Customer details */}
          <section className="invoice-customer invoice-card">
            <h2>
              <span className="invoice-section-icon">♟</span>
              Customer Details
            </h2>

            <div className="invoice-customer-body">
              <p>
                <strong>Name:</strong>
                <span>{customerName}</span>
              </p>

              {customerEmail && (
                <p>
                  <strong>Email:</strong>
                  <span>{customerEmail}</span>
                </p>
              )}

              {customerPhone && (
                <p>
                  <strong>Phone:</strong>
                  <span>{customerPhone}</span>
                </p>
              )}

              <p>
                <strong>Delivery Address:</strong>
                <span>{deliveryAddress || "Address not available"}</span>
              </p>
            </div>
          </section>

          {/* Ordered items */}
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
              {items.map((item, index) => (
                <tr key={item._id || item.id || index}>
                  <td>{index + 1}</td>
                  <td className="invoice-item-name">
                    {item.name || "Food item"}
                  </td>
                  <td>₹{Number(item.price || 0).toFixed(2)}</td>
                  <td>{Number(item.quantity || 0)}</td>
                  <td className="invoice-item-total">
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Order summary */}
          <section className="invoice-summary invoice-card">
            <h2>
              <span className="invoice-section-icon">▤</span>
              Order Summary
            </h2>

            <div className="invoice-summary-body">
              <p>
                <span>Items Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </p>

              <p>
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </p>

              <p>
                <span>Discount</span>
                <span className="invoice-discount">
                  - ₹{discount.toFixed(2)}
                </span>
              </p>

              <div className="invoice-total">
                <strong>Total Amount</strong>
                <strong>₹{Number(order.amount || 0).toFixed(2)}</strong>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="invoice-footer">
            <h2>Thank you for choosing FoodTaxi!</h2>
            <div className="invoice-heart">— ♥ —</div>
            <p>Enjoy your food. Order again soon!</p>
            <small>We look forward to serving you again.</small>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Invoice;