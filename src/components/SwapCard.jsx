import React, { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function SwapCard({
  swap,
  currentUserId,
  onRefresh
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [receiverNote, setReceiverNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isReceiver = Number(swap.receiver?.id) === Number(currentUserId);
  const isSender = Number(swap.sender?.id) === Number(currentUserId);

  const acceptSwap = async () => {
    try {
      setActionLoading(true);
      await api.put(`/swaps/${swap.id}/accept`, {
        receiverNote: receiverNote.trim() || undefined
      });
      showToast("Swap accepted! Contact details are now connected.", "success");
      setShowAcceptModal(false);
      onRefresh();
    } catch (error) {
      console.error("ACCEPT ERROR:", error);
      showToast(
        error.response?.data?.message || "Could not accept swap.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const rejectSwap = async () => {
    try {
      setActionLoading(true);
      await api.put(`/swaps/${swap.id}/reject`);
      showToast("Swap request declined.", "info");
      onRefresh();
    } catch (error) {
      console.error("REJECT ERROR:", error);
      showToast("Could not reject swap.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const completeSwap = async () => {
    try {
      setActionLoading(true);
      await api.put(`/swaps/${swap.id}/complete`);
      showToast("Great job! Swap marked as completed.", "success");
      onRefresh();
    } catch (error) {
      console.error("COMPLETE ERROR:", error);
      showToast("Could not complete swap.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const copyContact = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Contact details copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getMediumIcon = (medium) => {
    const m = (medium || "").toLowerCase();
    if (m.includes("meet") || m.includes("google")) return "📹 Google Meet";
    if (m.includes("zoom")) return "💻 Zoom";
    if (m.includes("discord")) return "💬 Discord";
    if (m.includes("email")) return "✉️ Email";
    if (m.includes("whats")) return "📱 WhatsApp";
    if (m.includes("telegram")) return "✈️ Telegram";
    return "🔗 Contact";
  };

  const renderConnectAction = () => {
    if (!swap.contactDetails) return null;
    const details = swap.contactDetails.trim();
    const isUrl = details.startsWith("http://") || details.startsWith("https://");

    if (isUrl) {
      return (
        <a
          href={details}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Open Meeting Room ↗
        </a>
      );
    }

    if ((swap.contactMedium || "").toLowerCase().includes("email") || details.includes("@")) {
      return (
        <a
          href={`mailto:${details}?subject=SkillSwap: ${swap.skillOffered} for ${swap.skillRequested}`}
          className="btn btn-primary btn-sm"
        >
          Email Partner ✉
        </a>
      );
    }

    if ((swap.contactMedium || "").toLowerCase().includes("whatsapp")) {
      const cleanPhone = details.replace(/[^0-9]/g, "");
      return (
        <a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Message on WhatsApp 📱
        </a>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => copyContact(details)}
      >
        {copied ? "✓ Copied!" : `Copy ${swap.contactMedium || "Details"}`}
      </button>
    );
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {isSender ? "You sent to " : "Request from "}
            <strong style={{ color: "var(--text-main)" }}>
              {isSender ? swap.receiver?.name : swap.sender?.name}
            </strong>
          </div>
        </div>
        <span className={`status-badge ${(swap.status || "").toLowerCase()}`}>
          ● {swap.status}
        </span>
      </div>

      {/* Dynamic Barter Visual */}
      <div className="swap-barter-visual">
        <div className="barter-side">
          <span className="barter-tag-label">
            {isSender ? "You Teach" : `${swap.sender?.name || "Sender"} Teaches`}
          </span>
          <span className="barter-pill teach">
            🟢 {swap.skillOffered}
          </span>
        </div>

        <div className="barter-arrow">⇄</div>

        <div className="barter-side" style={{ textAlign: "right" }}>
          <span className="barter-tag-label">
            {isSender ? "You Learn" : `${swap.sender?.name || "Sender"} Learns`}
          </span>
          <span className="barter-pill learn">
            🔵 {swap.skillRequested}
          </span>
        </div>
      </div>

      {/* Proposal Message */}
      {swap.message && (
        <div className="proposal-message-quote">
          "{swap.message}"
        </div>
      )}

      {/* Contact Medium & Connection Channel */}
      {swap.contactDetails && (
        <div className="contact-channel-box">
          <div className="contact-channel-header">
            <span className="contact-medium-pill">
              {getMediumIcon(swap.contactMedium)}
            </span>
            {renderConnectAction()}
          </div>
          <div className="contact-details-val">
            {swap.contactDetails}
          </div>
        </div>
      )}

      {/* Receiver Note */}
      {swap.receiverNote && (
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 8 }}>
          <strong>Note from {swap.receiver?.name}:</strong> {swap.receiverNote}
        </div>
      )}

      {/* Action Buttons */}
      {isReceiver && swap.status === "PENDING" && (
        <div className="action-row">
          {!showAcceptModal ? (
            <>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => setShowAcceptModal(true)}
              >
                Accept Swap
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={rejectSwap}
                disabled={actionLoading}
              >
                Decline
              </button>
            </>
          ) : (
            <div style={{ width: "100%", marginTop: 8 }}>
              <input
                placeholder="Optional meeting link or note for partner..."
                value={receiverNote}
                onChange={(e) => setReceiverNote(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={acceptSwap}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Accepting..." : "Confirm & Accept"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {swap.status === "ACCEPTED" && (
        <div className="action-row">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={completeSwap}
            disabled={actionLoading}
          >
            ✓ Mark as Completed
          </button>
        </div>
      )}
    </div>
  );
}

export default SwapCard;