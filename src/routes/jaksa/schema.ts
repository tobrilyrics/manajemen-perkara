import { z } from "zod";

export const jaksaSchema = z.object({
  id: z.string().min(3),
  nama: z.string().min(3),
  password: z.string().min(3),
  cabang: z.enum(["Kejari", "Kejati"])
})

export const jaksaEditSchema = z.object({
  id: z.string().min(1),
  nama: z.string().min(3),
  cabang: z.enum(["Kejari", "Kejati"])
})

export type JaksaSchema = typeof jaksaSchema
