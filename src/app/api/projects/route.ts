import { NextResponse } from "next/server";
import { projectSchema } from "@/lib/project-schema";
import { updateProjects } from "@/lib/content";
import { isLocalRequest } from "@/lib/local-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLocalRequest(request))
    return NextResponse.json(
      { error: "Local same-origin access only." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length")) > 20000)
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  try {
    const payload = await request.json();
    if (payload.action === "delete") {
      const id = projectSchema.shape.id.parse(payload.id);
      await updateProjects((projects) =>
        projects.filter((project) => project.id !== id),
      );
    } else if (payload.action === "save") {
      const project = projectSchema.parse(payload.project);
      await updateProjects((projects) => {
        if (
          projects.some(
            (item) => item.slug === project.slug && item.id !== project.id,
          )
        )
          throw new Error("A project already uses that URL slug.");
        return projects.some((item) => item.id === project.id)
          ? projects.map((item) => (item.id === project.id ? project : item))
          : [...projects, project];
      });
    } else
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save project.",
      },
      { status: 400 },
    );
  }
}
