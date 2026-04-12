import React from 'react';

function SummaryCard({ aiSummary, summaryLoading, onClose, chatOpen }) {
    return (
        <div style={{
            position: "fixed",
            top: "20px",
            right: chatOpen ? "320px" : "20px",
            zIndex: 9999,
            width: "320px",
            maxHeight: "80vh",
            overflowY: "auto",
            background: "#111820",
            borderRadius: "10px",
            border: "1px solid #1a3a3a",
            padding: "12px 16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ color: "#2ad7c6", fontSize: "14px", fontWeight: "600" }}>
                    Meeting Catch-up
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                        background: "#2ad7c615",
                        border: "1px solid #2ad7c630",
                        borderRadius: "4px",
                        padding: "1px 6px",
                        fontSize: "10px",
                        color: "#2ad7c6"
                    }}>AI</span>
                    <button onClick={onClose} style={{
                        color: "#ffffff",
                        background: "#2a2a2a",
                        border: "1px solid #444",
                        borderRadius: "50%",
                        cursor: "pointer",
                        fontSize: "16px",
                        lineHeight: 1,
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0
                    }}>×</button>
                </div>
            </div>

            {summaryLoading ? (
                <div style={{ color: "#888", fontSize: "13px", padding: "8px 0" }}>
                    Analyzing meeting...
                </div>
            ) : aiSummary?.error ? (
                <div style={{ color: "#fe4242", fontSize: "12px" }}>Could not generate summary.</div>
            ) : aiSummary ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Overview */}
                    {aiSummary.summary && (
                        <div>
                            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Overview</p>
                            <p style={{ fontSize: "13px", color: "#ccc", margin: 0, lineHeight: "1.7" }}>
                                {aiSummary.summary}
                            </p>
                        </div>
                    )}

                    <div style={{ borderTop: "1px solid #1a3a3a" }} />

                    {/* Topics */}
                    {aiSummary.topics?.length > 0 && (
                        <div>
                            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Topics</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {aiSummary.topics.map((t, i) => (
                                    <span key={i} style={{
                                        background: "#1a2d2d", color: "#2ad7c6",
                                        borderRadius: "20px", padding: "3px 10px", fontSize: "12px"
                                    }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Items */}
                    {aiSummary.actionItems?.length > 0 && (
                        <div>
                            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Action Items</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {aiSummary.actionItems.map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                        <div style={{
                                            width: "22px", height: "22px", borderRadius: "50%",
                                            background: "#1a2d2d", color: "#2ad7c6",
                                            fontSize: "10px", display: "flex", alignItems: "center",
                                            justifyContent: "center", flexShrink: 0, marginTop: "1px"
                                        }}>
                                            {item.person?.[0]?.toUpperCase() || "T"}
                                        </div>
                                        <div>
                                            <span style={{ fontSize: "12px", color: "#2ad7c6" }}>{item.person}</span>
                                            <span style={{ fontSize: "12px", color: "#999" }}> — {item.task}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deadlines */}
                    {aiSummary.deadlines?.length > 0 && (
                        <div>
                            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Deadlines</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {aiSummary.deadlines.map((d, i) => (
                                    <div key={i} style={{
                                        fontSize: "12px", color: "#ccc",
                                        borderLeft: "2px solid #f0a500", paddingLeft: "8px"
                                    }}>{d}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {aiSummary.suggestions?.length > 0 && (
                        <div>
                            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Suggestions</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {aiSummary.suggestions.map((s, i) => (
                                    <div key={i} style={{
                                        fontSize: "12px", color: "#ccc",
                                        borderLeft: "2px solid #2ad7c640", paddingLeft: "8px"
                                    }}>{s}</div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            ) : null}
        </div>
    );
}

export default SummaryCard;