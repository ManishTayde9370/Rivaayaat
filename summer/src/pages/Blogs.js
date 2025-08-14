import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import LoadingBar from '../components/LoadingBar';

const Blogs = () => {
  const userDetails = useSelector(state => state.user);
  const [blogs, setBlogs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/blogs')
      .then(res => { setBlogs(res.data.blogs || []); setError(null); })
      .catch(() => { setBlogs([]); setError('Failed to load blogs. Please try again later.'); })
      .finally(() => setLoading(false));
    if (userDetails?._id) {
      axios.get(`/api/blogs/bookmarks?userId=${userDetails._id}`)
        .then(res => setBookmarks(res.data.bookmarks?.map(b => b._id) || []))
        .catch(() => setBookmarks([]));
    }
  }, [userDetails]);

  const toggleBookmark = async (blogId) => {
    if (!userDetails?._id) return;
    try {
      if (bookmarks.includes(blogId)) {
        await axios.delete('/api/blogs/bookmark', { data: { userId: userDetails._id, blogId } });
        setBookmarks(bm => bm.filter(id => id !== blogId));
      } else {
        await axios.post('/api/blogs/bookmark', { userId: userDetails._id, blogId });
        setBookmarks(bm => [...bm, blogId]);
      }
    } catch (err) {
      window.alert('Failed to update bookmark. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 Rivaayaat-heading">Blogs</h1>
      {userDetails?.name && <p className="mb-4">Welcome, {userDetails.name}! Here are the latest stories for you.</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <div className="d-flex justify-content-center my-5"><LoadingBar /></div> : (
        <div className="row">
          {blogs.map((post, i) => (
            <div className="col-md-4 mb-4" key={post._id || i}>
              <div className="p-3 border rounded bg-light h-100">
                <h5>{post.title}</h5>
                <p className="text-muted small">{post.date}</p>
                <p>{post.excerpt}</p>
                <button className={`btn btn-outline-dark btn-sm me-2${bookmarks.includes(post._id) ? ' active' : ''}`} onClick={() => toggleBookmark(post._id)}>
                  {bookmarks.includes(post._id) ? '★ Bookmarked' : '☆ Bookmark'}
                </button>
                <button className="btn btn-outline-dark btn-sm" disabled>Read More</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs; 