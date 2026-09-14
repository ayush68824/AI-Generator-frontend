const API_URL = "http://localhost:4000/api";

async function generateLayout(prompt) {
  const response = await fetch(`${API_URL}/generate`, {
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
  const response = await fetch(`${API_URL}/save`, {
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
