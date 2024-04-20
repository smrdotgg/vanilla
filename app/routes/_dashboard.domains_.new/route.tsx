import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import x from "simple-xml-to-json";
import { ApiResponse } from "./types";
import { processApiResponse } from "./gpttype";
import { env } from "~/api";

export const loader = async (args: LoaderFunctionArgs) => {
  const data = await fetch(
    `${env.NAMECHEAP_API_URL}xml.response?ApiUser=semeretereffe&ApiKey=2c2027ed94444b078b99a280720258c7&UserName=semeretereffe&ClientIp=185.183.34.180&Command=namecheap.domains.check&DomainList=fightingcrime.com,sjdaflkjaskldfjklsadjfiosadjfklasjdkfljsadkl.com`,
  );
  const myXMLString = await data.text();
  const response = x.convertXML(myXMLString) as ApiResponse;
  if (response.ApiResponse.Status !== "OK") throw Error();
  const coreData = processApiResponse(
    JSON.stringify(x.convertXML(myXMLString)),
  );
  return coreData.CommandResponse?.DomainCheckResults;
};

export { Page as default };
export const action = async (args: ActionFunctionArgs) => {
  const formData = await args.request.formData();
  console.log(formData.get("search"));
  return null;
};
