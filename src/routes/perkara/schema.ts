import { z } from "zod";

export const perkaraSchema = z.object({
  pdm: z.string().min(3),
  t7start: z.string().min(1).nullish(),
  t7end: z.string().min(1).nullish(),
  t6start: z.string().min(1).nullish(),
  t6end: z.string().min(1).nullish(),
  ditahan: z.string().min(1),
  terdakwa: z.string().min(1),
  jpu: z.string().min(1).transform(e => {
    console.log("jpu.transform", e)
    return e.split(",")
  }),
  asalPerkara: z.string().min(2),
  pasal: z.string().nullish(),
  barangBukti: z.enum(["ada", "tidakAda", "dititip"]),
}).refine(schema => !!schema.t6start === !!schema.t6end, "Specify Start end End T6").refine(schema => {
  if (!(schema.t7start && schema.t7end)) return true;
  let start = new Date(schema.t7start)
  let end = new Date(schema.t7end)
  return start < end;
}, "T7 Start is Ahead of End");

export type PerkaraSchema = typeof perkaraSchema;
