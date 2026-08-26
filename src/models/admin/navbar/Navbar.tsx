import React from "react";
import { FaBoxes, FaThList, FaSlidersH, FaBars, FaUsers } from "react-icons/fa";
import "./Navbar.css";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="admin-navbar">
            <button onClick={toggleMenu} className="menu-toggle-btn">
                <FaBars className="menu-icon" />
            </button>
            <div className={`admin-navbar-container ${isMenuOpen ? 'open' : ''}`}>
                <div className="admin-nav-cards">
                    <NavLink to="/admin" className="admin-nav-card" onClick={() => setIsMenuOpen(false)}>
                        <div className="admin-nav-card-icon">
                            <FaBoxes />
                        </div>
                        <div className="admin-nav-card-content">
                            <span className="admin-nav-card-title">Məhsullar</span>
                            <span className="admin-nav-card-desc">Bütün kolleksiya</span>
                        </div>
                    </NavLink>

                    <NavLink to="/admin/categories" className="admin-nav-card" onClick={() => setIsMenuOpen(false)}>
                        <div className="admin-nav-card-icon">
                            <FaThList />
                        </div>
                        <div className="admin-nav-card-content">
                            <span className="admin-nav-card-title">Kateqoriyalar</span>
                            <span className="admin-nav-card-desc">Sehrli bölmələr</span>
                        </div>
                    </NavLink>

                    <NavLink to="/admin/users" className="admin-nav-card" onClick={() => setIsMenuOpen(false)}>
                        <div className="admin-nav-card-icon">
                            <FaUsers />
                        </div>
                        <div className="admin-nav-card-content">
                            <span className="admin-nav-card-title">İstifadəçilər</span>
                            <span className="admin-nav-card-desc">Göstəricilər</span>
                        </div>
                    </NavLink>

                    <NavLink to="/admin/features" className="admin-nav-card" onClick={() => setIsMenuOpen(false)}>
                        <div className="admin-nav-card-icon">
                            <FaSlidersH />
                        </div>
                        <div className="admin-nav-card-content">
                            <span className="admin-nav-card-title">Xüsusiyyətlər</span>
                            <span className="admin-nav-card-desc">Göstəricilər</span>
                        </div>
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;