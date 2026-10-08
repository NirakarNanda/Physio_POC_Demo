import { contextBridge } from "electron";

// Minimal, locked-down bridge. The UI talks to the backend over HTTP on the
// local loopback server; nothing else needs exposing.
contextBridge.exposeInMainWorld("movewell", {
  platform: process.platform,
  version: "0.1.0",
});
