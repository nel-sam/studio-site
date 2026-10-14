import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "About" };
export default function About() {
  return (
    <>
      <section className="wrap page-section">
        <div className="page-heading">
          <span className="eyebrow">Independent minds. Shared energy.</span>
          <h1>
            Not one thing.
            <br />
            Never standing still<span className="period">.</span>
          </h1>
        </div>
        <div className="about-intro">
          <div className="about-art">
            <svg
              viewBox="0 0 400 400"
              role="img"
              aria-label="Overlapping striped squares forming an audiovisual identity"
            >
              <defs>
                <pattern
                  id="stripes"
                  width="12"
                  height="12"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M0 0V12" stroke="currentColor" strokeWidth="5" />
                </pattern>
              </defs>
              <rect
                x="45"
                y="65"
                width="250"
                height="250"
                fill="url(#stripes)"
              />
              <rect
                x="105"
                y="85"
                width="240"
                height="240"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                transform="rotate(25 225 205)"
              />
            </svg>
          </div>
          <div>
            <h2>
              A studio built
              <br />
              between disciplines.
            </h2>
            <p>
              We are a collective of image-makers, designers and sound
              explorers. We work where disciplines overlap, finding new ways for
              ideas to take shape.
            </p>
            <p>
              From the first conversation to the final frame, we bring
              curiosity, care and a shared belief that the most interesting work
              happens together.
            </p>
            <Link href="/contact" className="text-link">
              Start a conversation <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="services wrap">
        <span className="eyebrow">Our practice</span>
        {[
          ["01", "Moving image", "Art direction / Animation / Film"],
          [
            "02",
            "Living identities",
            "Visual identity / Motion systems / Digital design",
          ],
          [
            "03",
            "Sound & space",
            "Sound design / Installation / Audiovisual experiences",
          ],
        ].map(([number, title, description]) => (
          <div className="service-row" key={number}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        ))}
      </section>
    </>
  );
}
