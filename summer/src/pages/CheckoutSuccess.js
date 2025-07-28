import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import brandLogo from '../assets/brandlogo.png';

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
      <h2 className="text-success">🎉 Order Placed Successfully!</h2>
      <p className="mt-3">Thank you for shopping with Rivaayaat.</p>
      <div className="mt-4 card p-4 shadow-sm" id="invoice-section" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
        <div className="d-flex align-items-center mb-3 gap-3">
          <img src={brandLogo} alt="Brand Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <div>
            <h3 className="mb-0" style={{ color: '#5e3d19', fontFamily: 'Georgia', fontWeight: 'bold' }}>Rivaayaat</h3>
            <span style={{ color: '#888' }}>www.rivaayaat.com</span>
          </div>
        </div>
        <hr />
        <h4>Invoice</h4>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Total Paid:</strong> ₹{order.amountPaid.toFixed(2)}</p>
        <h5 className="mt-4">Shipping Address</h5>
        <p style={{ marginBottom: 0 }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
        <p style={{ marginBottom: 0 }}>{order.shippingAddress?.state} - {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
        {order.shippingAddress?.email && <p style={{ marginBottom: 0 }}><strong>Email:</strong> {order.shippingAddress.email}</p>}
        {order.shippingAddress?.mobile && <p style={{ marginBottom: 0 }}><strong>Mobile:</strong> {order.shippingAddress.mobile}</p>}
        <h5 className="mt-4">Items</h5>
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
          <strong>Grand Total: ₹{order.amountPaid.toFixed(2)}</strong>
        </div>
      </div>
      <button className="btn btn-outline-primary mt-4" onClick={handleDownloadInvoice}>
        Download Invoice
      </button>
      <button
        className="btn btn-primary mt-4 ms-3"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>
    </div>
  );
}

export default CheckoutSuccess;
