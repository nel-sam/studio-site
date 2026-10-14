import { readProjects } from "@/lib/content";
import { ProjectGrid } from "@/components/project-grid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects" };
export default async function Projects() {
  const projects = (await readProjects()).filter(
    (project) => project.status === "published",
  );
  return (
    <section className="wrap page-section">
      <div className="page-heading">
        <span className="eyebrow">A collection of curiosities</span>
        <h1>
          Things we
          <br />
          put into motion<span className="period">.</span>
        </h1>
        <p>
          Moving images, living identities and unexpected encounters. Different
          forms. Same frequency.
        </p>
      </div>
      <ProjectGrid projects={projects} filterable />
    </section>
  );
}
