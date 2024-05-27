import { db } from "./index.server";
import { TB_splitboxes } from "./schema.server";

async function main() {
  const userId = "jn9l71rtfyujg8zak8f5";
  const instances = [
    "201857592",
    "201882690",
    "201882727",
    "201882739",
    "201883308",
    "201883345",
  ];
  await db.insert(TB_splitboxes).values(
    instances.map((instance) => ({
      computeIdOnHostingPlatform: instance,
      userId,
      // name: "1",
      // id: "1",
    })),
  );
}
await main();
