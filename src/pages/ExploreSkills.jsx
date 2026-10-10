import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ExploreSkills() {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [userSkillsMap, setUserSkillsMap] = useState({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'matched', 'high'
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/users");
      const filtered = userRes.data.filter(
        (u) => Number(u.id) !== Number(userId)
      );
      setUsers(filtered);

      // Load AI match data if logged in
      if (userId) {
        try {
          const matchRes = await api.get(`/matching/users/${userId}`);
          setMatches(matchRes.data || []);
        } catch (err) {
          console.error("Match error:", err);
        }
      }

      // Fetch user skills for rich chip previews
      const skillsMap = {};
      await Promise.all(
        filtered.map(async (u) => {
          try {
            const res = await api.get(`/skills/user/${u.id}`);
            skillsMap[u.id] = res.data;
          } catch {
            skillsMap[u.id] = [];
          }
        })
      );
      setUserSkillsMap(skillsMap);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMatch = (id) => {
    return matches.find((m) => Number(m.userId) === Number(id));
  };

  // Filtered users
  const displayedUsers = useMemo(() => {
    return users.filter((user) => {
      const match = getMatch(user.id);
      const userSkills = userSkillsMap[user.id] || [];
      const skillNames = userSkills.map((s) => s.skill?.name?.toLowerCase() || "").join(" ");

      const matchesSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(search.toLowerCase())) ||
        skillNames.includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === "matched") {
        return !!match && match.matchScore > 0;
      }
      if (filterType === "high") {
        return !!match && match.matchScore >= 50;
      }
      return true;
    });
  }, [users, search, filterType, matches, userSkillsMap]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Explore Skill Partners</h1>
        <p className="page-subtitle">
          Connect with peers to barter knowledge, collaborate on skills, and grow without spending money.
        </p>
      </div>

      {/* Dynamic Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            value={search}
            placeholder="Search by name, bio, or skill (e.g. Python, Design)..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${filterType === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterType("all")}
          >
            All Partners ({users.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterType === "matched" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterType("matched")}
          >
            AI Matches ({matches.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterType === "high" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterType("high")}
          >
            High Compatibility (≥50%)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text-muted)" }}>Finding skill partners...</p>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No matching skill partners found</h3>
          <p>Try adjusting your search query or switching filters to see more members.</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch("");
              setFilterType("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {displayedUsers.map((user) => {
            const match = getMatch(user.id);
            const userSkills = userSkillsMap[user.id] || [];
            const teachSkills = userSkills.filter((s) => s.type === "TEACH");
            const learnSkills = userSkills.filter((s) => s.type === "LEARN");

            return (
              <div className="card" key={user.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="brand-icon" style={{ width: 40, height: 40, fontSize: "1.1rem" }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{user.name}</h2>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Active Member</span>
                      </div>
                    </div>

                    {match ? (
                      <span className="match-badge-pro">
                        ⚡ {match.matchScore}% Match
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", padding: "4px 8px", background: "var(--bg-subtle)", borderRadius: "var(--radius-full)" }}>
                        Open to Swap
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 14 }}>
                    {user.bio || "Open to learning and teaching skills with motivated peers."}
                  </p>

                  {match && (
                    <div className="match-reason-box">
                      <strong>AI Match Insight:</strong> {match.reason}
                    </div>
                  )}

                  {/* Skills tags preview */}
                  {(teachSkills.length > 0 || learnSkills.length > 0) && (
                    <div style={{ margin: "12px 0" }}>
                      {teachSkills.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-teach)", fontWeight: 700 }}>TEACHES: </span>
                          <span style={{ fontSize: "0.82rem" }}>
                            {teachSkills.map((s) => s.skill?.name).join(", ")}
                          </span>
                        </div>
                      )}
                      {learnSkills.length > 0 && (
                        <div>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-learn)", fontWeight: 700 }}>WANTS TO LEARN: </span>
                          <span style={{ fontSize: "0.82rem" }}>
                            {learnSkills.map((s) => s.skill?.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Link
                    to={`/user/${user.id}`}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    View Profile & Propose Swap
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExploreSkills;