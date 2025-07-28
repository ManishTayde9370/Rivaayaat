import React, { useState } from 'react';
import { FaStar, FaUser, FaCalendarAlt, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ProductReviews = ({ reviews = [], averageRating = 0, numReviews = 0 }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return '';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 5: return '#28a745';
      case 4: return '#17a2b8';
      case 3: return '#ffc107';
      case 2: return '#fd7e14';
      case 1: return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="reviews-section">
        <h5 className="mb-3">Customer Reviews</h5>
        <div className="text-center py-4">
          <p className="text-muted">No reviews yet</p>
          <small className="text-muted">Be the first to review this product!</small>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h5 className="mb-4">Customer Reviews</h5>
      
      {/* Rating Summary */}
      <div className="rating-summary mb-4">
        <div className="row align-items-center">
          <div className="col-md-3 text-center">
            <div className="overall-rating">
              <div className="rating-number">{averageRating.toFixed(1)}</div>
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    color={index < Math.round(averageRating) ? "#ffc107" : "#e4e5e9"}
                    size={20}
                  />
                ))}
              </div>
              <div className="rating-text">{getRatingText(Math.round(averageRating))}</div>
              <div className="rating-count">{numReviews} reviews</div>
            </div>
          </div>
          
          <div className="col-md-9">
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingDistribution[rating];
                const percentage = numReviews > 0 ? (count / numReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="rating-bar-row">
                    <div className="rating-label">
                      {rating} <FaStar color="#ffc107" size={12} />
                    </div>
                    <div className="rating-bar-container">
                      <div 
                        className="rating-bar-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getRatingColor(rating)
                        }}
                      ></div>
                    </div>
                    <div className="rating-count-small">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <label className="me-2 fw-bold">Sort by:</label>
          <select
            className="form-select form-select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
        
        {reviews.length > 3 && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? 'Show Less' : `Show All (${reviews.length})`}
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {displayedReviews.map((review, index) => (
          <div key={review._id || index} className="review-item">
            <div className="review-header">
              <div className="review-user">
                <FaUser className="me-2" />
                <span className="fw-bold">{review.username}</span>
              </div>
              <div className="review-rating">
                <div className="stars">
                  {[...Array(5)].map((_, starIndex) => (
                    <FaStar
                      key={starIndex}
                      color={starIndex < review.rating ? "#ffc107" : "#e4e5e9"}
                      size={16}
                    />
                  ))}
                </div>
                <span className="rating-text-small ms-2">
                  {getRatingText(review.rating)}
                </span>
              </div>
            </div>
            
            <div className="review-content">
              <p className="review-comment">{review.comment}</p>
            </div>
            
            <div className="review-footer">
              <div className="review-date">
                <FaCalendarAlt className="me-1" />
                <small className="text-muted">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </small>
              </div>
              
              <div className="review-actions">
                <button className="btn btn-sm btn-outline-secondary me-1">
                  <FaThumbsUp size={12} />
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <FaThumbsDown size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {!showAllReviews && reviews.length > 3 && (
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowAllReviews(true)}
          >
            Show All {reviews.length} Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 