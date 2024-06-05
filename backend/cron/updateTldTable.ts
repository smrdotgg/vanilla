/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "~/db/prisma";
import SXTJ from "simple-xml-to-json";
import { env } from "~/api";


export async function updateDomainPricesOnDatabase() {
  await prisma.tld_price_info.deleteMany();
  await prisma.tld_yearly_price_info.deleteMany();
  await insertDomainMainData();
  await insertDomainPricingData();
  return;
}
async function insertDomainMainData() {
  const url = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIP=${env.CLIENT_IP}&Command=namecheap.domains.gettldlist`;

  const response = await fetch(url);
  const cachedResponseText = await response.text();
  console.log("Raw Response Text length: ", cachedResponseText.length);

  const responseText = JSON.parse(JSON.stringify(cachedResponseText));
  console.log("Parsed Response Text length: ", responseText.length);

  const tldListReal = JSON.parse(JSON.stringify(SXTJ.convertXML(responseText)));
  console.log(
    "Converted XML to JSON keys: ",
    Object.keys(tldListReal["ApiResponse"]),
  );

  const errorChildren = tldListReal.ApiResponse.children.find((el: any) => {
    return el.Errors != undefined;
  });
  console.log("Found ErrorResponse: ", !!errorChildren);
  console.log("Found ErrorResponse: ", errorChildren);
  const children = tldListReal.ApiResponse.children.find((el: any) => {
    return el.CommandResponse != undefined;
  });
  console.log("Found CommandResponse: ", !!children);

  const parsed = children?.CommandResponse?.children[0].Tlds.children
    .filter(
      (datum: any) =>
        datum.Tld.IsApiRenewable === "true" &&
        datum.Tld.IsApiRegisterable === "true" &&
        datum.Tld.IsApiTransferable === "true",
    )
    .map((datum: any) => ({
      name: datum.Tld.Name,
      min_registration_year_count: Number(datum.Tld.MinRegisterYears),
    }));
  console.log("Number of valid TLDs parsed: ", parsed?.length || 0);

  if (parsed && parsed.length > 0) {
    await prisma.tld_price_info.createMany({ data: parsed });
    console.log(
      "Data inserted into database: Number of entries - ",
      parsed.length,
    );
  } else {
    console.log("No data to insert into the database");
  }
  return;
}
async function insertDomainPricingData() {
  const url = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIP=${env.CLIENT_IP}&Command=namecheap.users.getPricing&ProductType=DOMAIN`;

  const response = await fetch(url);
  const cachedResponseText = await response.text();
  console.log("Raw Response Text length: ", cachedResponseText.length);

  const responseText = JSON.parse(JSON.stringify(cachedResponseText));
  console.log("Parsed Response Text length: ", responseText.length);

  const pricingReal = JSON.parse(JSON.stringify(SXTJ.convertXML(responseText)));
  console.log("Converted XML to JSON keys: ", Object.keys(pricingReal));

  const x = pricingReal.ApiResponse.children.find((el: any) => {
    return el.CommandResponse != undefined;
  });
  console.log("Found CommandResponse: ", !!x);

  const productList =
    x.CommandResponse.children[0].UserGetPricingResult.children[0].ProductType.children.find(
      (pt: any) => pt.ProductCategory.Name === "register",
    ).ProductCategory.children;
  console.log("Number of products found: ", productList.length);

  for (const product of productList) {
    const productData = product.Product;
    const productName = productData.Name;

    const x = await prisma.tld_price_info.findFirst({
      where: { name: productName },
    });

    console.log("Processing product: ", productName);
    if (x === null) {
      console.log("Product not found in the database, skipping: ", productName);
      continue;
    }

    const dataList: { duration: number; yourPrice: number }[] = [];
    for (const priceObject of productData.children) {
      dataList.push({
        duration: Number(priceObject.Price.Duration),
        yourPrice: (priceObject.PricingType === "ABSOLUTE") ? Number(priceObject.Price.YourPrice) : Number(priceObject.Price.YourPrice) * Number(priceObject.Price.Duration),
      });
    }
    console.log("Number of price points for product: ", dataList.length);

    const errors = [];
    try {
      await prisma.tld_yearly_price_info.createMany({
        data: dataList.map((d) => ({
          year: d.duration,
          price: d.yourPrice,
          tld_price_id: x.id,
        })),
      })
    } catch (e) {
      errors.push(...dataList);
    }

    if (errors.length > 0) {
      console.error("Errors occurred while inserting data: ", JSON.stringify(errors.length, null, 2));
    } else {
      console.log("Data inserted successfully for product: ", productName);
    }
  }
  return;
}

