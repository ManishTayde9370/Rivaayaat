import React, { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Button, Form, InputGroup } from 'react-bootstrap';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/contact/messages', {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch messages.');
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/contact/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete message.');
      }
      setSuccess('Message deleted successfully.');
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const q = search.toLowerCase();
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">Contact Messages</h2>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search by name, email, or message..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </InputGroup>
      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}
      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No messages found.</td></tr>
            ) : (
              filteredMessages.map((msg, idx) => (
                <tr key={msg._id}>
                  <td>{idx + 1}</td>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.message}</td>
                  <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDelete(msg._id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as="a"
                      href={`mailto:${msg.email}?subject=Re:%20Your%20Contact%20Message`}
                      target="_blank"
                    >
                      Reply
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminContactMessages; 