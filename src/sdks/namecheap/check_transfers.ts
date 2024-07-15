// listtype=all&page=1&pagesize=10
import { nameCheapBaseUrl } from ".";
import SXTJ from "simple-xml-to-json";

export const checkTransfers = async () => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.transfer.getlist&listtype=all&page=1&pagesize=10`;
  const response = await fetch(apiUrl);

  if (!response.ok){
    const errorMessage = await response.text();
    console.error("Error:", errorMessage);
    throw Error("API request failed");
  }
  // console.log(await response.text());
  const myJson = JSON.stringify(SXTJ.convertXML(await response.text()), null, 2);
  console.log(myJson)
};

await checkTransfers()
