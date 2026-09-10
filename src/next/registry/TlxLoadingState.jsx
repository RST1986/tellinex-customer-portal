import React from "react";

export function TlxLoadingState({
  label = "Loading",
  detail,
  lines = 3,
  className = "",
  style,
  ...props
}) {
  const placeholderLines = Math.max(1, Math.min(Number(lines) || 3, 5));

  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={className}
      style={{
        display: "grid",
        gap: "var(--tlx-space-3)",
        padding: "var(--tlx-space-5)",
        background: "var(--tlx-surface)",
        color: "var(--tlx-text)",
        border: "1px solid var(--tlx-border)",
        borderRadius: "var(--tlx-radius-md)",
        fontFamily: "var(--tlx-font-sans)",
        ...style,
      }}
      {...props}
    >
      <div style={{ display: "grid", gap: "var(--tlx-space-1)" }}>
        <strong style={{ fontSize: 14, lineHeight: 1.4 }}>{label}</strong>
        {detail ? <span style={{ color: "var(--tlx-muted)", fontSize: 13, lineHeight: 1.5 }}>{detail}</span> : null}
      </div>
      <div aria-hidden="true" style={{ display: "grid", gap: "var(--tlx-space-2)" }}>
        {Array.from({ length: placeholderLines }, (_, index) => (
          <span
            key={index}
            style={{
              display: "block",
              width: index === placeholderLines - 1 ? "62%" : "100%",
              maxWidth: 520,
              height: 8,
              borderRadius: "var(--tlx-radius-pill)",
              background: "var(--tlx-surface-2)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
