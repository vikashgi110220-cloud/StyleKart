
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";
import API_BASE_URL from "../config/api";
const API_URL = `${API_BASE_URL}/api/auth/profile`;

function Profile() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("stylekart_token");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch profile.");
      }

      setProfile(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCancel() {
    setFormData({
      name: profile.name,
      email: profile.email,
    });

    setIsEditing(false);
    setError("");
    setMessage("");
  }

  async function handleUpdate(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setProfile(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
      });

      // Keep AuthContext and localStorage synchronized
      const currentToken = localStorage.getItem("stylekart_token");
      login(data.user, currentToken);

      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Loading your profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <p className="profile-error">{error}</p>
        <button onClick={fetchProfile}>Try Again</button>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="profile-container">
      <div className="profile-heading">
        <p className="profile-eyebrow">MY ACCOUNT</p>
        <h1>My Profile</h1>
        <p>Manage your personal information and account details.</p>
      </div>

      <section className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-identity">
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <span className="profile-role">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="profile-divider" />

        {message && (
          <p className="profile-success">{message}</p>
        )}

        {error && (
          <p className="profile-error">{error}</p>
        )}

        <div className="profile-section-heading">
          <div>
            <h3>Personal Information</h3>
            <p>Your account information</p>
          </div>

          {!isEditing && (
            <button
              className="profile-edit-button"
              onClick={() => {
                setMessage("");
                setIsEditing(true);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate}>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <div className="profile-account-info">
            <div>
              <span>Account ID</span>
              <strong>#{profile.id}</strong>
            </div>

            <div>
              <span>Account Role</span>
              <strong>{profile.role}</strong>
            </div>

            <div>
              <span>Member Since</span>
              <strong>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Not available"}
              </strong>
            </div>
          </div>

          {isEditing && (
            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

export default Profile;
