import { cpSync, existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = join(root, "apps", "web");
const standaloneWebRoot = join(webRoot, ".next", "standalone", "apps", "web");
const serverPath = join(standaloneWebRoot, "server.js");

if (!existsSync(serverPath)) {
  throw new Error("Standalone server is missing. Run `npm run build --workspace=@propertyvault/web` first.");
}

const staticSource = join(webRoot, ".next", "static");
const staticTarget = join(standaloneWebRoot, ".next", "static");
rmSync(staticTarget, { recursive: true, force: true });
cpSync(staticSource, staticTarget, { recursive: true });

const publicSource = join(webRoot, "public");
const publicTarget = join(standaloneWebRoot, "public");
if (existsSync(publicSource)) {
  rmSync(publicTarget, { recursive: true, force: true });
  cpSync(publicSource, publicTarget, { recursive: true });
}

const child = spawn(process.execPath, [serverPath], {
  cwd: root,
  env: {
    ...process.env,
    PORT: process.env.PORT ?? "3000",
    HOSTNAME: process.env.HOSTNAME ?? "127.0.0.1"
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
