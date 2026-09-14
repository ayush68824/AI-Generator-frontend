import { useEffect, useRef, useState } from "react";

function normalizeUrl(value) {
  const href = (value || "").trim();

  if (!href) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return href;
  }

  return `https://${href}`;
}

function textStyle(node) {
  const format = node.format || {};

  return {
    color: format.color || undefined
  };
}

function formatClassName(node) {
  const format = node.format || {};

  return [
    "editable-text",
    format.bold ? "is-bold" : "",
    format.italic ? "is-italic" : "",
    format.href ? "is-link" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function FormatToolbar({ position, node, onChange }) {
  const format = node.format || {};
  const colorInputRef = useRef(null);
  const [linkOpen, setLinkOpen] = useState(Boolean(format.href));
  const [linkValue, setLinkValue] = useState(format.href || "https://");

  useEffect(() => {
    setLinkValue(format.href || "https://");
    setLinkOpen(false);
  }, [node.id]);

  if (!position) {
    return null;
  }

  function patchFormat(next) {
    onChange(node.id, {
      format: { ...format, ...next }
    });
  }

  function applyLink(event) {
    event.preventDefault();
    const href = normalizeUrl(linkValue);

    if (!href) {
      const { href: _ignored, ...rest } = format;
      onChange(node.id, { format: rest });
      setLinkOpen(false);
      return;
    }

    patchFormat({ href });
    setLinkOpen(false);
  }

  function removeLink() {
    const { href: _ignored, ...rest } = format;
    onChange(node.id, { format: rest });
    setLinkValue("https://");
    setLinkOpen(false);
  }

  return (
    <div
      className={`format-toolbar ${linkOpen ? "is-expanded" : ""}`}
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => {
        if (event.target.closest("input")) {
          return;
        }

        event.preventDefault();
      }}
    >
      <div className="format-toolbar-row">
        <button
          className={format.bold ? "is-active" : ""}
          type="button"
          onClick={() => patchFormat({ bold: !format.bold })}
          aria-label="Bold"
        >
          B
        </button>
        <button
          className={`italic-btn ${format.italic ? "is-active" : ""}`}
          type="button"
          onClick={() => patchFormat({ italic: !format.italic })}
          aria-label="Italic"
        >
          I
        </button>
        <button
          className={format.href || linkOpen ? "is-active" : ""}
          type="button"
          onClick={() => setLinkOpen((open) => !open)}
          aria-label="Add link"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M6.4 9.6a3.2 3.2 0 0 1 0-4.5l1.8-1.8a3.2 3.2 0 1 1 4.5 4.5L11.4 9a.8.8 0 0 1-1.1-1.1l.3-1.3a1.6 1.6 0 1 0-2.3-2.3L7.5 6.2a1.6 1.6 0 0 0 0 2.3.8.8 0 1 1-1.1 1.1Zm3.2-3.2a3.2 3.2 0 0 1 0 4.5l-1.8 1.8a3.2 3.2 0 1 1-4.5-4.5L4.6 7a.8.8 0 1 1 1.1 1.1L4.4 9.4a1.6 1.6 0 1 0 2.3 2.3l1.8-1.8a1.6 1.6 0 0 0 0-2.3.8.8 0 1 1 1.1-1.1Z"
            />
          </svg>
          <span className="caret">▾</span>
        </button>
        <button
          className="color-btn"
          type="button"
          onClick={() => colorInputRef.current?.click()}
          aria-label="Text color"
        >
          <span
            className="color-swatch"
            style={{
            background: format.color
              ? format.color
              : "conic-gradient(#3b6bff, #22c55e, #6366f1, #3b6bff)"
            }}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={format.color || "#111827"}
            onChange={(event) => patchFormat({ color: event.target.value })}
          />
        </button>
      </div>

      {linkOpen && (
        <form className="link-editor" onSubmit={applyLink}>
          <input
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://example.com"
            aria-label="Link URL"
            autoFocus
          />
          <button type="submit">Apply</button>
          {format.href && (
            <button type="button" onClick={removeLink}>
              Remove
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function SelectionFrame({ children, selected }) {
  return (
    <span className={`selection-frame ${selected ? "is-selected" : ""}`}>
      {children}
      {selected && (
        <>
          <i className="handle nw" />
          <i className="handle ne" />
          <i className="handle sw" />
          <i className="handle se" />
          <i className="handle n" />
          <i className="handle s" />
          <i className="handle e" />
          <i className="handle w" />
        </>
      )}
    </span>
  );
}

function EditableText({ node, onChange, selected, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (document.activeElement !== ref.current) {
      ref.current.textContent = node.text || "";
    }
  }, [node.text, node.id]);

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.focus();
    }
  }, [selected]);

  return (
    <SelectionFrame selected={selected}>
      <span
        ref={ref}
        className={formatClassName(node)}
        style={textStyle(node)}
        contentEditable={selected}
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        title={node.format?.href ? `Link: ${node.format.href} (Ctrl+click to open)` : "Click to edit"}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();

          if ((event.metaKey || event.ctrlKey) && node.format?.href) {
            window.open(normalizeUrl(node.format.href), "_blank", "noopener,noreferrer");
            return;
          }

          onSelect(node.id, event.currentTarget);
        }}
        onInput={(event) => onChange(node.id, { text: event.currentTarget.textContent || "" })}
        onKeyDown={(event) => {
          if (event.key === "Enter" && node.type !== "paragraph") {
            event.preventDefault();
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            event.currentTarget.blur();
          }
        }}
      />
    </SelectionFrame>
  );
}

function EditablePrice({ node, onChange, selected, onSelect }) {
  return (
    <div className="price">
      <strong className="price-amount">
        <EditableText
          node={{ ...node, id: `${node.id}-amount`, text: node.amount, type: "heading" }}
          selected={selected === `${node.id}-amount`}
          onSelect={onSelect}
          onChange={(_id, patch) => onChange(node.id, { amount: patch.text })}
        />
      </strong>
      <span className="price-period">
        <EditableText
          node={{ ...node, id: `${node.id}-period`, text: node.period, type: "heading" }}
          selected={selected === `${node.id}-period`}
          onSelect={onSelect}
          onChange={(_id, patch) => onChange(node.id, { period: patch.text })}
        />
      </span>
    </div>
  );
}

function renderChildren(node, props) {
  return (node.children || []).map((child) => (
    <RenderNode key={child.id} node={child} {...props} />
  ));
}

function containsId(node, id) {
  if (!node || !id) {
    return false;
  }

  if (node.id === id || id.startsWith(`${node.id}-`)) {
    return true;
  }

  return (node.children || []).some((child) => containsId(child, id));
}

function cardClassName(node, selectedId) {
  const base = (node.className || "").replace(/\bfeatured\b/g, "").trim();
  const active = containsId(node, selectedId);
  return [base, active ? "featured" : ""].filter(Boolean).join(" ");
}

function RenderNode({ node, ...props }) {
  const className = node.className || "";
  const { onNodeChange, selectedId, onSelect } = props;

  switch (node.type) {
    case "page":
      return <>{renderChildren(node, props)}</>;

    case "section":
      return (
        <section className={className}>
          {renderChildren(node, props)}
        </section>
      );

    case "container":
      return (
        <div className={className}>
          {renderChildren(node, props)}
        </div>
      );

    case "heading": {
      const Tag = `h${node.level || 2}`;

      return (
        <Tag className={className}>
          <EditableText
            node={node}
            selected={selectedId === node.id}
            onSelect={onSelect}
            onChange={onNodeChange}
          />
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p className={className}>
          <EditableText
            node={node}
            selected={selectedId === node.id}
            onSelect={onSelect}
            onChange={onNodeChange}
          />
        </p>
      );

    case "price":
      return (
        <EditablePrice
          node={node}
          selected={selectedId}
          onSelect={onSelect}
          onChange={onNodeChange}
        />
      );

    case "list":
      return <ul>{renderChildren(node, props)}</ul>;

    case "listItem":
      return (
        <li>
          <EditableText
            node={node}
            selected={selectedId === node.id}
            onSelect={onSelect}
            onChange={onNodeChange}
          />
        </li>
      );

    case "card":
      return (
        <article className={cardClassName(node, selectedId)}>
          {renderChildren(node, props)}
        </article>
      );

    case "button":
      return (
        <button
          className={`content-button ${className}`}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
        >
          <EditableText
            node={node}
            selected={selectedId === node.id}
            onSelect={onSelect}
            onChange={onNodeChange}
          />
        </button>
      );

    default:
      return null;
  }
}

function findNode(node, id) {
  if (!node) {
    return null;
  }

  if (node.id === id) {
    return node;
  }

  for (const child of node.children || []) {
    const match = findNode(child, id);
    if (match) {
      return match;
    }
  }

  return null;
}

function Renderer({ layout, onNodeChange, onExample }) {
  const canvasRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [toolbarPos, setToolbarPos] = useState(null);

  function placeToolbar(element) {
    const canvas = canvasRef.current;

    if (!element || !canvas) {
      setToolbarPos(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    setToolbarPos({
      top: rect.top - canvasRect.top - 52,
      left: rect.left - canvasRect.left + rect.width / 2
    });
  }

  function handleSelect(id, element) {
    setSelectedId(id);
    placeToolbar(element);
  }

  useEffect(() => {
    function onPointerDown(event) {
      if (event.target.closest(".format-toolbar") || event.target.closest(".editable-text")) {
        return;
      }

      setSelectedId(null);
      setToolbarPos(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const selected = document.querySelector(".selection-frame.is-selected .editable-text");
    if (selected) {
      placeToolbar(selected);
    }
  }, [selectedId, layout]);

  if (!layout) {
    return (
      <div className="canvas" ref={canvasRef}>
        <section className="landing">
          <p className="eyebrow">Uncody</p>
          <h1>What do you want to build?</h1>
          <p className="landing-copy">
            Type a prompt in the bar above and press Generate. Click any text on
            the result to edit it, then save.
          </p>
          <div className="landing-grid">
            <button
              type="button"
              className="landing-card"
              onClick={() => onExample("Build a pricing section with 3 tiers")}
            >
              <h2>Pricing</h2>
              <p>Three plans with prices, feature lists, and buttons.</p>
              <p className="landing-hint">Build a pricing section with 3 tiers</p>
            </button>
            <button
              type="button"
              className="landing-card"
              onClick={() => onExample("Create a hero section")}
            >
              <h2>Hero</h2>
              <p>A headline, short copy, and two actions.</p>
              <p className="landing-hint">Create a hero section</p>
            </button>
            <button
              type="button"
              className="landing-card"
              onClick={() => onExample("Build a features section")}
            >
              <h2>Features</h2>
              <p>A heading plus three cards you can rewrite in place.</p>
              <p className="landing-hint">Build a features section</p>
            </button>
          </div>
        </section>
      </div>
    );
  }

  const selectedNode = findNode(layout, selectedId);

  return (
    <div className="canvas" ref={canvasRef}>
      {selectedNode && (
        <FormatToolbar
          position={toolbarPos}
          node={selectedNode}
          onChange={onNodeChange}
        />
      )}
      <RenderNode
        node={layout}
        onNodeChange={onNodeChange}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </div>
  );
}

export default Renderer;
