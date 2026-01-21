import { useState, useEffect } from 'react';

function BookDetailsModal({ book, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(book.rating || 0);
    const [review, setReview] = useState(book.review || '');
    const [status, setStatus] = useState(book.status || 'unread');
    const [isSaving, setIsSaving] = useState(false);

    // Collections state
    const [allCollections, setAllCollections] = useState([]);
    const [bookCollections, setBookCollections] = useState([]);

    // Update local state when book changes
    useEffect(() => {
        setRating(book.rating || 0);
        setReview(book.review || '');
        setStatus(book.status || 'unread');

        // Fetch book collections
        // We will need a new endpoint or fetch strategy. 
        // For now, let's fetch all collections, and then we need to know which ones this book is in.
        // The backend doesn't provide book's collections in default GET.
        // Let's assume we can fetch all collections and simplisticly manage state.
        // Ideally we need `GET /api/books/:id/collections`. Let's implement that? 
        // Or better: Let's fetch all collections, and for each checks if book is in it? No.

        // Let's implement `GET /api/books/:id/collections` logic here by creating a quick route or 
        // just using the `book_collections` table?
        // Actually, let's fetch all collections first.
        fetch('/api/collections')
            .then(res => res.json())
            .then(data => setAllCollections(data.data || []));

        // And fetch this book's collections.
        // We need an endpoint for this. I haven't created it.
        // Let's create a temporary client side workaround or add the endpoint.
        // Endpoint `GET /api/books/:id/collections` is missing.
        // Workaround: We can't easily know. 
        // Let's add the endpoint in server/index.js in next step if needed, or ...
        // Wait, I can't modify server in this tool call.
        // Let's try to assume a route exists or just manage it locally?
        // No, persistence is key.
        // Let's add a "Manage Collections" section that lists all collections
        // and clicking one toggles membership. Use POST/DELETE endpoints.
        // But we need initial state.

        // Let's lazy load the state: Check membership by fetching "books in collection" for each collection?
        // Too many requests.
        // Let's assume I will add `GET /api/books/:id/collections` in the next step.
        // For now I will write the FE code assuming it returns [ {id, title, icon} ]
        fetch(`/api/books/${book.id}/collections`)
            .then(res => res.json())
            .then(data => setBookCollections(data.data || []))
            .catch(() => setBookCollections([]));

    }, [book]);

    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);
        try {
            await fetch(`/api/books/${book.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            book.status = newStatus;
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/books/${book.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review })
            });
            book.rating = rating;
            book.review = review;
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCollection = async (collection) => {
        const isMember = bookCollections.find(c => c.id === collection.id);

        try {
            if (isMember) {
                // Remove
                await fetch(`/api/collections/${collection.id}/books/${book.id}`, { method: 'DELETE' });
                setBookCollections(prev => prev.filter(c => c.id !== collection.id));
            } else {
                // Add
                await fetch(`/api/collections/${collection.id}/books`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: book.id })
                });
                setBookCollections(prev => [...prev, collection]);
            }
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to toggle collection", error);
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
                                width: '100%',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow)',
                                objectFit: 'contain'
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

                        {/* Status Section */}
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            {['unread', 'reading', 'read'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '2rem',
                                        border: '1px solid var(--accent-color)',
                                        backgroundColor: status === s ? 'var(--accent-color)' : 'transparent',
                                        color: status === s ? '#0f172a' : 'var(--accent-color)',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Collections Section */}
                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Collections</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {allCollections.map(col => {
                                    const isSelected = bookCollections.some(c => c.id === col.id);
                                    return (
                                        <button
                                            key={col.id}
                                            onClick={() => toggleCollection(col)}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                border: '1px solid ' + (isSelected ? 'var(--accent-color)' : 'var(--bg-card)'),
                                                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-secondary)',
                                                color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {col.icon} {col.title}
                                        </button>
                                    );
                                })}
                                {allCollections.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No collections created yet.</span>}
                            </div>
                        </div>

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
