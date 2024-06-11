/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeSSH } from "node-ssh";
import puppeteer from "puppeteer";

async function runBashCommands({
  host,
  username,
  port = 22,
  password,
  bashCommands,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
  bashCommands: string[];
}) {
  let retryCount = 0;
  const maxRetries = 6;
  const retryDelay = 20 * 1000; // 20 seconds

  while (retryCount <= maxRetries) {
    try {
      const ssh = new NodeSSH();
      await ssh.connect({
        host,
        port,
        username,
        password,
      });
      for (const bc of bashCommands) {
        const { code, signal, stderr, stdout } = await ssh.execCommand(bc);
        console.log("STDOUT");
        console.log(stdout);
      }
      ssh.dispose();
      return; // success, exit the retry loop
    } catch (e: any) {
      console.error("Error:", e);
      console.error("Error message:", e.message);
      console.error("Error stack:", e.stack);
      retryCount++;

      if (retryCount <= maxRetries) {
        console.log(
          `Retry ${retryCount} of ${maxRetries} in ${retryDelay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error("Maximum retries exceeded. Giving up.");
        break;
      }
    }
  }
}

export async function enableIpv6({
  host,
  username,
  password,
  port = 22,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
}) {
  console.log("Starting SSH connection to", host);
  await runBashCommands({
    host,
    port,
    username,
    password,
    bashCommands: ["enable_ipv6", "reboot"],
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function browserTest() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://developer.chrome.com/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type(".devsite-search-field", "automate beyond recorder");

  // Wait and click on first result
  const searchResultSelector = ".devsite-result-item-link";
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  // Locate the full title with a unique string
  const textSelector = await page.waitForSelector(
    "text/Customize and automate",
  );
  const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title
  console.log('The title of this blog post is "%s".', fullTitle);

  await browser.close();
}
