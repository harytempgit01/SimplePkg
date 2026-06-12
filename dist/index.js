import { nanoid } from "nanoid";
import slugify from "slugify";
import { z } from "zod";

const displayNameSchema = z.string().trim().min(1).default("World");

export function greet(name = "World") {
  if (typeof name !== "string") {
    throw new TypeError("name must be a string");
  }

  const displayName = displayNameSchema.catch("World").parse(name);
  return `Hello, ${displayName}!`;
}

export function createSlug(value, options = {}) {
  if (typeof value !== "string") {
    throw new TypeError("value must be a string");
  }

  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
    ...options
  });
}

export function createId(prefix = "pkg") {
  if (typeof prefix !== "string") {
    throw new TypeError("prefix must be a string");
  }

  const cleanPrefix = createSlug(prefix || "pkg") || "pkg";
  return `${cleanPrefix}_${nanoid(10)}`;
}

export function summarizeText(text, maxLength = 80) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError("maxLength must be a positive integer");
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

export function parsePackageInput(input) {
  const schema = z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().optional().default(""),
    tags: z.array(z.string().trim().min(1)).optional().default([])
  });

  const parsed = schema.parse(input);

  return {
    ...parsed,
    slug: createSlug(parsed.name),
    id: createId(parsed.name)
  };
}
