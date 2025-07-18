import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/posts";
const API_BASE = "http://localhost:5000";

const getAvatar = (path) =>
  path
    ? path.startsWith("http")
      ? path
      : `${API_BASE}${path.startsWith("/") ? path : "/" + path}`
    : "/default_avatar.png";

const PublicWall = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setPosts(res.data);
    } catch {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      fetchPosts();
    } catch {
      setError("Failed to post.");
    }
  };

  const toggleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch {
      setError("Failed to update like.");
    }
  };

  const addComment = async (postId, commentContent) => {
    if (!commentContent.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/${postId}/comment`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch {
      setError("Failed to add comment.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-violet-100 via-sky-100 to-rose-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          📣 Public Wall
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white/70 backdrop-blur-md shadow-xl border border-white/40 p-6 rounded-2xl"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your update or learning request..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none mb-4 focus:ring-2 focus:ring-indigo-300"
            rows={3}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:-translate-y-0.5 hover:bg-indigo-700 transition active:scale-95"
          >
            Post
          </button>
        </form>

        {loading && (
          <p className="text-center text-gray-600 animate-pulse">
            Loading posts…
          </p>
        )}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-600">
            Be the first to share something!
          </p>
        )}

        <ul className="space-y-6">
          {posts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              onLike={toggleLike}
              onAddComment={addComment}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

const PostItem = ({ post, onLike, onAddComment }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  return (
    <li className="bg-white/90 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow hover:shadow-lg transition">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={getAvatar(post.user.avatar)}
          alt={post.user.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
        />
        <div>
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="mb-3 text-gray-800">{post.content}</p>

      <div className="flex items-center gap-6 mb-4 text-sm">
        <button
          onClick={() => onLike(post._id)}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:-translate-y-0.5 transition"
        >
          👍 {post.likes.length}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          💬 {post.comments.length}
        </button>
      </div>

      {showComments && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddComment(post._id, commentText);
              setCommentText("");
            }}
            className="mb-2"
          >
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300"
            />
          </form>

          <ul className="space-y-2 mt-2">
            {post.comments.map((comment) => (
              <li key={comment._id} className="flex gap-2 items-start">
                <img
                  src={getAvatar(comment.user.avatar)}
                  alt={comment.user.name}
                  className="w-7 h-7 rounded-full object-cover border"
                />
                <div className="bg-gray-100 p-3 rounded-xl w-full shadow-sm">
                  <p className="text-sm font-semibold">{comment.user.name}</p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </li>
  );
};


export default PublicWall;
