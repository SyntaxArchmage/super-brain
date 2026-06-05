import chalk from "chalk";
import { readConfig, writeConfig } from "../core/config.js";

export function registerConfig(program) {
  const cmd = program
    .command("config")
    .description("Manage CLI configuration");

  cmd
    .command("set <key> <value>")
    .description("Set a config value (e.g., sb config set remote-url https://...)")
    .action((key, value) => {
      const config = readConfig();
      const keyMap = {
        "remote-url": "remoteUrl",
        "remoteUrl": "remoteUrl",
        "remote": "remoteUrl",
      };
      const mappedKey = keyMap[key] || key;
      config[mappedKey] = value;
      writeConfig(config);
      console.log(chalk.green("✓") + ` Set ${mappedKey} = ${value}`);
    });

  cmd
    .command("get <key>")
    .description("Get a config value")
    .action((key) => {
      const config = readConfig();
      const keyMap = { "remote-url": "remoteUrl", "remote": "remoteUrl" };
      const mappedKey = keyMap[key] || key;
      const value = config[mappedKey];
      if (value === undefined) {
        console.log(chalk.dim(`${mappedKey} is not set.`));
      } else {
        console.log(`${mappedKey} = ${value}`);
      }
    });

  cmd
    .command("list")
    .description("Show all config values")
    .action(() => {
      const config = readConfig();
      const keys = Object.keys(config);
      if (keys.length === 0) {
        console.log(chalk.dim("No configuration set."));
        console.log(chalk.dim('Use: sb config set remote-url https://user.github.io/super-brain/'));
        return;
      }
      for (const [k, v] of Object.entries(config)) {
        console.log(`  ${k} = ${v}`);
      }
    });

  cmd
    .command("unset <key>")
    .description("Remove a config value")
    .action((key) => {
      const config = readConfig();
      const keyMap = { "remote-url": "remoteUrl", "remote": "remoteUrl" };
      const mappedKey = keyMap[key] || key;
      delete config[mappedKey];
      writeConfig(config);
      console.log(chalk.green("✓") + ` Removed ${mappedKey}`);
    });
}
