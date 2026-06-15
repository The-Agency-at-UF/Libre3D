import { useEditorStore } from "../store/useEditorStore";

export interface ExportModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  activeTab: "export" | "share";
  setActiveTab: (tab: "export" | "share") => void;
  isExporting: boolean;
  isPublishing: boolean;
  shareUrl: string | null;
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
  handleExportAsset: () => Promise<void>;
  handleExportJson: () => void;
  handlePublishLink: () => Promise<void>;
}

export function ExportModal({
  isModalOpen,
  setIsModalOpen,
  activeTab,
  setActiveTab,
  isExporting,
  isPublishing,
  shareUrl,
  isCopied,
  setIsCopied,
  handleExportAsset,
  handleExportJson,
  handlePublishLink,
}: ExportModalProps) {
  const currentPublishId = useEditorStore((state) => state.currentPublishId);

  if (!isModalOpen) return null;

  return (
    <div className="editor-modal-backdrop" role="presentation" onClick={() => setIsModalOpen(false)}>
      <section
        className="editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${activeTab === "export" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("export")}
          >
            Export Asset
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "share" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("share")}
          >
            Share Scene
          </button>
        </div>

        {activeTab === "export" ? (
          <div className="modal-tab-content">
            <h2 className="editor-modal-title" id="modal-dialog-title">
              Export Scene Options
            </h2>
            <p className="editor-modal-copy">
              Download the current scene locally as a standard 3D asset or save its configuration data.
            </p>
            <div className="modal-export-actions">
              <button
                className="editor-action editor-action--primary"
                type="button"
                onClick={handleExportAsset}
                disabled={isExporting}
              >
                {isExporting ? "Exporting GLB..." : "Download 3D Asset (.glb)"}
              </button>
              <button
                className="editor-action"
                type="button"
                onClick={handleExportJson}
              >
                Download Scene Config (.json)
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-tab-content">
            <h2 className="editor-modal-title" id="modal-dialog-title">
              Publish to the Cloud
            </h2>
            <p className="editor-modal-copy">
              Upload your scene to generate a shareable, interactive public view page.
            </p>
            <div className="modal-share-actions">
              <button
                className="editor-action editor-action--publish"
                type="button"
                onClick={handlePublishLink}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : currentPublishId ? "Update Published Scene" : "Publish Scene to Cloud"}
              </button>

              {shareUrl ? (
                <div className="share-url-container">
                  <input
                    className="share-url-input"
                    type="text"
                    readOnly
                    value={shareUrl}
                  />
                  <button
                    className="editor-action copy-btn"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl)
                        .then(() => {
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        })
                        .catch((err) => {
                          console.error("Failed to copy", err);
                        });
                    }}
                  >
                    {isCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="editor-modal-actions">
          <button
            className="editor-action"
            type="button"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
