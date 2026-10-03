/**
 * Application Entry Point
 * 
 * Locates the HTML container `#root`, initializes the React runtime environment,
 * and mounts the top-level <App /> component into the DOM.
 */
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { initTheme } from "./utils/theme";
import "./styles/index.css";

initTheme();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);