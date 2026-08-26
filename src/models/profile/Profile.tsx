import type React from "react";
import { NavLink } from "react-router-dom";
import type { ProfileDataProps } from "../../types/TotalTypes";
import "./Profile.css";
import { FaX } from "react-icons/fa6";

const Profile: React.FC<ProfileDataProps> = ({ profileData, setProfileData }) => {
  if (!profileData) {
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          <p className="profile-empty">İstifadəçi məlumatı tapılmadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <button className="profile-close-btn" onClick={() => setProfileData(null)}>
            <FaX className="profile-close-icon" />
        </button>
        <div className="profile-avatar-wrapper">
          {profileData.picture ? (
            <img 
              src={profileData.picture} 
              alt={`${profileData.name} ${profileData.surname}`} 
              className="profile-avatar" 
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {profileData.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          {profileData.isAdmin && <span className="profile-admin-badge">Admin</span>}
        </div>

        <h2 className="profile-name">
          {profileData.name} {profileData.surname}
        </h2>
        <p className="profile-email">{profileData.email}</p>

        <div className="profile-details">
          <div className="profile-detail-item">
            <span className="profile-detail-label">Telefon:</span>
            <span className="profile-detail-value">
              {profileData.phoneNumber || "Qeyd edilməyib"}
            </span>
          </div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Rolu:</span>
            <span className="profile-detail-value">
              {profileData.isAdmin ? "Administrator" : "İstifadəçi"}
            </span>
          </div>
        </div>

        {profileData.isAdmin && (
          <NavLink to="/admin" className="profile-admin-link">
            Admin Panelə Keçid
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Profile;