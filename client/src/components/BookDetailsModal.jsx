import { useState, useEffect } from 'react';

function BookDetailsModal({ book, onClose }) {
    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(book.rating || 0);
    const [review, setReview] = useState(book.review || '');
    const [isSaving, setIsSaving] = useState(false);

    // Update local state when book changes
    useEffect(() => {
        setRating(book.rating || 0);
        setReview(book.review || '');
    }, [book]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/books/${book.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review })
            });
            // Optionally update local book object if needed via callback, 
            // but for now we just exit edit mode and mutate the prop object (simplified for MVP)
            book.rating = rating;
            book.review = review;
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!book) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.25rem'
                    }}
                >
                    ×
                </button>

                <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column', alignItems: 'center' }}>
                    {book.cover ? (
                        <img
                            src={book.cover}
                            alt={book.title}
                            style={{
                                maxWidth: '200px',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '200px',
                            height: '300px',
                            backgroundColor: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius)'
                        }}>
                            <span style={{ color: 'var(--text-secondary)' }}>No Cover</span>
                        </div>
                    )}

                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{book.title}</h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{book.author}</p>

                        {book.description && (
                            <div style={{
                                textAlign: 'left',
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                color: 'var(--text-primary)',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</h4>
                                {book.description}
                            </div>
                        )}

                        {/* Review Section */}
                        <div style={{
                            textAlign: 'left',
                            borderTop: '1px solid var(--bg-card)',
                            paddingTop: '1.5rem',
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem' }}>My Review</h3>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                style={{
                                                    cursor: 'pointer',
                                                    fontSize: '1.5rem',
                                                    color: star <= rating ? '#fbbf24' : 'var(--text-secondary)'
                                                }}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <textarea
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder="Write your review here..."
                                        className="input"
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button
                                            onClick={() => {
                                                setRating(book.rating || 0);
                                                setReview(book.review || '');
                                                setIsEditing(false);
                                            }}
                                            className="btn btn-ghost"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="btn btn-primary"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Review'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                style={{
                                                    fontSize: '1.25rem',
                                                    color: star <= (book.rating || 0) ? '#fbbf24' : 'var(--text-secondary)'
                                                }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    {book.review ? (
                                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{book.review}</p>
                                    ) : (
                                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No review yet.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {book.isbn && (
                            <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                ISBN: <span style={{ fontFamily: 'monospace' }}>{book.isbn}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookDetailsModal;
