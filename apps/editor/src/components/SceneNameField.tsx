import { useState } from "react";

import { ApiAuthError } from "../utils/apiFetch";
import { renameScene } from "../utils/sceneLibrary";

interface SceneNameFieldProps {
  sceneId: string;
  initialName: string;
}

/*
 * BLOCK: SceneNameField (React Component)
 * PURPOSE: The scene's name in the editor header; click it to rename. Enter or clicking away saves,
 *          Escape cancels. The name lives on the scene's row, so this never touches the document.
 */
export function SceneNameField({ sceneId, initialName }: SceneNameFieldProps) {
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState<string | null>(null);

  const commit = async () => {
    const nextName = draft?.trim();
    setDraft(null);

    if (!nextName || nextName === name) {
      return;
    }

    const previousName = name;
    setName(nextName);

    try {
      const renamed = await renameScene(sceneId, nextName);
      setName(renamed.name);
    } catch (error) {
      console.error("Failed to rename the scene.", error);
      setName(previousName);
      window.alert(error instanceof ApiAuthError ? error.message : "The scene could not be renamed. Try again.");
    }
  };

  if (draft !== null) {
    return (
      <input
        className="left-sidebar-header-title scene-name-input"
        aria-label="Scene name"
        value={draft}
        maxLength={120}
        autoFocus
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            setDraft(null);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="left-sidebar-header-title scene-name-button"
      title={`${name} (click to rename)`}
      onClick={() => setDraft(name)}
    >
      {name}
    </button>
  );
}
