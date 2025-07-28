import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaUsers, FaChartLine, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { serverEndpoint } from '../components/config';
import LoadingBar from '../components/LoadingBar';

const ReviewAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewAnalytics();
  }, []);

  const fetchReviewAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverEndpoint}/api/products/stats/reviews`);
      
      if (response.data.success) {
        setAnalytics(response.data);
        setError(null);
      } else {
        setError('Failed to fetch review analytics');
      }
    } catch (err) {
      console.error('Error fetching review analytics:', err);
      setError('Failed to fetch review analytics');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#28a745';
    if (rating >= 4.0) return '#17a2b8';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 3.0) return '#fd7e14';
    return '#dc3545';
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return <LoadingBar />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No review data available</p>
      </div>
    );
  }

  const { stats, topRated, recentReviews } = analytics;

  return (
    <div className="review-analytics">
      <h3 className="mb-4">📊 Review Analytics</h3>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <FaUsers className="text-primary mb-2" size={24} />
              <h4 className="card-title">{stats.totalReviews}</h4>
              <p className="card-text text-muted">Total Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <FaStar className="text-warning mb-2" size={24} />
              <h4 className="card-title">{stats.avgRating?.toFixed(1) || '0.0'}</h4>
              <p className="card-text text-muted">Average Rating</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <FaChartLine className="text-success mb-2" size={24} />
              <h4 className="card-title">{stats.totalProducts}</h4>
              <p className="card-text text-muted">Products with Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <FaThumbsUp className="text-info mb-2" size={24} />
              <h4 className="card-title">
                {stats.totalProducts > 0 ? Math.round((stats.totalProducts / stats.totalProducts) * 100) : 0}%
              </h4>
              <p className="card-text text-muted">Review Coverage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Rated Products */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">🏆 Top Rated Products</h5>
            </div>
            <div className="card-body">
              {topRated && topRated.length > 0 ? (
                <div className="top-rated-list">
                  {topRated.map((product, index) => (
                    <div key={product._id} className="top-rated-item d-flex align-items-center mb-3">
                      <div className="rank-badge me-3">
                        #{index + 1}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{product.name}</h6>
                        <div className="d-flex align-items-center">
                          <div className="stars me-2">
                            {[...Array(5)].map((_, starIndex) => (
                              <FaStar
                                key={starIndex}
                                color={starIndex < Math.round(product.averageRating) ? "#ffc107" : "#e4e5e9"}
                                size={14}
                              />
                            ))}
                          </div>
                          <span 
                            className="rating-text"
                            style={{ color: getRatingColor(product.averageRating) }}
                          >
                            {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
                          </span>
                        </div>
                        <small className="text-muted">{product.category}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No rated products yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">🕒 Recent Reviews</h5>
            </div>
            <div className="card-body">
              {recentReviews && recentReviews.length > 0 ? (
                <div className="recent-reviews-list">
                  {recentReviews.map((item, index) => (
                    <div key={index} className="recent-review-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-1">{item.productName}</h6>
                        <div className="stars">
                          {[...Array(5)].map((_, starIndex) => (
                            <FaStar
                              key={starIndex}
                              color={starIndex < item.review.rating ? "#ffc107" : "#e4e5e9"}
                              size={12}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-text mb-2">
                        "{item.review.comment.length > 100 
                          ? `${item.review.comment.substring(0, 100)}...` 
                          : item.review.comment}"
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          By {item.review.username}
                        </small>
                        <small className="text-muted">
                          {new Date(item.review.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No recent reviews</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📈 Rating Distribution</h5>
            </div>
            <div className="card-body">
              <div className="rating-distribution-chart">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = topRated?.filter(p => Math.round(p.averageRating) === rating).length || 0;
                  const percentage = stats.totalProducts > 0 ? (count / stats.totalProducts) * 100 : 0;
                  
                  return (
                    <div key={rating} className="rating-bar-row mb-2">
                      <div className="rating-label d-flex align-items-center">
                        <span className="me-2">{rating}</span>
                        <FaStar color="#ffc107" size={12} />
                      </div>
                      <div className="rating-bar-container flex-grow-1 mx-3">
                        <div 
                          className="rating-bar-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getRatingColor(rating)
                          }}
                        ></div>
                      </div>
                      <div className="rating-count">
                        {count} products
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics; 