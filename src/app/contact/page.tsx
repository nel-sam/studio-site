"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const email = "hello@example.com";
  return (
    <section className="wrap page-section contact-page">
      <div className="page-heading">
        <span className="eyebrow">Good work starts with a conversation</span>
        <h1>
          Let&apos;s make
          <br />
          some noise<span className="period">.</span>
        </h1>
        <p>
          A new project, an unexpected collaboration, or just a hello.
          We&apos;re listening.
        </p>
      </div>
      <div className="contact-email">
        <a href={`mailto:${email}`}>
          {email}
          <ArrowUpRight />
        </a>
        <button
          className="icon-button"
          title="Copy email address"
          aria-label="Copy email address"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(email);
              setCopied(true);
              setError("");
            } catch {
              setError(
                "Copy unavailable. Select the email address to copy it.",
              );
            }
          }}
        >
          {copied ? <Check /> : <Copy />}
        </button>
      </div>
      <p role="status" className="contact-status">
        {error || (copied ? "Email address copied." : "")}
      </p>
      <div className="contact-details">
        <div>
          <span className="eyebrow">New projects</span>
          <p>
            Tell us what you have in mind.
            <br />
            We&apos;ll take it from there.
          </p>
        </div>
        <div>
          <span className="eyebrow">Our outlook</span>
          <p>
            Independent studio.
            <br />
            Open to the world.
          </p>
        </div>
      </div>
    </section>
  );
}
