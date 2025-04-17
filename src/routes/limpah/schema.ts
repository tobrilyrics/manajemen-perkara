import { z } from 'zod'

export const tambahSchema = z.object({
  tanggal: z.coerce.date(),
  pdm: z.string().min(1, 'Required'),
  cms: z.boolean(),
  terkirim: z.boolean(),
  eBerpadu: z.boolean(),
})
