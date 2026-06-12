#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";

import { createId, createSlug, greet, parsePackageInput, summarizeText } from "./index.js";

const program = new Command();

program
  .name("simplepkg")
  .description("Small utility CLI for the simplepkg npm package")
  .version("0.2.0");

program
  .command("greet")
  .description("Print a friendly greeting")
  .argument("[name]", "name to greet", "World")
  .action((name) => {
    console.log(chalk.green(greet(name)));
  });

program
  .command("slug")
  .description("Create a URL-safe slug")
  .argument("<text>", "text to slugify")
  .action((text) => {
    console.log(createSlug(text));
  });

program
  .command("id")
  .description("Create a short prefixed ID")
  .argument("[prefix]", "ID prefix", "pkg")
  .action((prefix) => {
    console.log(createId(prefix));
  });

program
  .command("summary")
  .description("Trim whitespace and shorten text")
  .argument("<text>", "text to summarize")
  .option("-m, --max <number>", "maximum output length", "80")
  .action((text, options) => {
    console.log(summarizeText(text, Number.parseInt(options.max, 10)));
  });

program
  .command("inspect")
  .description("Validate package-like input and print derived data")
  .requiredOption("-n, --name <name>", "package name")
  .option("-d, --description <description>", "package description", "")
  .option("-t, --tag <tag...>", "package tags")
  .action((options) => {
    const result = parsePackageInput({
      name: options.name,
      description: options.description,
      tags: options.tag ?? []
    });

    console.log(JSON.stringify(result, null, 2));
  });

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
