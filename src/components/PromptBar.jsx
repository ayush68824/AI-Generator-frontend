function UncodyMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 6v11.2c0 4.4 3.6 8 8 8s8-3.6 8-8V6"
        stroke="#3B6BFF"
        strokeWidth="6.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PromptBar({
  prompt,
  setPrompt,
  onGenerate,
  onSave,
  onHome,
  isGenerating,
  isSaving
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onGenerate();
  }

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={onHome} aria-label="Home">
        <UncodyMark />
        <span>Uncody</span>
      </button>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder='Try "pricing", "hero", or "features"'
          aria-label="Section prompt"
        />
        <button className="generate-button" type="submit" disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </form>

      <button
        className="save-button"
        type="button"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </header>
  );
}

export default PromptBar;
