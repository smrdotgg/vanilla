import { HTTPResponse, launch, Locator } from "puppeteer";

export async function setIpv6ReverseDNS({
  devMode = { headless: false, slowMo: undefined },
  username,
  password,
  ipv6,
  targetUrl,
  timeout = 25000,
}: {
  devMode?: { headless: boolean; slowMo: number | undefined };
  username: string;
  password: string;
  ipv6: string;
  targetUrl: string;
  timeout?: number;
}) {
  const browser = await launch(devMode);
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);

  {
    const targetPage = page;
    await targetPage.setViewport({
      width: 1460,
      height: 551,
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
          x: 41.5625,
          y: 4.214263916015625,
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
    await targetPage.keyboard.down("Control");
  }
  {
    const targetPage = page;
    await targetPage.keyboard.up("Control");
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
      targetPage.locator("::-p-aria(Reverse DNS Management)"),
      targetPage.locator("li:nth-of-type(19) > a"),
      targetPage.locator(
        '::-p-xpath(//*[@id=\\"mainmenu\\"]/div[2]/ul/li[19]/a)'
      ),
      targetPage.locator(":scope >>> li:nth-of-type(19) > a"),
      targetPage.locator("::-p-text(Reverse DNS Management)"),
    ])
      .setTimeout(timeout)
      .on("action", () => startWaitingForEvents())
      .click({
        offset: {
          x: 114.7142639160156,
          y: 5.964263916015625,
        },
      });
    await Promise.all(promises);
  }
  {
    console.log(`Running script to find and click on row with IPV6: ${ipv6}`);
    await page.$$eval(
      "tr",
      (rows, ipv6) => {
        console.log(`Processing table rows to match IPV6: ${ipv6}`);
        const targetRow = rows.find((row) =>
          [...row.cells].some((cell) => {
            const cellText = cell.textContent ?? "";
            console.log(`Checking cell with content: ${cellText}`);
            return cellText.includes(ipv6);
          })
        );
        if (targetRow) {
          console.log("Target row found, processing...");
          const lastTd = targetRow.cells[targetRow.cells.length - 1];
          const lastAnchor =
            lastTd.querySelectorAll("a")[
              lastTd.querySelectorAll("a").length - 1
            ];
          const img = lastAnchor.querySelector("img");
          if (img) {
            console.log("Image found, clicking...");
            img.click();
          } else {
            console.log("NO IMG FOUND");
          }
        } else {
          console.log(`No matching row found for IPV6: ${ipv6}`);
        }
      },
      ipv6
    );
  }

  {
    const targetPage = page;
    await Locator.race([
      targetPage.locator(
        '::-p-aria(Update PTR record information) >>>> ::-p-aria([role=\\"textbox\\"])'
      ),
      targetPage.locator("#ptr"),
      targetPage.locator('::-p-xpath(//*[@id=\\"ptr\\"])'),
      targetPage.locator(":scope >>> #ptr"),
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 184.92852783203125,
          y: 4.48211669921875,
        },
      });
  }
  {
    const targetPage = page;
    await targetPage.keyboard.down("Control");
  }
  {
    const targetPage = page;
    await targetPage.keyboard.down("a");
  }
  {
    const targetPage = page;
    await targetPage.keyboard.up("a");
  }
  {
    const targetPage = page;
    await targetPage.keyboard.up("Control");
  }

  {
    const targetPage = page;
    await Locator.race([
      targetPage.locator(
        '::-p-aria(Update PTR record information) >>>> ::-p-aria([role=\\"textbox\\"])'
      ),
      targetPage.locator("#ptr"),
      targetPage.locator('::-p-xpath(//*[@id=\\"ptr\\"])'),
      targetPage.locator(":scope >>> #ptr"),
    ])
      .setTimeout(timeout)
      .fill(targetUrl);
  }
  {
    const targetPage = page;
    await Locator.race([
      targetPage.locator(
        '::-p-aria(Save) >>>> ::-p-aria([role=\\"generic\\"])'
      ),
      targetPage.locator("button.ui-state-hover > span"),
      targetPage.locator(
        "::-p-xpath(/html/body/div[6]/div[3]/div/button[1]/span)"
      ),
      targetPage.locator(":scope >>> button.ui-state-hover > span"),
      targetPage.locator("::-p-text(Save)"),
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 36.99102783203125,
          y: 10.116058349609375,
        },
      });
  }

  await browser.close();
}

export {};
