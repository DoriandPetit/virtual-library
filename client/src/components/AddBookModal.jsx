import { useState } from 'react';

function AddBookModal({ onClose, onBookAdded }) {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        cover: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIsbnSearch = async () => {
        if (!formData.isbn) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/isbn/${formData.isbn}`);
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
                border: '1px solid var(--bg-card)'
            }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Add New Book</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

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
            </div>
        </div>
    );
}

export default AddBookModal;
