import React from "react";

const STATUS_STYLES = {
  neutral: {
    background: "var(--tlx-status-neutral-bg)",
    color: "var(--tlx-status-neutral-text)",
    borderColor: "var(--tlx-status-neutral-border)",
  },
  info: {
    background: "var(--tlx-status-info-bg)",
    color: "var(--tlx-status-info-text)",
    borderColor: "var(--tlx-status-info-border)",
  },
  success: {
    background: "var(--tlx-status-success-bg)",
    color: "var(--tlx-status-success-text)",
    borderColor: "var(--tlx-status-success-border)",
  },
  warning: {
    background: "var(--tlx-status-warning-bg)",
    color: "var(--tlx-status-warning-text)",
    borderColor: "var(--tlx-status-warning-border)",
  },
  danger: {
    background: "var(--tlx-status-danger-bg)",
    color: "var(--tlx-status-danger-text)",
    borderColor: "var(--tlx-status-danger-border)",
  },
};

export function TlxStatusBadge({ tone = "neutral", children, className = "", style, ...props }) {
  const toneStyle = STATUS_STYLES[tone] ?? STATUS_STYLES.neutral;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 24,
        padding: "2px 8px",
        borderRadius: "var(--tlx-radius-pill)",
        border: "1px solid",
        fontFamily: "var(--tlx-font-sans)",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
        ...toneStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
