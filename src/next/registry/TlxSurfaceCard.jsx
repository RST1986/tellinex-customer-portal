// Governed copy from RST1986/tellinex-frontend/ui-registry/src/components/TlxSurfaceCard.jsx
// Source blob: ad7a3f6187dd56c43637172dcf6b32bb11be59f8
// Authority: TXS / Quiet Instrument. Do not replace directly from an external marketplace.
import React from "react";

export function TlxSurfaceCard({ title, description, children, className = "", ...props }) {
  return (
    <section
      className={className}
      style={{
        background: "var(--tlx-surface)",
        border: "1px solid var(--tlx-border)",
        borderRadius: "var(--tlx-radius-md)",
        padding: "var(--tlx-space-6)",
        color: "var(--tlx-text)",
      }}
      {...props}
    >
      {title ? <h3 style={{ margin: 0 }}>{title}</h3> : null}
      {description ? (
        <p style={{ margin: "8px 0 0", color: "var(--tlx-muted)" }}>{description}</p>
      ) : null}
      {children ? <div style={{ marginTop: title || description ? 16 : 0 }}>{children}</div> : null}
    </section>
  );
}
