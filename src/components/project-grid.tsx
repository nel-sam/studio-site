"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { categories, type Project } from "@/lib/project-schema";

function ProjectItem({ project, index }: { project: Project; index: number }) {
  const player = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = player.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.pause();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  function play() {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      player.current?.play().catch(() => undefined);
  }
  return (
    <article className="project-item">
      <Link
        className="project-image-link"
        href={`/projects/${project.slug}`}
        aria-label={`View ${project.title}`}
        onMouseEnter={play}
        onMouseLeave={() => player.current?.pause()}
        onFocus={play}
        onBlur={() => player.current?.pause()}
      >
        <Image
          src={project.image}
          alt={project.alt}
          loading="lazy"
          width={960}
          height={540}
          sizes="(max-width: 650px) calc(100vw - 36px), (max-width: 1696px) calc((100vw - 124px) / 2), 786px"
        />
        {project.video && (
          <video
            ref={player}
            src={project.video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        )}
        <span className="project-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="project-open">
          <ArrowUpRight size={24} />
        </span>
      </Link>
      <div className="project-caption">
        <div>
          <Link href={`/projects/${project.slug}`}>
            <h3>{project.title}</h3>
          </Link>
          <span>{project.client}</span>
        </div>
        <span className="project-category">
          {project.category} / {project.year}
        </span>
      </div>
    </article>
  );
}

export function ProjectGrid({
  projects,
  filterable = false,
}: {
  projects: Project[];
  filterable?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const grid = useRef<HTMLDivElement>(null);
  const visible = projects.filter(
    (project) => category === "All" || project.category === category,
  );
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const context = gsap.context(
        () =>
          gsap.fromTo(
            ".project-item",
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.06,
              duration: 0.45,
              clearProps: "all",
            },
          ),
        grid,
      );
      return () => context.revert();
    }
  }, [category]);
  return (
    <>
      {filterable && (
        <div
          className="project-filters"
          role="group"
          aria-label="Filter projects by discipline"
        >
          {["All", ...categories].map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
              <span>
                {
                  projects.filter(
                    (project) => item === "All" || project.category === item,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" role="status">
        {visible.length} projects shown
      </p>
      <div className="project-grid" ref={grid}>
        {visible.map((project, index) => (
          <ProjectItem key={project.id} project={project} index={index} />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="empty-state">No projects in this discipline yet.</p>
      )}
    </>
  );
}
