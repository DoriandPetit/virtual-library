import { useState, useEffect } from 'react';

function OnlineSearchModal({ onClose, onAddBook, initialQuery }) {
    const [query, setQuery] = useState(initialQuery || '');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/search/online?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setResults(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-search if initialQuery provided
    useEffect(() => {
        if (initialQuery) {
            handleSearch();
        }
    }, []);

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
                maxWidth: '800px',
                height: '80vh',
                border: '1px solid var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Search Online</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        className="input"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for books..."
                        style={{ flex: 1 }}
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                    {results.map((book, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '90px',
                                backgroundColor: 'var(--bg-card)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                {book.cover ? (
                                    <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No Cover</div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{book.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{book.author}</p>
                                {book.description && (
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        marginTop: '0.5rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {book.description}
                                    </p>
                                )}
                            </div>
                            <button
                                className="btn btn-ghost"
                                style={{ alignSelf: 'center', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                                onClick={() => onAddBook(book)}
                            >
                                Add
                            </button>
                        </div>
                    ))}
                    {results.length === 0 && !isLoading && query && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                            No results found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OnlineSearchModal;
