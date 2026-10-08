import { app, BrowserWindow, Menu, dialog, utilityProcess } from "electron";
import fs from "fs";
import net from "net";
import path from "path";

// --dev → run against the normal web dev setup (backend/dist + frontend/out
// built locally). Packaged builds resolve under process.resourcesPath.
const isDev = process.argv.includes("--dev");

function pickPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      srv.close(() => resolve(port));
    });
  });
}

function resolvePaths(): { serverEntry: string; staticDir: string } {
  if (isDev) {
    return {
      serverEntry: path.join(__dirname, "..", "..", "backend", "dist", "index.js"),
      staticDir: path.join(__dirname, "..", "..", "frontend", "out"),
    };
  }
  return {
    serverEntry: path.join(process.resourcesPath, "server", "index.js"),
    staticDir: path.join(process.resourcesPath, "client"),
  };
}

async function waitForHealth(port: number, timeoutMs = 20000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) return true;
    } catch {
      /* backend not up yet — retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

let backend: Electron.UtilityProcess | null = null;
let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  const port = await pickPort();
  const { serverEntry, staticDir } = resolvePaths();

  if (!fs.existsSync(serverEntry)) {
    dialog.showErrorBox(
      "MoveWell Studio",
      `Clinic server bundle not found:\n${serverEntry}\n\nPlease reinstall the app.`
    );
    app.quit();
    return;
  }

  // The Express backend runs hidden inside the app; data lives in the OS
  // user-data folder. Fully offline — no internet required.
  backend = utilityProcess.fork(serverEntry, [], {
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "production",
      MOVEWELL_DATA_DIR: app.getPath("userData"),
      MOVEWELL_STATIC_DIR: staticDir,
    } as NodeJS.ProcessEnv,
  });
  backend.on("exit", (code) => {
    console.error(`[desktop] backend exited with code ${code}`);
  });

  const ok = await waitForHealth(port);
  if (!ok) {
    dialog.showErrorBox(
      "MoveWell Studio",
      "The local clinic server did not start.\n\nPlease reinstall the app or contact support."
    );
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: "MoveWell Studio",
    backgroundColor: "#f7f5ef",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(`http://127.0.0.1:${port}/`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Only one copy of the clinic app at a time (protects the local database).
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  void createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  try {
    backend?.kill();
  } catch {
    /* already gone */
  }
});
