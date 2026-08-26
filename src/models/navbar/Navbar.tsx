import React from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../api/api';
import './Navbar.css';
import Login from '../login/Login';
import type { NavbarProps, ProfileType } from '../../types/TotalTypes';
import Profile from '../profile/Profile';

export const Navbar: React.FC<NavbarProps> = ({ profile, setProfile, setShowCategory, filter, setFilter }) => {
    const [hasToken, setHasToken] = React.useState<boolean>(false);
    const [showLoginForm, setShowLoginForm] = React.useState<boolean>(false);
    const [profileData, setProfileData] = React.useState<ProfileType | null>(null);

    const checkToken = async (): Promise<void> => {
        try {
            const response = await api.get('/users/getMe');
            setHasToken(true);
            setProfile(response?.data as ProfileType);
        } catch (error) {
            setHasToken(false);
        }
    }

    const handleLoginClick = () => {
        setShowLoginForm(true);
    }

    const handleShowProfile = () => {
        if (profile) {
            setShowCategory(false);
            setProfileData(profile as ProfileType);
        }
    }

    React.useEffect(() => {
        checkToken();
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <button className="menu-toggle-btn" aria-label="Menyunu aç" onClick={() => {
                    setShowCategory(prev => !prev);
                    setProfileData(null);
                }}>
                    <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <NavLink to="/" className="navbar-logo">
                    <div className="logo-badge">⚡</div>
                    <span className="logo-text">Harry's <span className="gold-text">Magic</span></span>
                </NavLink>

                <div className="navbar-links">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Məhsullar</span>
                    </NavLink>

                    <NavLink to="/basket" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                        <span>Səbət</span>
                    </NavLink>

                    <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Sifarişlər</span>
                    </NavLink>
                </div>

                <div className="search-container">
                    <input type="text" value={filter?.name ?? ""} className="search-input" placeholder="Sehrli əşya axtar..." onChange={(e) =>
                        setFilter({ ...filter, name: e.target.value.trim() === "" ? null : e.target.value })} />
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="navbar-actions">
                    {hasToken ? (
                        <button className="profile-icon-btn" onClick={handleShowProfile}>
                            <svg className="profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="profile-icon-name">Profil</span>
                        </button>) :
                        (
                            <button className="login-btn" onClick={() => handleLoginClick()}>
                                <svg className="login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                <span className="login-text">Daxil ol</span>
                            </button>
                        )}
                </div>

            </div>
            {showLoginForm && (
                <Login setShowLoginForm={setShowLoginForm} />
            )}

            {
                profileData && (
                    <Profile profileData={profileData} setProfileData={setProfileData} />
                )
            }
        </nav>
    );
};