const OrderItem = ({ order }) => (
  <div className="border rounded p-2 mb-2">
    <strong>Order #{order._id}</strong> - {order.items.length} item(s) - {new Date(order.createdAt).toLocaleDateString()}
  </div>
);
export default OrderItem;
