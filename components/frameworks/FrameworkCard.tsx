"use client";
import "./frameworks.css";
import { useId } from "react";
import type { Framework } from "@/lib/frameworks/registry";
import { TOOLS } from "./tools";

/** One interactive framework. Admins see held frameworks with the reason they are held. */
export function FrameworkCard({ fw, admin = false, heading = "h3" }: { fw: Framework; admin?: boolean; heading?: "h1" | "h2" | "h3" }) {
  const uid = useId().replace(/:/g, "");
  const Tool = TOOLS[fw.id];
  const H = heading;
  return (
    <section className="fw fw-card" id={fw.id} aria-labelledby={`${uid}-title`}>
      {fw.status === "held" && admin && <p className="fw-held">Held · admins only. {fw.hold}</p>}
      <div className="fw-head">
        <H id={`${uid}-title`} className="fw-title">{fw.title}</H>
        <span className="fw-type">{fw.type}</span>
      </div>
      <p className="fw-concept">{fw.concept}</p>
      {Tool ? <Tool uid={uid} /> : <p className="fw-flag">[NOLAN: this framework is not built yet]</p>}
      <p className="fw-private">What you type here stays on this screen. Nothing is sent or saved.</p>
      {admin && fw.elsewhere.length > 0 && <p className="fw-private">Admin · also proposed for: {fw.elsewhere.join(" · ")}</p>}
    </section>
  );
}

/** The frameworks placed in a module, under one heading. Renders nothing when none are placed. */
export function FrameworkShelf({ frameworks, admin = false, eyebrowClass, title = "Practice" }: { frameworks: Framework[]; admin?: boolean; eyebrowClass?: string; title?: string }) {
  if (!frameworks.length) return null;
  return (
    <div>
      <p className={eyebrowClass}>{title}</p>
      <div style={{ marginTop: 20 }}>{frameworks.map((f) => <FrameworkCard key={f.id} fw={f} admin={admin} />)}</div>
    </div>
  );
}
