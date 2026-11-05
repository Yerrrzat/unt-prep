import { z } from "zod";

/**
 * Shapes of the JSONB columns. Objects are strict: an unexpected key (e.g. `isCorrect` inside an option)
 * is rejected, so answers cannot leak into `body`, which is the only item column sent to the browser.
 */

const id = z.string().trim().min(1).max(16);
const text = z.string().trim().min(1).max(10_000);

export const attachmentSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("code"),
    language: z.enum(["python", "pseudocode", "pascal", "cpp", "text"]),
    code: z.string().min(1).max(10_000),
  }),
  z.strictObject({
    kind: z.literal("table"),
    caption: z.string().max(500).optional(),
    header: z.array(z.string().max(200)).min(1).max(20),
    rows: z.array(z.array(z.string().max(500)).max(20)).min(1).max(100),
  }),
  z.strictObject({
    kind: z.literal("image"),
    src: z.string().url(),
    alt: z.string().min(1).max(500),
  }),
]);

export const optionSchema = z.strictObject({ id, text });

const uniqueIds = (options: { id: string }[]) => new Set(options.map((o) => o.id)).size === options.length;
const options = (min: number) =>
  z.array(optionSchema).min(min).max(10).refine(uniqueIds, { message: "Option ids must be unique" });

const base = { text, attachments: z.array(attachmentSchema).max(10).default([]) };

export const choiceBodySchema = z.strictObject({ ...base, options: options(2) });
export const contextBodySchema = z.strictObject({
  ...base,
  /** Shared source (text, code, table) for items 26–30. */
  context: z.strictObject({ text, attachments: z.array(attachmentSchema).max(10).default([]) }),
  options: options(2),
});
export const matchingBodySchema = z.strictObject({ ...base, left: options(2), right: options(2) });

export const itemBodySchemas = {
  single: choiceBodySchema,
  context: contextBodySchema,
  matching: matchingBodySchema,
  multiple: choiceBodySchema,
} as const;

export const explanationSchema = z.strictObject({
  text,
  attachments: z.array(attachmentSchema).max(10).default([]),
});

/** What the browser sends for one item. */
export const responseSchemas = {
  single: z.strictObject({ choice: id }),
  context: z.strictObject({ choice: id }),
  multiple: z.strictObject({ choices: z.array(id).max(10) }),
  matching: z.strictObject({ pairs: z.record(id, id) }),
} as const;

export type Attachment = z.infer<typeof attachmentSchema>;
export type ChoiceBody = z.infer<typeof choiceBodySchema>;
export type ContextBody = z.infer<typeof contextBodySchema>;
export type MatchingBody = z.infer<typeof matchingBodySchema>;
export type ItemBody = ChoiceBody | ContextBody | MatchingBody;
export type Explanation = z.infer<typeof explanationSchema>;
