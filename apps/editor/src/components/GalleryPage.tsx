import { useEffect, useMemo, useState } from "react";

import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Link } from "./ui/Link";
import { Menu } from "./ui/Menu";
import { NavItem } from "./ui/NavItem";
import { SearchField } from "./ui/SearchField";
import { SidebarLayout } from "./ui/SidebarLayout";

import { useStoredChoice } from "../hooks/useStoredChoice";

import { signOut } from "../utils/authSession";
import { HOME_PATH, navigate } from "../utils/navigation";
import { createScene, listScenes, type SceneSummary } from "../utils/sceneLibrary";
import { toggleTheme } from "../utils/theme";

interface GalleryPageProps {
  accountEmail: string | null;
}

type GalleryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; scenes: SceneSummary[] };

const SORT_ORDERS = ["modified", "name"] as const;
const VIEW_MODES = ["grid", "list"] as const;

type SortOrder = (typeof SORT_ORDERS)[number];
type ViewMode = (typeof VIEW_MODES)[number];

/*
 * BLOCK: GalleryPage (React Component)
 * PURPOSE: The signed-in home at `/scenes`, laid out like a file browser: a sidebar (account menu,
 *          search, sections), a header bar with "New scene", a sort/view toolbar, and the user's
 *          scenes as cards that open the editor. Reads scenes only through utils/sceneLibrary.ts.
 */
export function GalleryPage({ accountEmail }: GalleryPageProps) {
  const [gallery, setGallery] = useState<GalleryState>({ status: "loading" });
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useStoredChoice<SortOrder>("libre3d-gallery-sort", SORT_ORDERS, "modified");
  const [viewMode, setViewMode] = useStoredChoice<ViewMode>("libre3d-gallery-view", VIEW_MODES, "grid");

  useEffect(() => {
    // Ignore a response that arrives after the page was left.
    let active = true;

    listScenes()
      .then((scenes) => {
        if (active) {
          setGallery({ status: "ready", scenes });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Failed to load scenes.", error);
          setGallery({ status: "error", message: "Your scenes could not be loaded. Check the console for details." });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const allScenes = gallery.status === "ready" ? gallery.scenes : [];

  const visibleScenes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matching = query ? allScenes.filter((scene) => scene.name.toLowerCase().includes(query)) : [...allScenes];

    return sortOrder === "name"
      ? matching.sort((a, b) => a.name.localeCompare(b.name))
      : matching.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [allScenes, searchQuery, sortOrder]);

  const handleNewScene = async () => {
    setIsCreating(true);

    try {
      const { sceneId } = await createScene();
      navigate(`/edit/${encodeURIComponent(sceneId)}`);
    } catch (error) {
      console.error("Failed to create a scene.", error);
      window.alert("The scene could not be created. Check the console for details.");
      setIsCreating(false);
    }
  };

  const sidebar = (
    <>
      <AccountMenu email={accountEmail} />
      <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search scenes" />
      <nav className="gallery-nav" aria-label="Sections">
        <NavItem href={HOME_PATH} icon="layout-grid" isActive>
          All scenes
        </NavItem>
      </nav>
    </>
  );

  const headerActions = (
    <Button variant="primary" onClick={handleNewScene} disabled={isCreating}>
      <i className="ti ti-plus" aria-hidden="true" />
      {isCreating ? "Creating…" : "New scene"}
    </Button>
  );

  return (
    <SidebarLayout sidebar={sidebar} title="All scenes" headerActions={headerActions}>
      {gallery.status === "loading" && <p className="page-message">Loading your scenes…</p>}

      {gallery.status === "error" && <p className="page-message page-message--error">{gallery.message}</p>}

      {gallery.status === "ready" && allScenes.length === 0 && (
        <div className="gallery-empty">
          <i className="ti ti-cube gallery-empty-icon" aria-hidden="true" />
          <h2 className="gallery-empty-title">No scenes yet</h2>
          <p className="page-message">Select New scene to start building. Your scenes will appear here.</p>
        </div>
      )}

      {allScenes.length > 0 && (
        <>
          <div className="gallery-toolbar">
            <select
              className="ui-select"
              value={sortOrder}
              aria-label="Sort scenes"
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="modified">Last modified</option>
              <option value="name">Name</option>
            </select>
            <div className="gallery-view-toggle" role="group" aria-label="View">
              <Button
                variant="ghost"
                className="ui-button--icon"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <i className="ti ti-layout-grid" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                className="ui-button--icon"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <i className="ti ti-list" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {visibleScenes.length === 0 ? (
            <p className="page-message">No scenes match “{searchQuery.trim()}”.</p>
          ) : (
            <ul className={`gallery-grid${viewMode === "list" ? " gallery-grid--list" : ""}`}>
              {visibleScenes.map((scene) => (
                <li key={scene.sceneId}>
                  <SceneCard scene={scene} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </SidebarLayout>
  );
}

function AccountMenu({ email }: { email: string | null }) {
  const name = email?.split("@")[0] || "Account";

  return (
    <Menu
      label="Account menu"
      trigger={
        <span className="gallery-account">
          <Avatar name={name} />
          <span className="gallery-account-name">{name}</span>
          <i className="ti ti-chevron-down" aria-hidden="true" />
        </span>
      }
      header={email}
      items={[
        { label: "Switch theme", icon: "contrast", onSelect: toggleTheme },
        { label: "Sign out", icon: "logout", onSelect: () => void signOut() },
      ]}
    />
  );
}

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

// "Edited 11 hours ago", "Edited yesterday", like a file browser.
const formatEdited = (iso: string): string => {
  const secondsAgo = (Date.parse(iso) - Date.now()) / 1000;

  for (const [unit, unitSeconds] of RELATIVE_TIME_UNITS) {
    if (Math.abs(secondsAgo) >= unitSeconds) {
      return `Edited ${relativeTimeFormat.format(Math.round(secondsAgo / unitSeconds), unit)}`;
    }
  }

  return "Edited just now";
};

function SceneCard({ scene }: { scene: SceneSummary }) {
  return (
    <Link className="gallery-card" href={`/edit/${encodeURIComponent(scene.sceneId)}`}>
      <div className="gallery-card-thumb">
        {scene.thumbnailUrl ? (
          <img className="gallery-card-image" src={scene.thumbnailUrl} alt="" />
        ) : (
          <i className="ti ti-cube" aria-hidden="true" />
        )}
      </div>
      <div className="gallery-card-footer">
        <span className="gallery-card-icon" aria-hidden="true">
          <i className="ti ti-cube" />
        </span>
        <span className="gallery-card-text">
          <span className="gallery-card-name">{scene.name}</span>
          <span className="gallery-card-meta" title={new Date(scene.updatedAt).toLocaleString()}>
            {formatEdited(scene.updatedAt)}
          </span>
        </span>
      </div>
    </Link>
  );
}
