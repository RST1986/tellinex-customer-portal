// Governed copy from RST1986/tellinex-frontend/ui-registry/src/components/TlxButton.jsx
// Source blob: 6482e2f7db8e1d62ca6172bee1b344bef0929605
// Authority: TXS / Quiet Instrument. Do not replace from 21st.dev directly.
import React from "react";

export function TlxButton({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: {
      background: "var(--tlx-primary)",
      color: "var(--tlx-primary-contrast)",
      border: "1px solid transparent",
    },
    secondary: {
      background: "var(--tlx-surface)",
      color: "var(--tlx-text)",
      border: "1px solid var(--tlx-border)",
    },
    danger: {
      background: "transparent",
      color: "var(--tlx-danger)",
      border: "1px solid var(--tlx-danger)",
    },
  };

  return (
    <button
      className={className}
      style={{
        padding: "10px 14px",
        borderRadius: "var(--tlx-radius-sm)",
        cursor: props.disabled ? "default" : "pointer",
        fontWeight: 600,
        fontSize: 14,
        opacity: props.disabled ? 0.6 : 1,
        ...styles[variant],
      }}
      {...props}
    />
  );
}
