import { useState, useRef, useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const LockIcon = ({ locked }: { locked: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {locked ? (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ) : (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </>
    )}
  </svg>
);

interface HierarchyItemProps {
  entityId: string;
}

function HierarchyItem({ entityId }: HierarchyItemProps) {
  const entity = useEditorStore((state) =>
    state.entities.find((e) => e.id === entityId)
  );
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const toggleVisibility = useEditorStore((state) => state.toggleVisibility);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const renameEntity = useEditorStore((state) => state.renameEntity);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!entity) return null;

  const isSelected = entity.id === selectedEntityId;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entity.locked) return; // Cannot rename locked elements
    setEditName(entity.name);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const saveRename = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      renameEntity(entity.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`editor-tree-item${isSelected ? " editor-tree-item--selected" : ""}${entity.locked ? " editor-tree-item--locked" : ""}`}
      style={{ paddingLeft: "0.85rem" }}
    >
      <div className="editor-tree-main-row">
        {isEditing ? (
          <input
            ref={inputRef}
            className="hierarchy-rename-input"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button
            className="editor-tree-select"
            type="button"
            onClick={() => selectEntity(entity.id)}
            onDoubleClick={handleDoubleClick}
          >
            <span className="editor-tree-name">{entity.name}</span>
            <span className="editor-tree-type">{entity.type}</span>
          </button>
        )}

        <div className="hierarchy-item-actions">
          <button
            className={`hierarchy-action-btn${entity.visible ? "" : " inactive"}`}
            type="button"
            aria-label={entity.visible ? "Hide entity" : "Show entity"}
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(entity.id);
            }}
          >
            <EyeIcon visible={entity.visible} />
          </button>
          <button
            className={`hierarchy-action-btn${entity.locked ? " active-locked" : ""}`}
            type="button"
            aria-label={entity.locked ? "Unlock entity" : "Lock entity"}
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(entity.id);
            }}
          >
            <LockIcon locked={entity.locked} />
          </button>
          <button
            className="editor-tree-delete"
            type="button"
            aria-label={`Delete ${entity.name}`}
            disabled={entity.locked}
            onClick={(event) => {
              event.stopPropagation();
              removeEntity(entity.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export function HierarchyPanel({ searchQuery = "" }: { searchQuery?: string }) {
  const entities = useEditorStore((state) => state.entities) ?? [];
  const filtered = entities.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gap: "0.85rem" }}>
      <div className="editor-tree" aria-label="Scene hierarchy">
        {filtered.map((entity) => (
          <HierarchyItem key={entity.id} entityId={entity.id} />
        ))}
      </div>
    </div>
  );
}
