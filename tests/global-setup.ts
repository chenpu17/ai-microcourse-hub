import { execSync } from "node:child_process";

async function globalSetup() {
  const cwd = process.cwd();

  execSync("npm run db:push", {
    cwd,
    stdio: "inherit"
  });

  execSync("npm run db:seed", {
    cwd,
    stdio: "inherit"
  });
}

export default globalSetup;
