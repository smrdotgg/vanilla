import { env } from "./env";

let prevStack = '';

export const consoleLog = (...args: Parameters<typeof console.log>) => {
  const funcName = logStack();
  if (prevStack !== funcName) console.log('');
  prevStack = funcName;
  if (env.CONSOLE_LOGS) {
    console.log(`[${funcName}]: `, ...args);
  }
};

export const consoleError = (...args: Parameters<typeof console.error>) => {
  const funcName = logStack();
  if (prevStack !== funcName) console.log('');
  prevStack = funcName;
  if (env.CONSOLE_LOGS) {
    console.error(`[${funcName}]: `, ...args);
  }
};


function logStack() {
  const stack = new Error().stack;
  const targetLine = stack?.split("\n").at(3);
  const funcName = targetLine?.trim().split(" ").at(1);
  return String(funcName);
}
