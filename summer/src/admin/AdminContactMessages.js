import React, { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Button, Form, InputGroup, Card, Badge } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaSearch, 
  FaTrash, 
  FaReply, 
  FaEye, 
  FaCalendarAlt,
  FaUser,
  FaAt,
  FaComments,
  FaFilter
} from 'react-icons/fa';
import LoadingBar from '../components/LoadingBar';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, unread, read

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
      // Ensure data is always an array
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setMessages([]); // Set empty array on error
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

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`/api/contact/messages/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg._id === id ? { ...msg, read: true } : msg
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Ensure messages is always an array before filtering
  const filteredMessages = Array.isArray(messages) ? messages.filter((msg) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (msg.name || '').toLowerCase().includes(q) ||
      (msg.email || '').toLowerCase().includes(q) ||
      (msg.message || '').toLowerCase().includes(q);
    
    // Apply status filter
    if (filterStatus === 'unread') {
      return matchesSearch && !msg.read;
    } else if (filterStatus === 'read') {
      return matchesSearch && msg.read;
    }
    return matchesSearch;
  }) : [];

  const unreadCount = Array.isArray(messages) ? messages.filter(msg => !msg.read).length : 0;
  const totalCount = Array.isArray(messages) ? messages.length : 0;

  if (loading) {
    return (
      <div className="admin-contact-messages">
        <LoadingBar />
      </div>
    );
  }

  return (
    <div className="admin-contact-messages">
      {/* Header Section */}
      <div className="messages-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="messages-title">
              <FaEnvelope className="title-icon" />
              Contact Messages
            </h1>
            <p className="messages-subtitle">
              Manage customer inquiries and support requests
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaEnvelope />
              </div>
              <div className="stat-content">
                <div className="stat-number">{totalCount}</div>
                <div className="stat-label">Total Messages</div>
              </div>
            </div>
            <div className="stat-card unread">
              <div className="stat-icon">
                <FaComments />
              </div>
              <div className="stat-content">
                <div className="stat-number">{unreadCount}</div>
                <div className="stat-label">Unread</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-container">
        {error && (
          <div className="error-alert">
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          </div>
        )}
        
        {success && (
          <div className="success-alert">
            <Alert variant="success">
              <strong>Success:</strong> {success}
            </Alert>
          </div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaEnvelope />
            </div>
            <h3>No messages found</h3>
            <p>
              {search || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No contact messages have been received yet.'
              }
            </p>
          </div>
        ) : (
          <div className="messages-grid">
            {filteredMessages.map((msg, idx) => (
              <Card key={msg._id} className={`message-card ${!msg.read ? 'unread' : ''}`}>
                <Card.Body>
                  <div className="message-header">
                    <div className="message-info">
                      <div className="sender-info">
                        <FaUser className="info-icon" />
                        <span className="sender-name">{msg.name}</span>
                        {!msg.read && <Badge bg="danger" className="unread-badge">New</Badge>}
                      </div>
                      <div className="sender-email">
                        <FaAt className="info-icon" />
                        <span>{msg.email}</span>
                      </div>
                      <div className="message-date">
                        <FaCalendarAlt className="info-icon" />
                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="message-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewMessage(msg)}
                        title="View Message"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        as="a"
                        href={`mailto:${msg.email}?subject=Re:%20Your%20Contact%20Message`}
                        target="_blank"
                        title="Reply via Email"
                      >
                        <FaReply />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(msg._id)}
                        title="Delete Message"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="message-content">
                    <div className="message-preview">
                      {msg.message.length > 150 
                        ? `${msg.message.substring(0, 150)}...`
                        : msg.message
                      }
                    </div>
                  </div>
                  
                  {!msg.read && (
                    <div className="message-footer">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleMarkAsRead(msg._id)}
                      >
                        Mark as Read
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="message-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="message-detail-item">
                <label>From:</label>
                <span>{selectedMessage.name} ({selectedMessage.email})</span>
              </div>
              <div className="message-detail-item">
                <label>Date:</label>
                <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
              </div>
              <div className="message-detail-item">
                <label>Message:</label>
                <div className="message-text">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="outline-success"
                as="a"
                href={`mailto:${selectedMessage.email}?subject=Re:%20Your%20Contact%20Message`}
                target="_blank"
              >
                <FaReply className="me-2" />
                Reply via Email
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => {
                  handleDelete(selectedMessage._id);
                  setShowModal(false);
                }}
              >
                <FaTrash className="me-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages; 