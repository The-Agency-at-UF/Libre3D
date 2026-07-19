import { useState } from "react";

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
  shareUrl: string | null;
  setShareUrl: (val: string | null) => void;
  activeSidebarTab: "objects" | "assets";
  setActiveSidebarTab: (val: "objects" | "assets") => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isShapeDropdownOpen: boolean;
  setIsShapeDropdownOpen: (val: boolean) => void;
  collapsibleStates: Record<string, boolean>;
  toggleCollapsible: (section: string) => void;
}

export function useRightSidebarState(initialPublishId: string | null): RightSidebarState {
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "share">("export");
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialPublishId ? `http://${window.location.host}/v/${initialPublishId}` : null
  );
  const [activeSidebarTab, setActiveSidebarTab] = useState<"objects" | "assets">("objects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState(false);

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
    shareUrl,
    setShareUrl,
    activeSidebarTab,
    setActiveSidebarTab,
    searchQuery,
    setSearchQuery,
    isShapeDropdownOpen,
    setIsShapeDropdownOpen,
    collapsibleStates,
    toggleCollapsible,
  };
}
