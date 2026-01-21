# Biblio - Personal Library Manager

A self-hosted web application to manage your personal book collection. Designed for homelab enthusiasts who want a simple, offline-first solution to track their library.

## Features

- 📚 **Book Management**: Add books manually or automatically via ISBN search (powered by OpenLibrary).
- 🖼️ **Visual Dashboard**: Browse your collection with cover art in a beautiful, responsive grid.
- ✨ **Detailed Insights**: View full book descriptions, authors, and metadata.
- ⭐ **Reviews & Ratings**: Rate your books (1-5 stars) and write personal reviews.
- 📱 **Mobile Friendly**: Fully responsive design that works great on phones and tablets.
- 💾 **Local & Private**: All data is stored locally in a SQLite database. No external tracking.

## Tech Stack

- **Frontend**: React + Vite (Vanilla CSS)
- **Backend**: Node.js + Express
- **Database**: SQLite

## Getting Started

### Prerequisites
- Node.js (v18 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Biblio
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies (concurrently)
   npm install

   # Install Server dependencies
   cd server
   npm install

   # Install Client dependencies
   cd ../client
   npm install
   ```

3. **Run the Application**
   Return to the root directory and start the development server:
   ```bash
   cd ..
   npm run dev
   ```

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:3000](http://localhost:3000)

## Roadmap

Future features planned for development:

- [ ] Reading Status (To Read, Currently Reading, Finished)
- [ ] Shelves / Collections / Tags
- [ ] Barcode Scanner via Camera

- [ ] Docker Containerization
- [ ] Import/Export (Goodreads, CSV)
- [ ] Search & Filter functionality
- [ ] Many many others (notably AI based features)...


