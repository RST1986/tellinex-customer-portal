import React from "react";

export function TlxEmptyState({ title, description, action, className = "", style, ...props }) {
  return (
    <section
      className={className}
      style={{
        display: "grid",
        justifyItems: "start",
        gap: "var(--tlx-space-3)",
        padding: "var(--tlx-space-6)",
        background: "var(--tlx-surface)",
        color: "var(--tlx-text)",
        border: "1px solid var(--tlx-border)",
        borderRadius: "var(--tlx-radius-md)",
        fontFamily: "var(--tlx-font-sans)",
        ...style,
      }}
      {...props}
    >
      <div
        aria-hidden="true"
        style={{
          width: 28,
          height: 3,
          borderRadius: "var(--tlx-radius-pill)",
          background: "var(--tlx-primary)",
        }}
      />
      <div style={{ display: "grid", gap: "var(--tlx-space-2)" }}>
        <strong style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 600 }}>{title}</strong>
        {description ? (
          <span style={{ color: "var(--tlx-muted)", fontSize: 14, lineHeight: 1.5, maxWidth: 560 }}>{description}</span>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
