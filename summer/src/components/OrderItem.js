const OrderItem = ({ order }) => (
  <div className="border rounded p-2 mb-2">
    <strong>Order #{order._id}</strong> - {order.items.length} item(s) - {new Date(order.createdAt).toLocaleDateString()}
    <div className="d-flex flex-wrap gap-3 mt-2">
      {order.items.map(item => (
        <div key={item.productId} className="d-flex align-items-center gap-2" style={{ minWidth: 120 }}>
          {item.image && (
            <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
          )}
          <span style={{ fontWeight: 500 }}>{item.name}</span>
        </div>
      ))}
    </div>
  </div>
);
export default OrderItem;
