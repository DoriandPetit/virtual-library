import { useState, useEffect } from 'react';
import AddBookModal from './components/AddBookModal';
import BookDetailsModal from './components/BookDetailsModal';
import OnlineSearchModal from './components/OnlineSearchModal';

function App() {
  const [books, setBooks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null); // null = All Books
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnlineSearchOpen, setIsOnlineSearchOpen] = useState(false);
  const [bookInitialData, setBookInitialData] = useState(null);

  // Fetch books (optionally filtered by collection)
  const fetchBooks = () => {
    // ... logic is inside useEffect below, redundant function declaration removed for clarity or can be kept if reused.
  };

  const fetchCollections = () => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => setCollections(data.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    // Custom logic to fetch books based on selection
    if (selectedCollection) {
      fetch(`/api/collections/${selectedCollection.id}/books`)
        .then(res => res.json())
        .then(data => {
          setBooks(data.data || []);
        })
        .catch(console.error);
    } else {
      // Fetch all
      fetch('/api/books')
        .then(res => res.json())
        .then(data => setBooks(data.data || []))
        .catch(console.error);
    }
  }, [selectedCollection]);

  const handleCreateCollection = () => {
    const title = prompt("Collection Title:");
    if (!title) return;
    const icon = prompt("Icon (emoji):", "📚");

    fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, icon })
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setCollections(prev => [...prev, data.data]);
        }
      });
  };

  const handleDeleteCollection = (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this collection?")) return;
    fetch(`/api/collections/${id}`, { method: 'DELETE' })
      .then(() => {
        setCollections(prev => prev.filter(c => c.id !== id));
        if (selectedCollection?.id === id) setSelectedCollection(null);
      });
  };

  const handleBookAdded = (newBook) => {
    // Refresh books if we are in "All Books" view
    if (!selectedCollection) {
      setBooks(prev => [newBook, ...prev]);
    } else {
      // If in collection view, we probably want to assume it's not in the collection yet.
      // Or we could refresh.
    }
  };

  const deleteBook = (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this book?')) return;

    fetch(`/api/books/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          setBooks(prev => prev.filter(b => b.id !== id));
          if (selectedBook?.id === id) setSelectedBook(null);
        }
      })
      .catch(console.error);
  };

  // Filter books based on search query
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--bg-card)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flexShrink: 0
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Library</h2>

        <button
          onClick={() => setSelectedCollection(null)}
          style={{
            textAlign: 'left',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            backgroundColor: !selectedCollection ? 'var(--accent-color)' : 'transparent',
            color: !selectedCollection ? '#0f172a' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: !selectedCollection ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>📚</span> All Books
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Collections</h3>
          <button onClick={handleCreateCollection} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {collections.map(col => (
            <div key={col.id} style={{ position: 'relative', group: 'collection-item' }}
              onMouseEnter={e => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}
            >
              <button
                onClick={() => setSelectedCollection(col)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: selectedCollection?.id === col.id ? 'var(--bg-card)' : 'transparent',
                  color: selectedCollection?.id === col.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: '1px solid ' + (selectedCollection?.id === col.id ? 'var(--bg-card)' : 'transparent'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{col.icon || '📁'}</span> {col.title}
              </button>
              <button
                className="del-btn"
                onClick={(e) => handleDeleteCollection(e, col.id)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="container" style={{ flex: 1 }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem 0',
          borderBottom: '1px solid var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem' }}>
              {selectedCollection ? (
                <>
                  <span style={{ marginRight: '0.5rem' }}>{selectedCollection.icon}</span>
                  {selectedCollection.title}
                </>
              ) : 'All Books'}
            </h1>
            {selectedCollection && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                ({filteredBooks.length} items)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              className="input"
              placeholder="Search local..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '200px' }}
            />
            <button
              className="btn btn-ghost"
              onClick={() => setIsOnlineSearchOpen(true)}
              title="Search Online"
            >
              🌐 Search Web
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setBookInitialData(null);
                setIsModalOpen(true);
              }}
            >
              + Add Book
            </button>
          </div>
        </header>

        <main>
          {filteredBooks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
              <p>No books found.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '2rem'
            }}>
              {filteredBooks.map(book => (
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
                    {book.status && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: book.status === 'read' ? 'var(--success)' :
                          book.status === 'reading' ? 'var(--accent-color)' :
                            'var(--danger)',
                        color: book.status === 'reading' ? '#0f172a' : '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {book.status}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', lineHeight: '1.3' }}>{book.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{book.author}</p>
                      {book.rating > 0 && (
                        <div style={{ display: 'flex', gap: '0.1rem', marginTop: '0.5rem' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              style={{
                                fontSize: '0.9rem',
                                color: star <= book.rating ? '#fbbf24' : 'var(--bg-card)'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
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
            initialData={bookInitialData}
          />
        )}

        {isOnlineSearchOpen && (
          <OnlineSearchModal
            initialQuery={searchQuery} // Pre-fill with current local search
            onClose={() => setIsOnlineSearchOpen(false)}
            onAddBook={(bookData) => {
              setIsOnlineSearchOpen(false);
              setBookInitialData(bookData);
              setIsModalOpen(true);
            }}
          />
        )}

        {selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onUpdate={() => {
              // Refresh book list
              if (selectedCollection) {
                fetch(`/api/collections/${selectedCollection.id}/books`)
                  .then(res => res.json())
                  .then(data => setBooks(data.data || []))
                  .catch(console.error);
              } else {
                fetch('/api/books')
                  .then(res => res.json())
                  .then(data => setBooks(data.data || []))
                  .catch(console.error);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
