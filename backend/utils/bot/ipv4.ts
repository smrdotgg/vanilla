import { HTTPResponse, launch, Locator } from "puppeteer";

export async function setIpv4ReverseDNS({
  devMode = { headless: false, slowMo: undefined },
  username,
  password,
  ipv4,
  targetUrl,
  timeout = 25000,
}: {
  devMode?: { headless: boolean; slowMo: number | undefined };
  username: string;
  password: string;
  ipv4: string;
  targetUrl: string;
  timeout?: number;
}) {
  const browser = await launch(devMode);
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
    const startWaitingForEvents = () => {
      promises.push(targetPage.waitForNavigation());
    };
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
        '::-p-xpath(//*[@id=\\"mainmenu\\"]/div[2]/ul/li[19]/a)',
      ),
      targetPage.locator(":scope >>> li:nth-of-type(19) > a"),
      targetPage.locator("::-p-text(Reverse DNS Management)"),
    ])
      .setTimeout(timeout)
      .on("action", () => startWaitingForEvents())
      .click({
        offset: {
          x: 111.5714111328125,
          y: 5.9642333984375,
        },
      });
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    await Locator.race([
      targetPage.locator(
        '::-p-aria(Add PTR-Record for an IPv6 address[role=\\"link\\"])',
      ),
      targetPage.locator("#create"),
      targetPage.locator('::-p-xpath(//*[@id=\\"create\\"])'),
      targetPage.locator(":scope >>> #create"),
      targetPage.locator("::-p-text(Add PTR-Record)"),
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 51.767822265625,
          y: 16.36602783203125,
        },
      });
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
    await targetPage.keyboard.down("Tab");
  }
  {
    const targetPage = page;
    await Locator.race([
      targetPage.locator("#ip"),
      targetPage.locator('::-p-xpath(//*[@id=\\"ip\\"])'),
      targetPage.locator(":scope >>> #ip"),
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 22.42852783203125,
          y: 11.41070556640625,
        },
      });
  }
  {
    const targetPage = page;
    await Locator.race([
      targetPage.locator("#ip"),
      targetPage.locator('::-p-xpath(//*[@id=\\"ip\\"])'),
      targetPage.locator(":scope >>> #ip"),
    ])
      .setTimeout(timeout)
      .fill(ipv4);
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
      targetPage.locator("#ptr"),
      targetPage.locator('::-p-xpath(//*[@id=\\"ptr\\"])'),
      targetPage.locator(":scope >>> #ptr"),
    ])
      .setTimeout(timeout)
      .fill(targetUrl);
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
    await targetPage.keyboard.down("Enter");
  }
  {
    const targetPage = page;
    await targetPage.keyboard.up("Enter");
  }

  await browser.close();
}

export {};
