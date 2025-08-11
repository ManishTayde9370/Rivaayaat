import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import brandLogo from '../assets/brandlogo.png';
import { FaCheckCircle, FaDownload, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import '../css/theme.css';
import '../css/CheckoutFlow.css';

function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/'); // Redirect if user landed here without order
    }
  }, [order, navigate]);

  if (!order) return null;

  const handleDownloadInvoice = async () => {
    const invoice = document.getElementById('invoice-section');
    if (!invoice) return;
    const canvas = await html2canvas(invoice, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${order._id}.pdf`);
  };

  return (
    <div className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1 className="cinzel" style={{ color: 'var(--color-earth)' }}>
            Order Confirmation
          </h1>
          <p style={{ color: 'var(--color-earth)' }}>
            Your order has been successfully placed
          </p>
        </div>

        <div className="checkout-form-container text-center">
          <div className="checkout-success mb-4">
            <FaCheckCircle />
            Order Placed Successfully!
          </div>
          
          <h2 className="cinzel mb-4" style={{ color: 'var(--color-earth)' }}>
            Thank you for your purchase! 🎉
          </h2>
          
          <p className="mb-4" style={{ color: 'var(--color-earth)' }}>
            Thank you for shopping with Rivaayaat. Your order has been confirmed and will be shipped to your address soon.
            You will receive an email confirmation with tracking details.
          </p>

          <div className="checkout-summary" id="invoice-section">
        <div className="d-flex align-items-center mb-3 gap-3">
          <img src={brandLogo} alt="Brand Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <div>
            <h3 className="cinzel mb-0" style={{ color: 'var(--color-maroon)', fontWeight: 'bold' }}>Rivaayaat</h3>
            <span style={{ color: 'var(--color-peacock)' }}>www.rivaayaat.com</span>
          </div>
        </div>
        <hr />
        <h4 className="cinzel" style={{ color: 'var(--color-gold)' }}>Invoice</h4>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Total Paid:</strong> <span className="cinzel" style={{ color: 'var(--color-gold)' }}>₹{order.amountPaid.toFixed(2)}</span></p>
        <h5 className="mt-4 cinzel" style={{ color: 'var(--color-peacock)' }}>Shipping Address</h5>
        <p style={{ marginBottom: 0 }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
        <p style={{ marginBottom: 0 }}>{order.shippingAddress?.state} - {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
        {order.shippingAddress?.email && <p style={{ marginBottom: 0 }}><strong>Email:</strong> {order.shippingAddress.email}</p>}
        {order.shippingAddress?.mobile && <p style={{ marginBottom: 0 }}><strong>Mobile:</strong> {order.shippingAddress.mobile}</p>}
        <h5 className="mt-4 cinzel" style={{ color: 'var(--color-maroon)' }}>Items</h5>
        <table className="table table-bordered" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
            <div className="text-end mt-3">
              <strong className="cinzel" style={{ color: 'var(--color-terracotta)' }}>Grand Total: ₹{order.amountPaid.toFixed(2)}</strong>
            </div>
          </div>
          
          <div className="d-flex gap-3 justify-content-center mt-4">
            <button className="checkout-btn checkout-btn-secondary" onClick={handleDownloadInvoice}>
              <FaDownload />
              Download Invoice
            </button>
            <button
              className="checkout-btn"
              onClick={() => navigate('/')}
            >
              <FaHome />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
