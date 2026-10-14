"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, RotateCw } from "lucide-react";
import gsap from "gsap";
import type { Project } from "@/lib/project-schema";

export function Hero({ project }: { project?: Project }) {
  const scene = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [variation, setVariation] = useState(0);
  const manuallyPaused = useRef(false);
  const waveTween = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const tween = gsap.fromTo(
          ".reactive-wave",
          { scaleY: 0.6 },
          {
            scaleY: 1.2,
            transformOrigin: "center",
            duration: 2,
            stagger: 0.08,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          },
        );
        waveTween.current = tween;
        return () => tween.kill();
      },
      scene,
    );
    const player = video.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !manuallyPaused.current &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          player?.play().catch(() => undefined);
        else player?.pause();
      },
      { threshold: 0.25 },
    );
    if (player) observer.observe(player);
    return () => {
      media.revert();
      observer.disconnect();
    };
  }, []);
  return (
    <section
      className="hero-scene"
      ref={scene}
      style={{ filter: `hue-rotate(${variation * 50}deg)` }}
      onPointerMove={(event) => {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          const box = event.currentTarget.getBoundingClientRect();
          gsap.to(".hero-wave", {
            x: (event.clientX - box.left - box.width / 2) * 0.035,
            duration: 0.8,
          });
        }
      }}
    >
      <video
        ref={video}
        className="hero-video"
        src={project?.video || "/media/field.mp4"}
        poster={project?.image || "/media/field.jpg"}
        muted
        loop
        playsInline
        preload="none"
        onPlay={() => {
          setPlaying(true);
          waveTween.current?.play();
        }}
        onPause={() => {
          setPlaying(false);
          waveTween.current?.pause();
        }}
      />
      <div className="hero-top">
        <span>
          IN CONSTANT
          <br />
          EXPLORATION.
        </span>
        <div className="hero-controls">
          <button
            className="scene-button"
            title="Change artwork colour"
            aria-label="Change artwork colour"
            onClick={() => setVariation((value) => value + 1)}
          >
            <RotateCw size={18} />
          </button>
          <button
            className="scene-button"
            title={playing ? "Pause motion" : "Play motion"}
            aria-label={playing ? "Pause motion" : "Play motion"}
            onClick={() => {
              if (playing) {
                manuallyPaused.current = true;
                video.current?.pause();
              } else {
                manuallyPaused.current = false;
                video.current?.play().catch(() => undefined);
              }
            }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>
      <svg className="hero-wave" viewBox="0 0 1000 180" aria-hidden="true">
        {Array.from({ length: 58 }, (_, index) => (
          <path
            className="reactive-wave"
            key={index}
            d={`M ${index * 17 + 12} 90 q 4 ${(Math.sin(index * 0.3) * 65).toFixed(3)} 8 0`}
          />
        ))}
      </svg>
      <div className="hero-bottom">
        <span>
          001 / {project?.title || "Studio experiments"}
          <br />
          <span className="muted-white">An ongoing studio exploration</span>
        </span>
        <a
          href={project ? `/projects/${project.slug}` : "/projects"}
          className="hero-project"
          aria-label={project ? `Enter ${project.title}` : "Explore projects"}
        >
          Enter the project <ArrowUpRight size={20} />
        </a>
      </div>
    </section>
  );
}
