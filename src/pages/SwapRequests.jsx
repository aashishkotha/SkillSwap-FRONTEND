import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SwapCard from "../components/SwapCard";
import { useToast } from "../context/ToastContext";

function SwapRequests() {
  const userId = localStorage.getItem("userId");
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/swaps/incoming/${userId}`);
      setRequests(response.data || []);
    } catch (error) {
      console.error("REQUEST ERROR:", error);
      showToast("Unable to load incoming swap requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const otherRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Incoming Swap Requests</h1>
            <p className="page-subtitle">
              Review barter invitations from members who want to learn from you and teach you in return.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadRequests}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📬</div>
          <h3>No incoming requests yet</h3>
          <p>When someone discovers your profile and requests a skill swap, it will appear right here.</p>
          <Link to="/explore" className="btn btn-primary">
            Explore Potential Partners
          </Link>
        </div>
      ) : (
        <div>
          {pendingRequests.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Action Needed</span>
                <span className="nav-badge">{pendingRequests.length}</span>
              </h2>
              <div className="grid">
                {pendingRequests.map((request) => (
                  <SwapCard
                    key={request.id}
                    swap={request}
                    currentUserId={userId}
                    onRefresh={loadRequests}
                  />
                ))}
              </div>
            </div>
          )}

          {otherRequests.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>
                Past / Handled Requests ({otherRequests.length})
              </h2>
              <div className="grid">
                {otherRequests.map((request) => (
                  <SwapCard
                    key={request.id}
                    swap={request}
                    currentUserId={userId}
                    onRefresh={loadRequests}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SwapRequests;