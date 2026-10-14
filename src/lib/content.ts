import "server-only";
import { readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { projectSchema, type Project } from "./project-schema";

const contentFile = path.join(process.cwd(), "data", "projects.json");
let pending: Promise<unknown> = Promise.resolve();

export async function readProjects(): Promise<Project[]> {
  return z
    .array(projectSchema)
    .parse(JSON.parse(await readFile(contentFile, "utf8")));
}

export function updateProjects(update: (projects: Project[]) => Project[]) {
  const operation = pending.then(async () => {
    const projects = z.array(projectSchema).parse(update(await readProjects()));
    const temporary = `${contentFile}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(projects, null, 2) + "\n");
    await rename(temporary, contentFile);
    return projects;
  });
  pending = operation.catch(() => undefined);
  return operation;
}
