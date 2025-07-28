import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { serverEndpoint } from './config';
import { toast } from 'react-toastify';

const ProductReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write a review with at least 10 characters');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await axios.post(
        `${serverEndpoint}/api/products/${productId}/reviews`,
        {
          rating,
          comment: comment.trim()
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setRating(0);
        setComment('');
        setHover(null);
        
        // Notify parent component to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'You have already reviewed this product');
      } else if (error.response?.status === 401) {
        toast.error('Please login to submit a review');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h5 className="mb-3">Write a Review</h5>
      
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-3">
          <label className="form-label fw-bold">Rating *</label>
          <div className="star-rating">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className="star"
                  color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  size={24}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer', marginRight: '2px' }}
                />
              );
            })}
          </div>
          <small className="text-muted">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
          </small>
        </div>

        {/* Review Comment */}
        <div className="mb-3">
          <label htmlFor="reviewComment" className="form-label fw-bold">
            Your Review *
          </label>
          <textarea
            id="reviewComment"
            className="form-control"
            rows="4"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength="10"
            maxLength="500"
          />
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">
              Minimum 10 characters
            </small>
            <small className="text-muted">
              {comment.length}/500
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || rating === 0 || comment.trim().length < 10}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProductReviewForm; 