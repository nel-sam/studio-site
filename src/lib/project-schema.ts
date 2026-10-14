import { z } from "zod";

export const categories = [
  "Motion",
  "Identity",
  "Sound",
  "Experiential",
] as const;
const localAsset = z
  .string()
  .regex(/^\/media\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|mp4)$/);
export const projectSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(100),
  client: z.string().trim().min(1).max(100),
  category: z.enum(categories),
  year: z.number().int().min(2000).max(2100),
  description: z.string().trim().min(1).max(4000),
  credits: z.string().max(1000),
  image: localAsset.refine(
    (value) => !value.endsWith(".mp4"),
    "Select an image, not a video",
  ),
  alt: z.string().trim().min(1).max(300),
  video: z.union([
    localAsset.refine((value) => value.endsWith(".mp4"), "Select an MP4 video"),
    z.literal(""),
  ]),
  status: z.enum(["draft", "published"]),
});
export type Project = z.infer<typeof projectSchema>;
