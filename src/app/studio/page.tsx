import { readProjects } from "@/lib/content";
import { StudioEditor } from "@/components/studio-editor";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Local studio editor",
  robots: { index: false, follow: false },
};
export default async function Studio() {
  return (
    <section className="wrap studio-page">
      <div className="studio-heading">
        <div>
          <span className="eyebrow">Content workspace</span>
          <h1>
            Studio editor<span className="period">.</span>
          </h1>
        </div>
        <span className="local-badge">Local only</span>
      </div>
      <p className="studio-notice">
        Development editor. Changes are stored in this project folder. No Sanity
        or Mux connection; no production authentication. Do not expose this
        server to a network.
      </p>
      <StudioEditor projects={await readProjects()} />
    </section>
  );
}
