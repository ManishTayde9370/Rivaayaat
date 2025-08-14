import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import brandLogo from '../assets/brandlogo.png';
import '../css/theme.css';

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
    <div className="container py-5 text-center">
      <h2 className="cinzel text-success mb-3" style={{ color: 'var(--color-emerald)' }}>
        <span role="img" aria-label="confetti">🎉</span> Order Placed Successfully!
      </h2>
      <p className="mt-3 cinzel" style={{ color: 'var(--color-maroon)' }}>Thank you for shopping with Rivaayat.</p>
      <div className="miniature-border mt-4 p-4 shadow-sm scroll-dropdown" id="invoice-section" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left', background: 'var(--color-ivory)' }}>
        <div className="d-flex align-items-center mb-3 gap-3">
          <img src={brandLogo} alt="Brand Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <div>
            <h3 className="cinzel mb-0" style={{ color: 'var(--color-maroon)', fontWeight: 'bold' }}>Rivaayat</h3>
            <span style={{ color: 'var(--color-peacock)' }}>www.Rivaayat.com</span>
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
          <strong className="cinzel" style={{ color: 'var(--color-gold)' }}>Grand Total: ₹{order.amountPaid.toFixed(2)}</strong>
        </div>
      </div>
      <button className="btn btn-outline-dark mt-4 scroll-dropdown" onClick={handleDownloadInvoice} style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: 'var(--color-gold)', border: '2px solid var(--color-gold)' }}>
        <span role="img" aria-label="download">📥</span> Download Invoice
      </button>
      <button
        className="btn btn-secondary mt-4 ms-3 scroll-dropdown"
        onClick={() => navigate('/')}
        style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: 'var(--color-gold)', border: '2px solid var(--color-gold)' }}
      >
        <span role="img" aria-label="home">🏠</span> Back to Home
      </button>
    </div>
  );
}

export default CheckoutSuccess;
