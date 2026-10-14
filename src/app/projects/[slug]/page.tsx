import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { readProjects } from "@/lib/content";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = (await readProjects()).find(
    (item) => item.slug === slug && item.status === "published",
  );
  return {
    title: project?.title ?? "Project not found",
    description: project?.description.slice(0, 160),
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = (await readProjects()).filter(
    (item) => item.status === "published",
  );
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <article className="project-detail">
      <header className="wrap detail-heading">
        <Link href="/projects" className="text-link">
          <ArrowLeft size={16} /> All projects
        </Link>
        <h1>{project.title}</h1>
        <div className="detail-meta">
          <span>{project.client}</span>
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
      </header>
      <div className="detail-media">
        {project.video ? (
          <video
            src={project.video}
            poster={project.image}
            controls
            playsInline
            preload="none"
            aria-label={project.title}
          />
        ) : (
          <Image src={project.image} alt={project.alt} width={960} height={540} sizes="100vw" />
        )}
      </div>
      <div className="detail-copy wrap">
        <h2>Behind the work</h2>
        <div>
          <p className="preserve-lines">{project.description}</p>
          <p className="credits">{project.credits}</p>
        </div>
      </div>
      {next && next.id !== project.id && (
        <Link href={`/projects/${next.slug}`} className="next-project wrap">
          <span className="eyebrow">Next project</span>
          <span>
            {next.title} <ArrowUpRight />
          </span>
        </Link>
      )}
    </article>
  );
}
