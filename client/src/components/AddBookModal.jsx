import { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';

function AddBookModal({ onClose, onBookAdded, initialData }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        author: initialData?.author || '',
        isbn: initialData?.isbn || '',
        cover: initialData?.cover || '',
        description: initialData?.description || '',
        status: 'unread'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const performIsbnSearch = async (isbnToSearch) => {
        if (!isbnToSearch) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/isbn/${isbnToSearch}`);
            if (!res.ok) throw new Error('Book not found or API error');
            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                author: data.authors ? data.authors.map(a => a.name).join(', ') : prev.author,
                cover: data.cover ? data.cover.medium : (data.cover?.small || prev.cover),
                description: data.description || prev.description
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIsbnSearch = () => {
        performIsbnSearch(formData.isbn);
    };

    const handleScanSuccess = (decodedText) => {
        setShowScanner(false);
        setFormData(prev => ({ ...prev, isbn: decodedText }));
        performIsbnSearch(decodedText);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to add book');
            const data = await res.json();
            onBookAdded(data.data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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
        }}>
            <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--bg-card)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Add New Book</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                {showScanner ? (
                    <div style={{ marginBottom: '1rem' }}>
                        <BarcodeScanner
                            onScanSuccess={handleScanSuccess}
                            onScanFailure={(err) => console.log(err)}
                        />
                        <button
                            onClick={() => setShowScanner(false)}
                            className="btn btn-ghost"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            Cancel Scan
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                name="isbn"
                                placeholder="ISBN (optional)"
                                value={formData.isbn}
                                onChange={handleChange}
                                className="input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="btn btn-ghost"
                                title="Scan Barcode"
                            >
                                📸
                            </button>
                            <button
                                type="button"
                                onClick={handleIsbnSearch}
                                className="btn btn-ghost"
                                disabled={isLoading || !formData.isbn}
                            >
                                Search
                            </button>
                        </div>

                        <input
                            name="title"
                            placeholder="Title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input"
                            required
                        />

                        <input
                            name="author"
                            placeholder="Author"
                            value={formData.author}
                            onChange={handleChange}
                            className="input"
                            required
                        />

                        <input
                            name="cover"
                            placeholder="Cover URL"
                            value={formData.cover}
                            onChange={handleChange}
                            className="input"
                        />

                        {/* Status Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['unread', 'reading', 'read'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '2rem',
                                            border: '1px solid var(--accent-color)',
                                            backgroundColor: formData.status === s ? 'var(--accent-color)' : 'transparent',
                                            color: formData.status === s ? '#0f172a' : 'var(--accent-color)',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            transition: 'all 0.2s',
                                            flex: 1
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Add Book'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AddBookModal;
