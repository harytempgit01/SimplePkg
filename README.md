# simplepkg

A small utility npm package with string helpers, IDs, validation, and a CLI.

## Install

```sh
npm install simplepkg
```

## Usage

```js
import {
  createId,
  createSlug,
  greet,
  parsePackageInput,
  summarizeText
} from "simplepkg";

console.log(greet("World"));
// Hello, World!

console.log(createSlug("Simple NPM Package!"));
// simple-npm-package

console.log(createId("Simple Package"));
// simple-package_V1StGXR8_Z

console.log(summarizeText("  A package   helper with spacing  ", 18));
// A package helper...

console.log(parsePackageInput({ name: "Simple Package", tags: ["npm", "cli"] }));
```

## CLI

After install, use the binary:

```sh
simplepkg greet TanStack
simplepkg slug "Simple NPM Package!"
simplepkg id "Simple Package"
simplepkg summary "A long piece of text to shorten" --max 16
simplepkg inspect --name "Simple Package" --tag npm cli
```

## Scripts

```sh
npm install
npm run build
npm run run -- greet TanStack
npm test
```

## Package Layout

- `src/index.js`: package exports
- `src/cli.js`: CLI source
- `dist/`: publishable build output
- `test/`: Node test runner coverage
