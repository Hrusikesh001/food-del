// Navbar.jsx
import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to='/'><img src={assets.logo} alt="Logo" className="logo" /></Link>

      {/* Hamburger icon */}
      <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <span className={mobileMenuOpen ? 'bar open' : 'bar'}></span>
        <span className={mobileMenuOpen ? 'bar open' : 'bar'}></span>
        <span className={mobileMenuOpen ? 'bar open' : 'bar'}></span>
      </div>

      <ul className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
        <Link to='/' onClick={() => { setMenu("home"); setMobileMenuOpen(false); }} className={menu === "home" ? "active" : ""}>Home</Link>
        <a href='#explore-menu' onClick={() => { setMenu("menu"); setMobileMenuOpen(false); }} className={menu === "menu" ? "active" : ""}>Menu</a>
        <a href='#app-download' onClick={() => { setMenu("mobile-app"); setMobileMenuOpen(false); }} className={menu === "mobile-app" ? "active" : ""}>Mobile-App</a>
        <a href='#footer' onClick={() => { setMenu("contact-us"); setMobileMenuOpen(false); }} className={menu === "contact-us" ? "active" : ""}>Contact Us</a>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="Search" className="icon" />
        <div className="navbar-basket">
          <Link to='/cart'><img src={assets.basket_icon} alt="Basket" className="icon" /></Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)} className="sign-in-btn">sign in</button>
        ) : (
          <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
