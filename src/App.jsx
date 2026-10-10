import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import api from "./services/api";
import ExploreSkills from "./pages/ExploreSkills";
import UserProfile from "./pages/UserProfile";
import SwapRequests from "./pages/SwapRequests";
import MySwaps from "./pages/MySwaps";
import Chatbot from "./components/Chatbot";
import { useToast } from "./context/ToastContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name") || "Profile";

  const [pendingCount, setPendingCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("skillswap_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("skillswap_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    if (loggedIn && userId) {
      api.get(`/swaps/incoming/${userId}`)
        .then((res) => {
          const pending = (res.data || []).filter((s) => s.status === "PENDING");
          setPendingCount(pending.length);
        })
        .catch(() => {});
    }
  }, [loggedIn, userId, location.pathname]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        <Link className="brand-logo" to="/">
          <div className="brand-icon">⮂</div>
          <span>SkillSwap</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-item ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          {loggedIn && (
            <>
              <Link
                to="/explore"
                className={`nav-item ${isActive("/explore") ? "active" : ""}`}
              >
                Explore
              </Link>

              <Link
                to="/requests"
                className={`nav-item ${isActive("/requests") ? "active" : ""}`}
              >
                Requests
                {pendingCount > 0 && (
                  <span className="nav-badge">{pendingCount}</span>
                )}
              </Link>

              <Link
                to="/swaps"
                className={`nav-item ${isActive("/swaps") ? "active" : ""}`}
              >
                My Swaps
              </Link>

              <Link
                to="/profile"
                className={`nav-item ${isActive("/profile") ? "active" : ""}`}
              >
                {userName}
              </Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          >
            <span>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</span>
          </button>

          {loggedIn ? (
            <button
              type="button"
              className="btn-logout"
              onClick={logout}
            >
              Log Out
            </button>
          ) : (
            <Link to="/login" className="btn-login-nav">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Page({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {localStorage.getItem("token") && <Chatbot />}
    </>
  );
}

function Home() {
  const loggedIn = localStorage.getItem("token");

  return (
    <Page>
      <section className="hero-box">
        <div className="hero-pill">
          <span>⚡</span> The Modern Knowledge Barter Network
        </div>

        <h1>
          Exchange skills directly. Master anything without spending money.
        </h1>

        <p>
          Connect with peers who possess the skills you want to learn, and trade your own expertise in return through direct, verified barter sessions.
        </p>

        <div className="hero-actions">
          <Link
            to={loggedIn ? "/explore" : "/register"}
            className="btn btn-primary"
          >
            {loggedIn ? "Explore Skill Partners →" : "Get Started Free →"}
          </Link>
          {!loggedIn && (
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          )}
        </div>
      </section>

      <div className="grid">
        <div className="card feature-card">
          <div className="feature-icon-wrapper" style={{ color: "var(--accent-teach)" }}>
            🎓
          </div>
          <h3>1. Teach Your Craft</h3>
          <p>
            Share coding, music, languages, design, or business insights that you already know and love.
          </p>
        </div>

        <div className="card feature-card">
          <div className="feature-icon-wrapper" style={{ color: "var(--accent-learn)" }}>
            🎯
          </div>
          <h3>2. Learn What You Need</h3>
          <p>
            Discover peers eager to mentor you on skills you need for your career, hobbies, or side projects.
          </p>
        </div>

        <div className="card feature-card">
          <div className="feature-icon-wrapper" style={{ color: "var(--primary)" }}>
            ⚡
          </div>
          <h3>3. Smart AI Matching</h3>
          <p>
            Our bipartite compatibility algorithm automatically surfaces the most complementary skill partners for you.
          </p>
        </div>

        <div className="card feature-card">
          <div className="feature-icon-wrapper" style={{ color: "var(--status-pending)" }}>
            📡
          </div>
          <h3>4. Direct Connection Channels</h3>
          <p>
            Propose swaps with direct Google Meet, Discord, Zoom, or WhatsApp channels for seamless live barter sessions.
          </p>
        </div>
      </div>
    </Page>
  );
}

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/auth/login", form);

      Object.entries(response.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      showToast("Welcome back! Logged in successfully.", "success");
      navigate("/explore");
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Invalid credentials. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <div className="form-card">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>
          Sign In to SkillSwap
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
          Access your barter network, manage swap requests, and connect with peers.
        </p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Create one free
          </Link>
        </p>
      </div>
    </Page>
  );
}

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: ""
  });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/auth/register", form);

      Object.entries(response.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      showToast("Account created successfully! Welcome to SkillSwap.", "success");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Registration failed. Try a different email.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <div className="form-card">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>
          Join SkillSwap
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
          Start swapping skills with members around the world today.
        </p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              placeholder="e.g. Alex Rivera"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Bio / Focus
              <span className="form-label-helper">What are your main areas of interest?</span>
            </label>
            <textarea
              placeholder="e.g. Software developer learning UI design and piano."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Sign In
          </Link>
        </p>
      </div>
    </Page>
  );
}

function Profile() {
  const userId = localStorage.getItem("userId");
  const { showToast } = useToast();

  const [user, setUser] = useState({});
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [userSkills, setUserSkills] = useState([]);

  // Add Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillType, setNewSkillType] = useState("TEACH");
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Fetch user details
    api.get(`/users/${userId}`).then((response) => {
      setUser(response.data);
      setName(response.data.name || "");
      setBio(response.data.bio || "");
    });

    // Fetch user's skills
    loadUserSkills();
  }, [userId]);

  const loadUserSkills = () => {
    api.get(`/skills/user/${userId}`)
      .then((res) => setUserSkills(res.data || []))
      .catch((err) => console.error(err));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      const response = await api.put(`/users/${userId}`, {
        name,
        bio
      });
      setUser(response.data);
      localStorage.setItem("name", response.data.name);
      showToast("Profile details updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Could not update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const skillClean = newSkillName.trim();
    if (!skillClean) return;

    try {
      setAddingSkill(true);

      // 1. Create or ensure skill exists
      const skillRes = await api.post("/skills", {
        name: skillClean,
        category: "General"
      });

      // 2. Attach skill to user
      await api.post(`/skills/user/${userId}`, {
        skillId: skillRes.data.id,
        type: newSkillType
      });

      showToast(`Added "${skillClean}" to your ${newSkillType} skills!`, "success");
      setNewSkillName("");
      loadUserSkills();
    } catch (error) {
      console.error(error);
      showToast("Could not add skill.", "error");
    } finally {
      setAddingSkill(false);
    }
  };

  const teachSkills = userSkills.filter((s) => s.type === "TEACH");
  const learnSkills = userSkills.filter((s) => s.type === "LEARN");

  return (
    <Page>
      <div className="page-header">
        <h1 className="page-title">My Account & Skills</h1>
        <p className="page-subtitle">
          Manage your personal details and configure the skills you can teach and want to learn.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {/* Profile Info Form */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>
            Personal Details
          </h2>

          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                value={user.email || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Background</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Skill Manager */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>
            My Skills & Learning Goals
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
            These skills power our AI matching algorithm to find your perfect barter partners.
          </p>

          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newSkillName}
                placeholder="e.g. Python, Guitar, UI Design..."
                required
                onChange={(e) => setNewSkillName(e.target.value)}
              />
              <select
                value={newSkillType}
                onChange={(e) => setNewSkillType(e.target.value)}
                style={{ width: 140 }}
              >
                <option value="TEACH">🟢 Can Teach</option>
                <option value="LEARN">🔵 Want to Learn</option>
              </select>
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                disabled={addingSkill}
              >
                + Add
              </button>
            </div>
          </form>

          {/* Current Skills Lists */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--bg-subtle)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-teach)", marginBottom: 6 }}>
                🟢 SKILLS I CAN TEACH ({teachSkills.length})
              </div>
              <div className="skill-chips-row">
                {teachSkills.length > 0 ? (
                  teachSkills.map((s) => (
                    <span key={s.id} className="skill-chip teach">
                      {s.skill?.name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>
                    No teach skills added yet. Add one above!
                  </span>
                )}
              </div>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-learn)", marginBottom: 6 }}>
                🔵 SKILLS I WANT TO LEARN ({learnSkills.length})
              </div>
              <div className="skill-chips-row">
                {learnSkills.length > 0 ? (
                  learnSkills.map((s) => (
                    <span key={s.id} className="skill-chip learn">
                      {s.skill?.name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>
                    No learning goals added yet. Add one above!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/explore" element={<Page><ExploreSkills /></Page>} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/requests" element={<Page><SwapRequests /></Page>} />
      <Route path="/swaps" element={<Page><MySwaps /></Page>} />
      <Route path="/user/:id" element={<Page><UserProfile /></Page>} />
    </Routes>
  );
}