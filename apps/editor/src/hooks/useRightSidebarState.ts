import { useState } from "react";
import type { AssetsView } from "../components/inspector/MaterialAssetsDrawer";

export interface RightSidebarState {
  isExporting: boolean;
  setIsExporting: (val: boolean) => void;
  isPublishing: boolean;
  setIsPublishing: (val: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  activeTab: "export" | "share";
  setActiveTab: (val: "export" | "share") => void;
  isCopied: boolean;
  setIsCopied: (val: boolean) => void;
  activeSidebarTab: "objects" | "assets";
  setActiveSidebarTab: (val: "objects" | "assets") => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isShapeDropdownOpen: boolean;
  setIsShapeDropdownOpen: (val: boolean) => void;
  collapsibleStates: Record<string, boolean>;
  toggleCollapsible: (section: string) => void;
  /**
   * The Material Assets drawer beside the right sidebar: closed (null), its list, or the Material
   * Builder for one material. Here, so the Materials panel on the right and the Assets tab on the
   * left open the same drawer, and it stays open while nothing is selected.
   */
  assetsView: AssetsView | null;
  setAssetsView: (view: AssetsView | null) => void;
}

export function useRightSidebarState(): RightSidebarState {
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "share">("export");
  const [isCopied, setIsCopied] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"objects" | "assets">("objects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState(false);
  const [assetsView, setAssetsView] = useState<AssetsView | null>(null);

  const [collapsibleStates, setCollapsibleStates] = useState<Record<string, boolean>>({
    frame: true,
    scene: true,
    globalSettings: true,
  });

  const toggleCollapsible = (section: string) => {
    setCollapsibleStates((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return {
    isExporting,
    setIsExporting,
    isPublishing,
    setIsPublishing,
    isModalOpen,
    setIsModalOpen,
    activeTab,
    setActiveTab,
    isCopied,
    setIsCopied,
    activeSidebarTab,
    setActiveSidebarTab,
    searchQuery,
    setSearchQuery,
    isShapeDropdownOpen,
    setIsShapeDropdownOpen,
    collapsibleStates,
    toggleCollapsible,
    assetsView,
    setAssetsView,
  };
}
