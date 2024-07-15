/* eslint-disable @typescript-eslint/no-explicit-any */
import { Config as NodeSSHConfig, NodeSSH } from "node-ssh";
import { consoleLog } from "~/utils/console_log";

export async function runBashCommands(
  props: NodeSSHConfig & {
    bashCommands: string[];
    scriptMode?: boolean;
  },
) {
  let retryCount = 0;
  const maxRetries = 6;
  const retryDelay = 20 * 1000; // 20 seconds
  const responses: string[] = [];

  const bashCommands = props.bashCommands as string[];//.map(c => `sudo ${c}`);


  consoleLog("Starting to run bash commands");
  bashCommands.map((bc) => consoleLog(bc));
  while (retryCount <= maxRetries) {
    try {
      const ssh = new NodeSSH();
      consoleLog("Connecting via SSH");
      await ssh.connect(props);
      if (props.scriptMode) {
        await ssh.execCommand(`echo "#!/bin/bash" > script.sh `);
        for (const bc of bashCommands) {
          await ssh.execCommand(`echo "${bc}" >> script.sh `);
        }
        const { code, signal, stderr, stdout } =
          await ssh.execCommand(`bash ./script.sh`);
        consoleLog(
          `Command result - stdout: ${stdout}, stderr: ${stderr}, code: ${code}, signal: ${signal}`,
        );
        responses.push(stdout);
      } else {
        for (const bc of bashCommands) {
          consoleLog(`Executing command: ${bc}`);
          const { code, signal, stderr, stdout } = await ssh.execCommand(bc);
          consoleLog(
            `Command result - stdout: ${stdout}, stderr: ${stderr}, code: ${code}, signal: ${signal}`,
          );
          responses.push(stdout);
        }
      }
      ssh.dispose();
      consoleLog("SSH session disposed");
      return responses; // success, exit the retry loop
    } catch (e: any) {
      retryCount++;
      consoleLog(`Error encountered: ${e.message}`);

      if (retryCount <= maxRetries) {
        consoleLog(
          `Retry ${retryCount} of ${maxRetries} in ${retryDelay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error("Maximum retries exceeded. Giving up.");
        break;
      }
    }
  }
  return [];
}

