function apiBase() {
  let base = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  base = base.replace(/\/+$/, "");

  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }

  return base;
}

async function generateLayout(prompt) {
  const response = await fetch(`${apiBase()}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not generate the section.");
  }

  return data.layout;
}

async function saveLayout(layout) {
  const response = await fetch(`${apiBase()}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ layout })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not save changes.");
  }

  return data;
}

export { generateLayout, saveLayout };
