import React, { useState } from 'react';
import './CommentSection.css';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

const CommentSection = ({ issueId, comments = [], onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/issues/${issueId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: newComment })
            });

            if (res.ok) {
                const comment = await res.json();
                onAddComment(comment);
                setNewComment('');
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Formatter for relative time (e.g., "2 hours ago")
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="comment-section">
            <h3 className="section-title">Comments ({comments.length})</h3>

            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                <FaUserCircle />
                            </div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <span className="comment-author">User {comment.userId?.substring(0, 5)}</span>
                                    <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                                </div>
                                <div className="comment-text">{comment.text}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form className="comment-form" onSubmit={handleSubmit}>
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button type="submit" disabled={!newComment.trim() || submitting}>
                        <FaPaperPlane />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentSection;
