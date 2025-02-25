import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Modern Apartment in Central Madrid",
      details: "2 bedrooms, 1 bathroom",
      price: "€850/month",
      image: "placeholder.jpg"
    }
    // You can add more sample listings here
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search Query:", searchQuery);
    // Integrate with your backend search API here
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo"><h1>Homie</h1></div>
        <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Listings</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Dream Home in Madrid</h1>
          <p>Discover the perfect place to live with Homie's smart apartment matching system</p>
          <div className="hero-buttons">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Available Apartments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Happy Tenants</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Neighborhoods</span>
          </div>
        </div>
      </section>
      
      <main>
        <section className="search-section">
          <h2>Find Your Perfect Apartment</h2>
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Describe what you’re looking for..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </section>
        
        <section className="listings-section">
          <h2>Listings</h2>
          <div className="listings">
            {listings.map(listing => (
              <div className="listing-card" key={listing.id}>
                <img src={listing.image} alt="Apartment"/>
                <div className="listing-info">
                  <h3>{listing.title}</h3>
                  <p>{listing.details}</p>
                  <p>{listing.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer>
        <p>&copy; 2025 Homie. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
