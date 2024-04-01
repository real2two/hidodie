import { tunnel } from "cloudflared";
import { execSync } from "child_process";

main();

async function main() {
  // Opens a cloudflared tunnel
  const { url, child } = tunnel({
    "--url": `http://localhost:${process.env["VITE_PORT"]}`,
  });
  console.log("Cloudflared tunnel opened at:", await url);

  // Open URL
  const START_BROWSER = {
    darwin: "open",
    win32: "start",
  };
  execSync(`${START_BROWSER[process.platform] || "xdg-open"} ${await url}`);

  // Exit handler
  child.on("exit", (code) => {
    console.log("tunnel process exited with code", code);
    process.exit();
  });
}
