// import { spawn } from 'child_process';
// import * as path from 'path';
// import * as fs from 'fs';

// // Colors
// const GREEN = '\x1b[32m';
// const RESET = '\x1b[0m';

// const MACHINE = process.env.MACHINE || detectMachine();

// let BASE_DIR: string;

// if (MACHINE === 'windows') {
//   // Use PC_NAME for Windows only; fallback to "default" if not set
//   const PC_NAME = process.env.PC_NAME || 'PC_Milos';
//   BASE_DIR = path.resolve(__dirname, `../local/${MACHINE}/${PC_NAME}`);
// } else {
//   // macOS/Linux
//   BASE_DIR = path.resolve(__dirname, `../local/${MACHINE}`);
// }

// const LIB_DIR = path.resolve(__dirname, '../local/lib');
// const SELENIUM_JAR = path.join(LIB_DIR, 'selenium-server-4.34.0.jar');

// function detectMachine(): string {
//   const platform = process.platform;
//   if (platform === 'win32') return 'windows';
//   if (platform === 'darwin') return 'mac';
//   return 'linux';
// }

// function startInNewTerminal(command: string, name: string) {
//   console.log(`${GREEN}▶️ Launching ${name} in a new terminal...${RESET}`);

//   if (MACHINE === 'windows') {
//     spawn('cmd', ['/c', 'start', 'cmd', '/k', command], { shell: true });
//   } else if (MACHINE === 'mac') {
//     spawn('osascript', [
//       '-e',
//       `tell application "Terminal" to do script "${command}"`,
//     ]);
//   } else {
//     spawn('gnome-terminal', ['--', 'bash', '-c', `${command}; exec bash`]);
//   }
// }

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function startAllInstances() {
//   const appiumConfigs = fs
//     .readdirSync(path.join(BASE_DIR, '.appium-configs'))
//     .filter((f) => f.endsWith('.yml'));
//   const nodeConfigs = fs
//     .readdirSync(path.join(BASE_DIR, '.appium-nodes'))
//     .filter((f) => f.endsWith('.toml'));

//   if (!appiumConfigs.length || !nodeConfigs.length) {
//     console.error('❌ No Appium or Node config files found!');
//     process.exit(1);
//   }

//   // First instances
//   const appium1 = path.join(BASE_DIR, '.appium-configs', appiumConfigs[0]);
//   const node1 = path.join(BASE_DIR, '.appium-nodes', nodeConfigs[0]);

//   startInNewTerminal(`java -jar "${SELENIUM_JAR}" hub`, 'Hub');
//   startInNewTerminal(`appium --config "${appium1}"`, 'Appium-1');
//   startInNewTerminal(
//     `java -jar "${SELENIUM_JAR}" node --config "${node1}"`,
//     'Node-1',
//   );

//   console.log(`${GREEN}✅ Hub + Appium-1 + Node-1 started!${RESET}`);

//   // Remaining instances with 10s delay
//   for (let i = 1; i < appiumConfigs.length || i < nodeConfigs.length; i++) {
//     await delay(10000); // 10 seconds gap

//     if (i < appiumConfigs.length) {
//       const appiumCfg = path.join(BASE_DIR, '.appium-configs', appiumConfigs[i]);
//       startInNewTerminal(`appium --config "${appiumCfg}"`, `Appium-${i + 1}`);
//     }

//     if (i < nodeConfigs.length) {
//       const nodeCfg = path.join(BASE_DIR, '.appium-nodes', nodeConfigs[i]);
//       startInNewTerminal(
//         `java -jar "${SELENIUM_JAR}" node --config "${nodeCfg}"`,
//         `Node-${i + 1}`,
//       );
//     }
//   }
// }

// startAllInstances();

//Delete commented area after testing on MAC

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const GREEN = '\x1b[32m';
// const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const MACHINE = process.env.MACHINE || detectMachine();

let BASE_DIR: string;
if (MACHINE === 'windows') {
  const PC_NAME = process.env.PC_NAME || 'PC_Milos';
  BASE_DIR = path.resolve(__dirname, `../local/${MACHINE}/${PC_NAME}`);
} else {
  BASE_DIR = path.resolve(__dirname, `../local/${MACHINE}`);
}

const LIB_DIR = path.resolve(__dirname, '../local/lib');
const SELENIUM_JAR = path.join(LIB_DIR, 'selenium-server-4.34.0.jar');

function detectMachine(): string {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'mac';
  return 'linux';
}

function startInNewTerminal(
  command: string,
  name: string,
  envVars: Record<string, string> = {},
) {
  console.log(`${GREEN}▶️ Launching ${name} in a new terminal...${RESET}`);

  const env = { ...process.env, ...envVars };

  if (MACHINE === 'windows') {
    spawn('cmd', ['/c', 'start', 'cmd', '/k', command], { shell: true, env });
  } else if (MACHINE === 'mac') {
    spawn(
      'osascript',
      ['-e', `tell application "Terminal" to do script "${command}"`],
      { env },
    );
  } else {
    spawn('gnome-terminal', ['--', 'bash', '-c', `${command}; exec bash`], {
      env,
    });
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startAllInstances() {
  // Get Appium configs (.yml) and Node configs (.toml)
  const appiumConfigs = fs
    .readdirSync(path.join(BASE_DIR, '.appium-configs'))
    .filter((f) => f.endsWith('.yml'));
  const nodeConfigs = fs
    .readdirSync(path.join(BASE_DIR, '.appium-nodes'))
    .filter((f) => f.endsWith('.toml'));

  if (!appiumConfigs.length || !nodeConfigs.length) {
    console.error(`${RED}❌ No Appium or Node config files found!${RESET}`);
    process.exit(1);
  }

  // Set environment variable to expose Appium externally
  const appiumEnv = { APPIUM_HOST: '0.0.0.0' };

  // Start Hub
  startInNewTerminal(`java -jar "${SELENIUM_JAR}" hub`, 'Hub');

  // Start first Appium + Node instances immediately
  const appium1 = path.join(BASE_DIR, '.appium-configs', appiumConfigs[0]);
  const node1 = path.join(BASE_DIR, '.appium-nodes', nodeConfigs[0]);

  startInNewTerminal(`appium --config "${appium1}"`, 'Appium-1', appiumEnv);
  startInNewTerminal(
    `java -jar "${SELENIUM_JAR}" node --config "${node1}"`,
    'Node-1',
  );

  console.log(`${GREEN}✅ Hub + Appium-1 + Node-1 started!${RESET}`);

  // Start remaining instances with 10s delay to avoid port conflicts
  const maxInstances = Math.max(appiumConfigs.length, nodeConfigs.length);
  for (let i = 1; i < maxInstances; i++) {
    await delay(10000);

    if (i < appiumConfigs.length) {
      const appiumCfg = path.join(
        BASE_DIR,
        '.appium-configs',
        appiumConfigs[i],
      );
      startInNewTerminal(
        `appium --config "${appiumCfg}"`,
        `Appium-${i + 1}`,
        appiumEnv,
      );
    }

    if (i < nodeConfigs.length) {
      const nodeCfg = path.join(BASE_DIR, '.appium-nodes', nodeConfigs[i]);
      startInNewTerminal(
        `java -jar "${SELENIUM_JAR}" node --config "${nodeCfg}"`,
        `Node-${i + 1}`,
      );
    }
  }

  console.log(
    `${GREEN}✅ All Appium + Node instances started successfully!${RESET}`,
  );
}

startAllInstances();
