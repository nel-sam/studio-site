import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isLocalRequest } from "@/lib/local-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLocalRequest(request))
    return NextResponse.json(
      { error: "Local same-origin access only." },
      { status: 403 },
    );
  const limit = 30 * 1024 * 1024;
  if (Number(request.headers.get("content-length")) > limit + 10000)
    return NextResponse.json(
      { error: "Maximum upload size is 30 MB." },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > limit)
      return NextResponse.json(
        { error: "Choose a non-empty image or MP4, up to 30 MB." },
        { status: 400 },
      );
    const buffer = Buffer.from(await file.arrayBuffer());
    let extension: string | undefined;
    if (buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255])))
      extension = "jpg";
    else if (
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      extension = "png";
    else if (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    )
      extension = "webp";
    else if (
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      ["isom", "iso2", "mp41", "mp42", "avc1"].includes(
        buffer.toString("ascii", 8, 12),
      )
    )
      extension = "mp4";
    if (!extension)
      return NextResponse.json(
        {
          error:
            "Supported formats: JPEG, PNG, WebP and MP4. SVG uploads are not allowed.",
        },
        { status: 400 },
      );
    const directory = path.join(process.cwd(), "public", "media");
    await mkdir(directory, { recursive: true });
    const filename = `${crypto.randomUUID()}.${extension}`;
    await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
    return NextResponse.json({ url: `/media/${filename}` });
  } catch {
    return NextResponse.json(
      { error: "Upload could not be read. Try a smaller file." },
      { status: 400 },
    );
  }
}
