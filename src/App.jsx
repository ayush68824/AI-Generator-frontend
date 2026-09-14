import { useState } from "react";
import PromptBar from "./components/PromptBar";
import Renderer from "./components/Renderer";
import { generateLayout, saveLayout } from "./api";

function updateNode(node, id, patch) {
  if (node.id === id) {
    return { ...node, ...patch };
  }

  if (!node.children) {
    return node;
  }

  return {
    ...node,
    children: node.children.map((child) => updateNode(child, id, patch))
  };
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [layout, setLayout] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate(nextPrompt = prompt) {
    const value = nextPrompt.trim();

    if (!value) {
      return;
    }

    setPrompt(value);
    setIsGenerating(true);
    setMessage("");

    try {
      const nextLayout = await generateLayout(value);
      setLayout(nextLayout);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!layout) {
      setMessage("Generate a section before saving.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await saveLayout(layout);
      setMessage("Changes saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleNodeChange(id, patch) {
    setLayout((currentLayout) => {
      if (!currentLayout) {
        return currentLayout;
      }

      return updateNode(currentLayout, id, patch);
    });
  }

  return (
    <div className="app">
      <PromptBar
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={handleGenerate}
        onSave={handleSave}
        isGenerating={isGenerating}
        isSaving={isSaving}
      />

      <main className="workspace">
        {message && <div className="status-toast">{message}</div>}
        <Renderer
          layout={layout}
          onNodeChange={handleNodeChange}
          onExample={handleGenerate}
        />
      </main>
    </div>
  );
}

export default App;
