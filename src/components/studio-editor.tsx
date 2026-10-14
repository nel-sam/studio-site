"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { categories, type Project } from "@/lib/project-schema";

function emptyProject(): Project {
  return {
    id: crypto.randomUUID(),
    title: "",
    slug: "",
    client: "",
    category: "Motion",
    year: new Date().getFullYear(),
    description: "",
    credits: "",
    image: "/media/field.jpg",
    alt: "",
    video: "",
    status: "draft",
  };
}
function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StudioEditor({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  function choose(project: Project | null) {
    setSelected(project);
    setMessage("");
    setPreview(false);
    setDeletePending(false);
  }
  function change<Key extends keyof Project>(key: Key, value: Project[Key]) {
    setSelected((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }
  async function save(action: "save" | "delete") {
    if (!selected) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, project: selected, id: selected.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (action === "delete") setSelected(null);
      setMessage(
        action === "delete"
          ? "Project deleted."
          : selected.status === "published"
            ? "Project published."
            : "Draft saved.",
      );
      setDeletePending(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File | undefined, field: "image" | "video") {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setMessage("Maximum upload size is 30 MB.");
      return;
    }
    if (
      (field === "video" && file.type !== "video/mp4") ||
      (field === "image" &&
        !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    ) {
      setMessage("Choose the correct media format for this field.");
      return;
    }
    setBusy(true);
    setMessage("Uploading...");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/media", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      change(field, data.url);
      setMessage("Uploaded. Save the project to keep this selection.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="studio-workspace">
      <aside className="studio-sidebar">
        <div className="sidebar-heading">
          <h2>Projects ({projects.length})</h2>
          <button
            className="icon-button"
            aria-label="Add project"
            title="Add project"
            disabled={busy}
            onClick={() => choose(emptyProject())}
          >
            <Plus />
          </button>
        </div>
        {projects.map((project) => (
          <button
            disabled={busy}
            key={project.id}
            className={`editor-project ${selected?.id === project.id ? "selected" : ""}`}
            onClick={() => choose({ ...project })}
          >
            <strong>{project.title}</strong>
            <span>
              {project.status} / {project.category}
            </span>
          </button>
        ))}
      </aside>
      <div className="studio-form-area">
        {!selected ? (
          <div className="editor-empty">
            <h2>A space for your next project.</h2>
            <button className="button" onClick={() => choose(emptyProject())}>
              <Plus size={18} /> New project
            </button>
            <p role="status">{message}</p>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              save("save");
            }}
          >
            <div className="editor-toolbar">
              <h2>{selected.title || "New project"}</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Close project"
                disabled={busy}
                onClick={() => choose(null)}
              >
                <X />
              </button>
            </div>
            <fieldset disabled={busy} className="editor-fields">
              <div className="form-two">
                <label>
                  Title
                  <input
                    required
                    maxLength={100}
                    value={selected.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setSelected({
                        ...selected,
                        title,
                        slug:
                          selected.slug === slugify(selected.title)
                            ? slugify(title)
                            : selected.slug,
                      });
                    }}
                  />
                </label>
                <label>
                  URL slug
                  <input
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    maxLength={80}
                    value={selected.slug}
                    onChange={(event) => change("slug", event.target.value)}
                  />
                </label>
              </div>
              <div className="form-two">
                <label>
                  Client
                  <input
                    required
                    maxLength={100}
                    value={selected.client}
                    onChange={(event) => change("client", event.target.value)}
                  />
                </label>
                <label>
                  Year
                  <input
                    required
                    type="number"
                    min="2000"
                    max="2100"
                    value={selected.year}
                    onChange={(event) =>
                      change("year", Number(event.target.value))
                    }
                  />
                </label>
              </div>
              <div className="form-two">
                <label>
                  Discipline
                  <select
                    value={selected.category}
                    onChange={(event) =>
                      change(
                        "category",
                        event.target.value as Project["category"],
                      )
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Visibility
                  <select
                    value={selected.status}
                    onChange={(event) =>
                      change("status", event.target.value as Project["status"])
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
              </div>
              <label>
                Description
                <textarea
                  required
                  rows={5}
                  maxLength={4000}
                  value={selected.description}
                  onChange={(event) =>
                    change("description", event.target.value)
                  }
                />
              </label>
              <label>
                Credits
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={selected.credits}
                  onChange={(event) => change("credits", event.target.value)}
                />
              </label>
              <div className="media-editor">
                <Image
                  src={selected.image}
                  alt={selected.alt || "Selected project cover"}
                  width={320}
                  height={180}
                  unoptimized
                />
                <div>
                  <label className="upload-label">
                    <Upload size={16} /> Cover image
                    <input
                      aria-label="Upload cover image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        upload(event.target.files?.[0], "image")
                      }
                    />
                  </label>
                  <label>
                    Image description
                    <input
                      required
                      maxLength={300}
                      value={selected.alt}
                      onChange={(event) => change("alt", event.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className="video-editor">
                <label className="upload-label">
                  <Upload size={16} /> MP4 video
                  <input
                    aria-label="Upload project video"
                    type="file"
                    accept="video/mp4"
                    onChange={(event) =>
                      upload(event.target.files?.[0], "video")
                    }
                  />
                </label>
                {selected.video && (
                  <>
                    <span className="asset-path">{selected.video}</span>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => change("video", "")}
                    >
                      Remove video
                    </button>
                  </>
                )}
              </div>
              <div className="editor-actions">
                <button type="submit" className="button">
                  <Save size={17} />{" "}
                  {busy
                    ? "Saving..."
                    : selected.status === "published"
                      ? "Save & publish"
                      : "Save draft"}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? "Close preview" : "Preview"}
                  <ArrowUpRight size={16} />
                </button>
                {projects.some((project) => project.id === selected.id) && (
                  <button
                    type="button"
                    className="icon-button danger"
                    title="Delete project"
                    aria-label="Delete project"
                    onClick={() => setDeletePending(!deletePending)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              {deletePending && (
                <div className="delete-confirm">
                  <p>
                    Permanently delete this project? Uploaded media will stay on
                    disk.
                  </p>
                  <button
                    type="button"
                    className="button danger"
                    onClick={() => save("delete")}
                  >
                    Delete permanently
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setDeletePending(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </fieldset>
            <p className="editor-message" role="status">
              {message}
            </p>
            {preview && (
              <section className="editor-preview" aria-label="Project preview">
                <h2>{selected.title || "Untitled project"}</h2>
                <p>
                  {selected.category} / {selected.year}
                </p>
                {selected.video ? (
                  <video
                    src={selected.video}
                    poster={selected.image}
                    controls
                    preload="none"
                  />
                ) : (
                  <Image
                    src={selected.image}
                    alt={selected.alt}
                    width={960}
                    height={540}
                    unoptimized
                  />
                )}
                <p className="preserve-lines">{selected.description}</p>
                <p>{selected.credits}</p>
              </section>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
