
import React, { useContext, useState } from 'react';
import './Navbar.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    getTotalCartAmount,
    token,
    setToken,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

    // Navigate to the home page so search results are visible.
    if (window.location.pathname !== '/') {
      navigate('/');
    }

    setMenu('home');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate('/');
      document.getElementById('food-display')?.scrollIntoView({
        behavior: 'smooth',
      });
    }

    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="navbar">
      <Link to="/" onClick={() => setMenu('home')}>
        <img src={assets.logo} alt="FoodTaxi Logo" className="logo" />
      </Link>

      {/* Hamburger menu */}
      <div
        className="hamburger"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setMobileMenuOpen(!mobileMenuOpen);
          }
        }}
      >
        <span className={mobileMenuOpen ? 'bar open' : 'bar'} />
        <span className={mobileMenuOpen ? 'bar open' : 'bar'} />
        <span className={mobileMenuOpen ? 'bar open' : 'bar'} />
      </div>

      {/* Navigation links */}
      <ul className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link
          to="/"
          onClick={() => {
            setMenu('home');
            setMobileMenuOpen(false);
          }}
          className={menu === 'home' ? 'active' : ''}
        >
          Home
        </Link>

        <a
          href="/#explore-menu"
          onClick={() => {
            setMenu('menu');
            setMobileMenuOpen(false);
          }}
          className={menu === 'menu' ? 'active' : ''}
        >
          Menu
        </a>

        <a
          href="/#app-download"
          onClick={() => {
            setMenu('mobile-app');
            setMobileMenuOpen(false);
          }}
          className={menu === 'mobile-app' ? 'active' : ''}
        >
          Mobile-App
        </a>

        <a
          href="/#footer"
          onClick={() => {
            setMenu('contact-us');
            setMobileMenuOpen(false);
          }}
          className={menu === 'contact-us' ? 'active' : ''}
        >
          Contact Us
        </a>
      </ul>

      {/* Search, cart, and authentication */}
      <div className="navbar-right">
        <div className={`navbar-search ${searchOpen ? 'open' : ''}`}>
          {searchOpen && (
            <input
              type="search"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search dishes"
              autoFocus
            />
          )}

          <button
            type="button"
            className="search-toggle"
            onClick={() => {
              if (searchOpen && searchQuery) {
                setSearchQuery('');
              } else {
                setSearchOpen(!searchOpen);
              }
            }}
            aria-label={searchOpen ? 'Clear search' : 'Open search'}
          >
            <img
              src={assets.search_icon}
              alt=""
              className="icon"
            />
          </button>
        </div>

        <div className="navbar-basket">
          <Link to="/cart">
            <img
              src={assets.basket_icon}
              alt="Basket"
              className="icon"
            />
          </Link>
          <div className={getTotalCartAmount() === 0 ? '' : 'dot'} />
        </div>

        {!token ? (
          <button
            onClick={() => setShowLogin(true)}
            className="sign-in-btn"
          >
            Sign in
          </button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="Profile" />

            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>

              <hr />

              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
