#!/usr/bin/env node

import chalk from "chalk";
import figlet from "figlet";
import ora from "ora";
import { program } from "commander";
import dotenv from "dotenv";
import axios from "axios";
import pkg from "enquirer";
const { prompt } = pkg;

dotenv.config();

console.log(chalk.green(figlet.textSync("Shakir Redis-cli   :p")));

const baseURL = process.env.API_URL;

program
  .version("1.0.0")
  .description("CLI for interacting with cache system made by Shakir");

program
  .command("SET <key> <value>")
  .description("Set the value of key and value")
  .action(async (key, value) => {
    const spinner = ora("Setting key...").start();
    try {
      await axios.put(`${baseURL}/put`, null, { params: { key, value } });
      spinner.succeed(chalk.green("Key set successfully!"));
      console.log(
        chalk.blue(`Follow-up: Key "${key}" has been set to "${value}".`)
      );
    } catch (e) {
      spinner.fail(chalk.red("Error setting the key: " + e.message));
    }
  });

program
  .command("GET <key>")
  .description("Get the value of a key")
  .action(async (key) => {
    const spinner = ora("Fetching value...").start();
    try {
      const response = await axios.get(`${baseURL}/get`, { params: { key } });
      spinner.succeed("Fetched successfully!");
      console.log(chalk.blue(`Value: ${response.data.value}`));
      console.log(chalk.blue(`Follow-up: Key "${key}" fetched successfully.`));
    } catch (e) {
      spinner.fail(chalk.red("Error fetching key: " + e.message));
    }
  });

program
  .command("DEL <key>")
  .description("Delete the value of the key")
  .action(async (key) => {
    const spinner = ora("Deleting key...").start();
    try {
      await axios.delete(`${baseURL}/del`, { params: { key } });
      spinner.succeed(chalk.green(`Successfully deleted ${key}`));
      console.log(chalk.blue(`Follow-up: Key "${key}" has been deleted.`));
    } catch (e) {
      spinner.fail(chalk.red("Error deleting value: " + e.message));
    }
  });

async function interactiveMode() {
  console.log("Entering interactive mode. Type 'exit' to quit.");

  while (true) {
    const response = await prompt({
      type: "input",
      name: "command",
      message: "my-redis-cli:",
    });

    const { command } = response;

    if (command === "exit") break;

    const [cmd, key, value] = command.split(" ");

    if (cmd === "SET" && key && value) {
      program.commands.find((c) => c.name() === "SET").action(key, value);
      console.log(chalk.blue(`Key ${key} has been set to ${value}.`));
    } else if (cmd === "GET" && key) {
      program.commands.find((c) => c.name() === "GET").action(key);
    } else if (cmd === "DEL" && key) {
      program.commands.find((c) => c.name() === "DEL").action(key);
      console.log(chalk.blue(`Key ${key} has been deleted.`));
    } else {
      console.log(chalk.red("Invalid command. Please try again."));
    }
  }
}

program
  .command("cli")
  .description("Enter interactive mode")
  .action(interactiveMode);

if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
