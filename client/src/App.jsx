import { useState, useEffect } from 'react';
import AddBookModal from './components/AddBookModal';
import BookDetailsModal from './components/BookDetailsModal';

function App() {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch books from API
  const fetchBooks = () => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data.data || []))
      .catch(err => console.error("Failed to fetch books", err));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookAdded = (newBook) => {
    setBooks(prev => [newBook, ...prev]);
  };

  const deleteBook = (e, id) => {
    e.stopPropagation(); // Prevent opening details modal
    if (!confirm('Are you sure you want to delete this book?')) return;

    fetch(`/api/books/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          setBooks(prev => prev.filter(b => b.id !== id));
          if (selectedBook?.id === id) {
            setSelectedBook(null); // Close modal if open
          }
        }
      })
      .catch(console.error);
  };

  return (
    <div className="container">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 0',
        borderBottom: '1px solid var(--bg-secondary)'
      }}>
        <h1>My Library</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Book
        </button>
      </header>

      <main>
        {books.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
            <p>No books in your library yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '2rem'
          }}>
            {books.map(book => (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  transform: selectedBook?.id === book.id ? 'scale(1.02)' : 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{
                  height: '240px',
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden'
                }}>
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>No Cover</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', lineHeight: '1.3' }}>{book.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{book.author}</p>
                  </div>
                  <button
                    onClick={(e) => deleteBook(e, book.id)}
                    className="btn btn-ghost"
                    style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem', alignSelf: 'flex-end', marginTop: '0.5rem', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <AddBookModal
          onClose={() => setIsModalOpen(false)}
          onBookAdded={handleBookAdded}
        />
      )}

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}

export default App;
