import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SwapCard from "../components/SwapCard";
import { useToast } from "../context/ToastContext";

function MySwaps() {
  const userId = localStorage.getItem("userId");
  const { showToast } = useToast();
  const [swaps, setSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadSwaps = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/swaps/user/${userId}`);
      setSwaps(response.data || []);
    } catch (error) {
      console.error(error);
      showToast("Unable to load swaps.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps();
  }, [userId]);

  const counts = useMemo(() => {
    return {
      all: swaps.length,
      pending: swaps.filter((s) => s.status === "PENDING").length,
      accepted: swaps.filter((s) => s.status === "ACCEPTED").length,
      completed: swaps.filter((s) => s.status === "COMPLETED").length,
    };
  }, [swaps]);

  const filteredSwaps = useMemo(() => {
    if (activeTab === "pending") return swaps.filter((s) => s.status === "PENDING");
    if (activeTab === "accepted") return swaps.filter((s) => s.status === "ACCEPTED");
    if (activeTab === "completed") return swaps.filter((s) => s.status === "COMPLETED");
    return swaps;
  }, [swaps, activeTab]);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">My Swaps Dashboard</h1>
            <p className="page-subtitle">
              Monitor active exchanges, access connection channels, and track completed learning milestones.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadSwaps}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Exchanges <span className="tab-count">{counts.all}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          🟢 Active / Connected <span className="tab-count">{counts.accepted}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending <span className="tab-count">{counts.pending}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          ✓ Completed <span className="tab-count">{counts.completed}</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading your swaps...</p>
        </div>
      ) : filteredSwaps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔄</div>
          <h3>
            {activeTab === "all"
              ? "No skill swaps initiated yet"
              : `No ${activeTab} swaps`}
          </h3>
          <p>
            {activeTab === "all"
              ? "Browse community members and propose your first barter exchange to start learning."
              : `There are currently no swaps with status "${activeTab}".`}
          </p>
          {activeTab === "all" && (
            <Link to="/explore" className="btn btn-primary">
              Find a Partner
            </Link>
          )}
        </div>
      ) : (
        <div className="grid">
          {filteredSwaps.map((swap) => (
            <SwapCard
              key={swap.id}
              swap={swap}
              currentUserId={userId}
              onRefresh={loadSwaps}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MySwaps;