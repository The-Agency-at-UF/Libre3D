/**
 * Application Entry Point
 * 
 * Locates the HTML container `#root`, initializes the React runtime environment,
 * and mounts the top-level <App /> component into the DOM.
 */
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { useEditorStore } from "./store/useEditorStore";
import "./styles/index.css";

// Dev-only console handle for manual smoke tests (per CLAUDE.md there is no
// test suite — store actions are exercised from the devtools console).
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__libre3dStore = useEditorStore;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);