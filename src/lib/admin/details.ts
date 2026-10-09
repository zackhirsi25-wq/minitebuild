import { z } from "zod";
import { parsePhone } from "@/lib/content/phone";
import { containsHtml, siteContentSchema, TEMPLATES, TRADES } from "@/lib/content/schema";

const plain = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { message: `${label} must be at most ${max} characters` })
    .refine((v) => !containsHtml(v), { message: `${label} must be plain text` });

/** The editable business details (everything on the site that isn't copy). */
export const businessDetailsSchema = z.object({
  name: plain(120, "Name").pipe(z.string().min(1, { message: "Name can't be empty" })),
  city: plain(80, "City").pipe(z.string().min(1, { message: "City can't be empty" })),
  phone: z
    .string()
    .trim()
    .refine((v) => parsePhone(v) !== null, { message: "Enter a valid phone number" })
    .transform((v) => parsePhone(v)!.display),
  address: plain(200, "Address").transform((v) => v || null),
  category: plain(80, "Category").transform((v) => v || null),
  hours: z
    .array(plain(80, "Each hours line"))
    .max(14, { message: "Hours can have at most 14 lines" })
    .transform((lines) => lines.filter(Boolean)),
  websiteUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), { message: "Website must start with http:// or https://" })
    .transform((v) => v || null),
  trade: z.enum(TRADES),
  template: z.enum(TEMPLATES),
});

export const businessEditSchema = z.object({
  details: businessDetailsSchema,
  content: siteContentSchema,
});

export type BusinessEdit = z.input<typeof businessEditSchema>;
