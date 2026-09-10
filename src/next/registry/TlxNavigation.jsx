import React from "react";

export function TlxNavigation({
  brand,
  items = [],
  activeId,
  onNavigate,
  layout = "bar",
  ariaLabel = "Primary",
  className = "",
  contentClassName = "",
  style,
  contentStyle,
  ...props
}) {
  const dock = layout === "dock";

  return (
    <nav
      aria-label={ariaLabel}
      className={className}
      style={{
        display: dock ? "block" : "flex",
        alignItems: dock ? undefined : "center",
        justifyContent: dock ? undefined : "space-between",
        gap: dock ? undefined : "var(--tlx-space-4)",
        minHeight: dock ? undefined : 64,
        padding: dock ? 0 : "0 var(--tlx-space-4)",
        background: "var(--tlx-bg)",
        borderBottom: dock ? 0 : "1px solid var(--tlx-border)",
        borderTop: dock ? "1px solid var(--tlx-border)" : 0,
        fontFamily: "var(--tlx-font-sans)",
        position: dock ? "sticky" : undefined,
        bottom: dock ? 0 : undefined,
        zIndex: dock ? 10 : undefined,
        ...style,
      }}
      {...props}
    >
      {!dock && brand ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--tlx-space-3)" }}>{brand}</div>
      ) : null}
      <div
        className={contentClassName}
        style={{
          display: dock ? "grid" : "flex",
          gridTemplateColumns: dock ? `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` : undefined,
          alignItems: "center",
          gap: dock ? "var(--tlx-space-1)" : "var(--tlx-space-2)",
          overflowX: dock ? undefined : "auto",
          width: dock ? "100%" : undefined,
          paddingTop: dock ? 10 : undefined,
          paddingBottom: dock ? 10 : undefined,
          ...contentStyle,
        }}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              aria-label={item.ariaLabel}
              disabled={item.disabled}
              onClick={() => onNavigate?.(item.id)}
              style={{
                border: 0,
                borderBottom: dock ? 0 : active ? "2px solid var(--tlx-primary)" : "2px solid transparent",
                borderRadius: dock ? "var(--tlx-radius-md)" : 0,
                background: dock && active ? "var(--tlx-surface-2)" : "transparent",
                color: active ? "var(--tlx-text)" : "var(--tlx-muted)",
                padding: dock ? "10px 6px" : "18px 10px 16px",
                font: "inherit",
                fontSize: dock ? 11 : 14,
                fontWeight: dock ? 700 : active ? 600 : 500,
                cursor: item.disabled ? "default" : "pointer",
                opacity: item.disabled ? 0.55 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
