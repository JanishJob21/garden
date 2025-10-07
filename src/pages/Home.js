import { Link } from "react-router-dom";
import "./Home.css";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Community Garden Plot Scheduler</h1>
          <p>
            Reserve, manage, and track garden plots with ease. Built for admins,
            managers, and members to collaborate like a modern SaaS platform.
          </p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/dashboard" className="btn">Go to Dashboard</Link>
                {user.role==='Admin' && <Link to="/admin" className="btn ghost">Admin Dashboard</Link>}
                {user.role==='Manager' && <Link to="/manager" className="btn ghost">Manager Dashboard</Link>}
              </>
            ) : (
              <>
                <Link to="/signup" className="btn">Get Started</Link>
                <Link to="/login" className="btn ghost">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about container">
        <h2>Grow Together, Organize Smarter</h2>
        <p>
          Our scheduler streamlines plot reservations, approvals, tools management, and
          feedback collection. Auto-save drafts let you pick up where you left off.
        </p>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="card">
              <h3>Easy Plot Booking</h3>
              <p>Reserve your garden plot with a few clicks. Check real-time availability and select your preferred plot location and size.</p>
            </div>
            <div className="card">
              <h3>Garden Tools Rental</h3>
              <p>Browse and reserve gardening tools. Get notified when your requested tools are available for pickup.</p>
            </div>
            <div className="card">
              <h3>Seasonal Planning</h3>
              <p>Track your planting schedule and get reminders for seasonal maintenance tasks.</p>
            </div>
            <div className="card">
              <h3>Community Sharing</h3>
              <p>Share gardening tips, surplus produce, and connect with fellow gardeners in your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>© {new Date().getFullYear()} Community Garden</div>
        <div className="social">
          <a href="#" aria-label="Twitter">Twitter</a>
          <a href="#" aria-label="Instagram">Instagram</a>
          <a href="#" aria-label="GitHub">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
