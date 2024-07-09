import { sleep } from "~/utils/sleep";
import { runBashCommands } from "../helpers/run_bash_command";

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
  console.log("About to enable IPV6: ", host);
  await runBashCommands({
    host,
    port,
    username,
    password,
    bashCommands: ["sudo enable_ipv6", "sudo reboot"],
  });
  console.log("Done. Sleeping for 1 minute.", host);
  await sleep(60 * 1000);
  console.log("I'm back", host);
}

