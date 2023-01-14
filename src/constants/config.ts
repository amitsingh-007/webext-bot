import { z } from "zod";

export const ConfigSchema = z
  .object({
    "branches-ignore": z.string().array().default([]),
    "comment-threshold": z.number().default(0),
    "auto-assign": z.string().array().optional(),
    manifest: z
      .object({
        name: z.string(),
        dir: z.string(),
      })
      .strict(),
    workflow: z
      .object({
        name: z.string(),
        artifact: z.string(),
      })
      .strict(),
  })
  .strict();

export type IConfig = z.infer<typeof ConfigSchema>;
