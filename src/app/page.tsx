import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { ProjectGrid } from "@/components/project-grid";
import { readProjects } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = (await readProjects()).filter(
    (project) => project.status === "published",
  );
  return (
    <>
      <section className="home-heading wrap">
        <div className="eyebrow">
          <span className="live-dot" /> Independent audiovisual studio{" "}
          <span className="desktop-only">Image. Sound. Something else.</span>
        </div>
        <h1>
          FORM <span className="slash">/</span>
          <br />
          FREQUENCY<span className="period">.</span>
        </h1>
        <div className="heading-bottom">
          <p>
            We make things
            <br />
            that move you.
          </p>
          <a href="#selected" className="text-link">
            Explore our work <ArrowDown size={18} />
          </a>
        </div>
      </section>
      <Hero project={projects[0]} />
      <section id="selected" className="section wrap">
        <div className="section-heading">
          <h2>
            Selected work
            <span className="sup">
              ({String(projects.length).padStart(2, "0")})
            </span>
          </h2>
          <Link href="/projects" className="text-link">
            All projects <ArrowUpRight size={18} />
          </Link>
        </div>
        <ProjectGrid projects={projects.slice(0, 4)} />
      </section>
      <section className="statement wrap">
        <span className="eyebrow">A meeting of disciplines</span>
        <h2>
          Different perspectives.
          <br />
          One shared frequency.
        </h2>
        <div className="statement-bottom">
          <p>
            We bring moving image, sound and design together to turn ideas into
            experiences. Curious by nature. Collaborative by choice.
          </p>
          <Link href="/about" className="text-link">
            Meet the studio <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
