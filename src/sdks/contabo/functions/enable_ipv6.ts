import { sleep } from "~/utils/sleep";
import { runBashCommands } from "../helpers/run_bash_command";
import { consoleLog } from "~/utils/console_log";

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
  // consoleLog("About to enable IPV6: ", host);
  // try {
  //   await runBashCommands({
  //     host,
  //     port,
  //     username,
  //     password,
  //     bashCommands: ["sudo enable_ipv6", "sudo reboot"],
  //   });
  // } catch (e) {
  //   console.log("IPV6 ERROR");
  // }
  // consoleLog("Done. Sleeping for 1 minute.", host);
  // await sleep(60 * 1000);
  // consoleLog("I'm back", host);
}
