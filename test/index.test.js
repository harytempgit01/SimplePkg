import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createId, createSlug, greet, parsePackageInput, summarizeText } from "../src/index.js";

describe("simplepkg", () => {
  it("greets a name", () => {
    assert.equal(greet("TanStack"), "Hello, TanStack!");
  });

  it("falls back to World", () => {
    assert.equal(greet(), "Hello, World!");
    assert.equal(greet("   "), "Hello, World!");
  });

  it("creates slugs", () => {
    assert.equal(createSlug("Simple NPM Package!"), "simple-npm-package");
  });

  it("creates prefixed IDs", () => {
    assert.match(createId("Simple Package"), /^simple-package_[A-Za-z0-9_-]{10}$/);
  });

  it("summarizes text", () => {
    assert.equal(summarizeText("  A   package   helper  ", 80), "A package helper");
    assert.equal(summarizeText("Pack this text nicely", 10), "Pack this...");
  });

  it("validates and enriches package-like input", () => {
    const result = parsePackageInput({
      name: "Simple Package",
      tags: ["npm", "cli"]
    });

    assert.equal(result.description, "");
    assert.equal(result.slug, "simple-package");
    assert.deepEqual(result.tags, ["npm", "cli"]);
    assert.match(result.id, /^simple-package_[A-Za-z0-9_-]{10}$/);
  });
});
