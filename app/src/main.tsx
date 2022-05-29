import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

import { configureAbly } from "@ably-labs/react-hooks";

function generateUuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const optionalClientId = generateUuid();
configureAbly({ authUrl: `/api/ably/token-request?clientId=${optionalClientId}`, clientId: optionalClientId });

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
