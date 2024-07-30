import { HTTPResponse, launch, Locator } from "puppeteer";
import { consoleError, consoleLog } from "~/utils/console_log";
import { prisma } from "~/utils/db";
import { env } from "~/utils/env";
import { sleep } from "~/utils/sleep";

export async function getReverseDNSTable({
  devMode = { headless: false, slowMo: undefined },
  timeout = 25000,
}: {
  devMode?: { headless: boolean; slowMo: number | undefined };
  timeout?: number;
}) {
  const username = env.CONTABO_ACCOUNT_USERNAME;
  const password = env.CONTABO_ACCOUNT_PASSWORD;
  try {
    const browser = await launch({
      ...devMode,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(timeout);

    {
      const targetPage = page;
      await targetPage.setViewport({
        width: 2178,
        height: 640,
      });
    }
    {
      const targetPage = page;
      const promises: Promise<HTTPResponse | null>[] = [];
      const startWaitingForEvents = () => {
        promises.push(targetPage.waitForNavigation());
      };
      startWaitingForEvents();
      await targetPage.goto("https://my.contabo.com/account/login");
      await Promise.all(promises);
    }
    {
      const targetPage = page;
      await Locator.race([
        targetPage.locator("#AccountUsername"),
        targetPage.locator('::-p-xpath(//*[@id=\\"AccountUsername\\"])'),
        targetPage.locator(":scope >>> #AccountUsername"),
      ])
        .setTimeout(timeout)
        .click({
          offset: {
            x: 33.41961669921875,
            y: 2.214263916015625,
          },
        });
    }
    {
      const targetPage = page;
      await Locator.race([
        targetPage.locator("#AccountUsername"),
        targetPage.locator('::-p-xpath(//*[@id=\\"AccountUsername\\"])'),
        targetPage.locator(":scope >>> #AccountUsername"),
      ])
        .setTimeout(timeout)
        .fill(username);
    }
    {
      const targetPage = page;
      await targetPage.keyboard.down("Tab");
    }
    {
      const targetPage = page;
      await targetPage.keyboard.up("Tab");
    }
    {
      const targetPage = page;
      await Locator.race([
        targetPage.locator("#AccountPassword"),
        targetPage.locator('::-p-xpath(//*[@id=\\"AccountPassword\\"])'),
        targetPage.locator(":scope >>> #AccountPassword"),
      ])
        .setTimeout(timeout)
        .fill(password);
    }
    {
      const targetPage = page;
      await targetPage.keyboard.down("Tab");
    }
    {
      const targetPage = page;
      await targetPage.keyboard.up("Tab");
    }
    {
      const targetPage = page;
      const promises: Promise<HTTPResponse | null>[] = [];
      // const startWaitingForEvents = () => {
      //   promises.push(targetPage.waitForNavigation());
      // };
      await targetPage.keyboard.down("Enter");
      await Promise.all(promises);
    }
    {
      const targetPage = page;
      await targetPage.keyboard.up("Enter");
    }

    {
      const targetPage = page;
      const promises: Promise<HTTPResponse | null>[] = [];
      const startWaitingForEvents = () => {
        promises.push(targetPage.waitForNavigation());
      };
      await Locator.race([
        targetPage.locator(
          '::-p-aria(Reverse DNS Management[role=\\"link\\"])'
        ),
        targetPage.locator("li:nth-of-type(19) > a"),
        targetPage.locator(
          '::-p-xpath(//*[@id=\\"mainmenu\\"]/div[2]/ul/li[19]/a)'
        ),
        targetPage.locator(":scope >>> li:nth-of-type(19) > a"),
      ])
        .setTimeout(timeout)
        .on("action", () => startWaitingForEvents())
        .click({
          offset: {
            x: 98.28570556640625,
            y: 7.9642333984375,
          },
        });
      await Promise.all(promises);
    }

    {
      const targetPage = page;
      const ipToDomainMap = await targetPage.evaluate(() => {
        return [...document.querySelectorAll("tr.d_even, tr.d_odd")].map(
          (row) => {
            const ip = row.children[1].innerHTML.toLowerCase();
            const domain = row.children[2].innerHTML.toLowerCase();
            return [ip, domain] as [string, string];
          }
        );
      });
      for (const [ip, domain] of ipToDomainMap) {
        await prisma.reverseDnsEntry.upsert({
          where: { from: ip },
          create: { from: ip, to: domain },
          update: { to: domain },
        });
      }
    }
    await browser.close();
  } catch (e) {
    consoleError("ERROR IN setReverseDNS", e);
  }
}
