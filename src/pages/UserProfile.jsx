import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function UserProfile() {
  const { id } = useParams();
  const { showToast } = useToast();
  const senderId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [targetSkills, setTargetSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Form State
  const [skillOffered, setSkillOffered] = useState("");
  const [skillRequested, setSkillRequested] = useState("");
  const [contactMedium, setContactMedium] = useState("Google Meet");
  const [contactDetails, setContactDetails] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // 1. Fetch User Profile
    api.get(`/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    // 2. Fetch Target User's Skills
    api.get(`/skills/user/${id}`)
      .then((res) => setTargetSkills(res.data))
      .catch((err) => console.error(err));

    // 3. Fetch Sender's Skills (for quick selection)
    if (senderId) {
      api.get(`/skills/user/${senderId}`)
        .then((res) => setMySkills(res.data))
        .catch((err) => console.error(err));
    }

    // 4. Fetch Reviews
    api.get(`/reviews/${id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  }, [id, senderId]);

  const targetTeachSkills = targetSkills.filter((s) => s.type === "TEACH");
  const targetLearnSkills = targetSkills.filter((s) => s.type === "LEARN");
  const myTeachSkills = mySkills.filter((s) => s.type === "TEACH");

  const sendSwapRequest = async (event) => {
    event.preventDefault();

    if (!senderId) {
      showToast("Please log in to send a swap request.", "warning");
      return;
    }

    if (!skillOffered.trim() || !skillRequested.trim()) {
      showToast("Please specify both skills for the swap.", "warning");
      return;
    }

    if (!contactDetails.trim()) {
      showToast("Please provide contact details (link or handle) so your partner can connect with you.", "warning");
      return;
    }

    try {
      setSending(true);

      await api.post("/swaps", {
        senderId: Number(senderId),
        receiverId: Number(id),
        skillOffered: skillOffered.trim(),
        skillRequested: skillRequested.trim(),
        contactMedium: contactMedium,
        contactDetails: contactDetails.trim(),
        message: message.trim() || undefined
      });

      showToast("Swap request sent successfully! We included your connection medium.", "success");
      setSkillOffered("");
      setSkillRequested("");
      setContactDetails("");
      setMessage("");
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Unable to send swap request.",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/explore" style={{ fontSize: "0.88rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          ← Back to Explore
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="brand-icon" style={{ width: 56, height: 56, fontSize: "1.6rem" }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{user.name}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {user.bio || "Passionate about peer learning and knowledge sharing."}
            </p>
          </div>
        </div>

        {/* User Skills Display */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 20 }}>
          <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span className="barter-tag-label" style={{ color: "var(--accent-teach)" }}>
              Can Teach (Click to request)
            </span>
            <div className="skill-chips-row">
              {targetTeachSkills.length > 0 ? (
                targetTeachSkills.map((us) => (
                  <span
                    key={us.id}
                    className="skill-chip teach"
                    title="Click to request this skill"
                    onClick={() => setSkillRequested(us.skill?.name || "")}
                  >
                    🟢 {us.skill?.name}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>No teach skills listed yet</span>
              )}
            </div>
          </div>

          <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span className="barter-tag-label" style={{ color: "var(--accent-learn)" }}>
              Wants to Learn
            </span>
            <div className="skill-chips-row">
              {targetLearnSkills.length > 0 ? (
                targetLearnSkills.map((us) => (
                  <span
                    key={us.id}
                    className="skill-chip learn"
                    title="Click to offer this skill"
                    onClick={() => setSkillOffered(us.skill?.name || "")}
                  >
                    🔵 {us.skill?.name}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>No learning goals listed yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Form with Dynamic Contact Channel */}
      <div className="card">
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 6 }}>
          Propose a Skill Swap
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
          Define the knowledge exchange and choose how you'd like to meet (Google Meet, Discord, Zoom, etc.).
        </p>

        <form onSubmit={sendSwapRequest}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                Skill you will teach:
                {myTeachSkills.length > 0 && (
                  <span className="form-label-helper">Click chip below to pick</span>
                )}
              </label>
              <input
                value={skillOffered}
                placeholder="e.g. React, Python, UI Design"
                required
                onChange={(e) => setSkillOffered(e.target.value)}
              />
              {myTeachSkills.length > 0 && (
                <div className="skill-chips-row" style={{ marginTop: 4 }}>
                  {myTeachSkills.map((s) => (
                    <span
                      key={s.id}
                      className="skill-chip teach"
                      onClick={() => setSkillOffered(s.skill?.name || "")}
                    >
                      +{s.skill?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Skill you want to learn:
                {targetTeachSkills.length > 0 && (
                  <span className="form-label-helper">Pick from {user.name}'s teach list</span>
                )}
              </label>
              <input
                value={skillRequested}
                placeholder="e.g. Java, Video Editing, Guitar"
                required
                onChange={(e) => setSkillRequested(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Medium Selection (Fixes the communication flaw!) */}
          <div style={{ background: "var(--bg-subtle)", padding: 18, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", margin: "16px 0" }}>
            <h3 style={{ fontSize: "0.96rem", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span>📡</span> Connection Medium & Contact Channel
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 14 }}>
              Provide how your partner can get in touch with you once they review or accept your swap.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Platform / Medium</label>
                <select
                  value={contactMedium}
                  onChange={(e) => setContactMedium(e.target.value)}
                >
                  <option value="Google Meet">📹 Google Meet</option>
                  <option value="Discord">💬 Discord</option>
                  <option value="Zoom">💻 Zoom</option>
                  <option value="Email">✉️ Email</option>
                  <option value="WhatsApp">📱 WhatsApp</option>
                  <option value="Telegram">✈️ Telegram</option>
                  <option value="Phone">📞 Phone Call</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Link or Handle
                  <span className="form-label-helper">
                    {contactMedium === "Google Meet" || contactMedium === "Zoom"
                      ? "Enter room link (e.g. meet.google.com/xyz)"
                      : contactMedium === "Discord"
                      ? "Enter username (e.g. user#1234 or @user)"
                      : contactMedium === "WhatsApp" || contactMedium === "Phone"
                      ? "Enter phone number with country code"
                      : "Enter address or handle"}
                  </span>
                </label>
                <input
                  value={contactDetails}
                  placeholder={
                    contactMedium === "Google Meet"
                      ? "https://meet.google.com/abc-defg-hij"
                      : contactMedium === "Discord"
                      ? "username#1234"
                      : contactMedium === "Email"
                      ? "you@example.com"
                      : "Your contact handle or link"
                  }
                  required
                  onChange={(e) => setContactDetails(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Proposal Note / Availability (Optional)
              <span className="form-label-helper">Describe what you want to cover and when you are free</span>
            </label>
            <textarea
              value={message}
              placeholder="e.g. Hey, I'm free this weekend for 1 hour! Let's swap 30 mins of React fundamentals for 30 mins of Spring Boot."
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? "Sending Request..." : "Send Swap Request 🚀"}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Partner Reviews ({reviews.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: "var(--bg-subtle)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <strong>{r.reviewer?.name}</strong>
                  <span style={{ color: "#f59e0b" }}>{"★".repeat(r.rating || 5)}</span>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;