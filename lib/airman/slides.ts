import { SLIDE_MAP, BRIDGE_SLIDE, gap, type ModuleContent } from "./program";

export interface Slide { n: number; screen: string; activity: (typeof SLIDE_MAP)[number]["activity"]; heading: string; body: string[] }

/** Builds the 13 slides from imported module content. Missing content renders as a visible [NOLAN: …] gap. */
export function buildSlides(n: number, c: ModuleContent): Slide[] {
  const t = c.title ?? gap("module title");
  const body: Record<number, [string, string[]]> = {
    1: [t, [c.hook ?? c.quote ?? gap("hook line")]],
    2: [c.scene ?? "The scene", [c.reads ?? gap("what the image reads as")]],
    3: ["Expose", [c.arc ?? gap("the arc")]],
    4: ["Quick check", [c.quick_check?.question ?? gap("quick-check question and four options")]],
    5: ["Verse", [c.dlo ?? gap("the objective")]],
    6: ["Verse", c.learn_md ? c.learn_md.split(/\n{2,}/) : c.summary?.length ? c.summary : [gap("the teaching")]],
    7: ["Role-play", [c.roleplay ? `${c.roleplay.persona}: ${c.roleplay.hook}` : gap("role-play scenario: persona, hook, 3 beats, resolution")]],
    8: ["Bridge", [c.reflect_prompt ?? gap("the Bridge question")]],
    9: ["Unveil", ["Your Bridge answer, beside the reveal.", ...(c.summary?.slice(0, 1) ?? [])]],
    10: ["Remix", ["Rework your Bridge answer with what you know now."]],
    11: ["GENE", ["GENE reads your reasoning, not your answer. Up to three questions."]],
    12: ["Almanac", ["Seal this module into your Almanac."]],
    13: ["Interlude", ["The Closing Law, then today's rep."]],
  };
  return SLIDE_MAP.map((s) => ({ ...s, heading: body[s.n][0], body: body[s.n][1] }));
}

/** Server-enforced Bridge gate: slides after the Bridge are withheld until the Bridge is submitted. */
export const visibleSlides = (slides: Slide[], bridgeSubmitted: boolean) => (bridgeSubmitted ? slides : slides.filter((s) => s.n <= BRIDGE_SLIDE));
