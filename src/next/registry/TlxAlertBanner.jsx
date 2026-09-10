import React from "react";

const TONE_STYLES = {
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

export function TlxAlertBanner({ tone = "info", title, children, action, className = "", style, ...props }) {
  const toneStyle = TONE_STYLES[tone] ?? TONE_STYLES.info;

  return (
    <section
      role={tone === "danger" ? "alert" : "status"}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: action ? "1fr auto" : "1fr",
        gap: "var(--tlx-space-3)",
        alignItems: "start",
        padding: "var(--tlx-space-4)",
        border: "1px solid",
        borderRadius: "var(--tlx-radius-md)",
        fontFamily: "var(--tlx-font-sans)",
        ...toneStyle,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: "grid", gap: "var(--tlx-space-1)" }}>
        {title ? <strong style={{ fontSize: 14, lineHeight: 1.4 }}>{title}</strong> : null}
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
