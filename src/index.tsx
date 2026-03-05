import React from "react";
import ReactDOM from "react-dom/client";
import { LoadApp } from "./LoadApp";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LoadApp>
      <App />
    </LoadApp>
  </React.StrictMode>
);