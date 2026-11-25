// The interactive frameworks, ported from the Graphics & Frameworks library (claude.ai artifact 889hvvfa3LqDc8YPGguNrd, 22 Nov 2026).
// Concepts are Nolan's words from the Creator Board. Nothing here is invented; open items stay as [NOLAN: …].
// Placements were proposed on 22 Nov 2026 and take effect when Nolan approves the pull request that ships them.
// Learners type into these tools in their own browser only. Nothing they enter is sent or stored.

export type FrameworkStatus = "live" | "held";

export interface Framework {
  id: string;
  title: string;
  type: string;
  concept: string;
  status: FrameworkStatus;
  /** Shown to admins only, on held frameworks. */
  hold?: string;
  /** AAPEX module numbers this framework is placed in (shown inside those modules). */
  aapex: number[];
  /** Placements in programs not yet on the site. Admin-only. */
  elsewhere: string[];
}

export const FRAMEWORKS: Framework[] = [
  { id: "dome-citadel", title: "The Dome and the Citadel", type: "Build · self-assessment", status: "live", aapex: [23], elsewhere: ["IDENTITY · Storied Self"],
    concept: "The Dome is the given: what is true about you, what won't change, your worldview. Under it you raise your own Citadel in mason's order: four Cornerstones (the fundamentals everything is squared to), the Keystone (your why; pull it and the arch falls), then the Capstone (the build sealed into one coherent philosophy). Square below, circle above." },
  { id: "code-creative-process", title: "Capture, Organize, Distill, Express", type: "Sequence · build", status: "live", aapex: [15], elsewhere: ["CRAFT · Creative Combination"],
    concept: "The creative process, with expression as the point: “earth is heaven's expression, and if you do not express you do not embody heaven.” Walk one idea through all four stages." },
  { id: "hcos-radar", title: "Human Capital Operating System", type: "Self-assessment", status: "held", aapex: [], elsewhere: ["AAPEX cohort intake and exit (before/after)"],
    hold: "The Creator Board says to check HCOS against the Human Capital hold before it is used in a published lesson.",
    concept: "HCOS is the operating system for a human in a complex system: how a person thinks, acts, trains, recovers, decides and leads. Rate yourself on each from 1 to 10. The shape shows where the system is thin." },
  { id: "optimization-stack", title: "The Optimization Stack", type: "Conceptual map", status: "live", aapex: [], elsewhere: ["Facilitator training", "Human Capital Audit (offer)"],
    concept: "Three disciplines stacked under the work. Behavioral psychology engineers the behavior, boundary-aware applied psychology spots patterns that work against a person early and knows when to refer out, and anthropology designs the rituals and identity that keep a group from decaying. Tap a layer." },
  { id: "career-types", title: "Career Types and Career Stacks", type: "Self-assessment", status: "live", aapex: [18, 11], elsewhere: [],
    concept: "Careers are vehicles for compounding your skills, time, energy and leverage, not identities. Stop asking “what job should I get?” and ask “what career structure best compounds my assets?” Pick up to three types to build your stack. Stacks beat single labels." },
  { id: "magnetic-brand-ladder", title: "The Magnetic Brand Ladder", type: "Self-assessment", status: "live", aapex: [], elsewhere: ["SIGNET · Signet's Substance", "RHETORIC · Marketing's Meaning"],
    concept: "Visibility, then Credibility, Connection, Trust and Conversion. Each rung rests on the one below it: reach is a vanity metric, while trust and conversion are outcome metrics. Rate each rung from 1 to 5. The ladder breaks at the first weak rung from the bottom." },
  { id: "content-gps", title: "Content GPS", type: "Build", status: "live", aapex: [], elsewhere: ["RHETORIC · Marketing's Meaning"],
    concept: "Most creators post at random. A Content GPS maps every piece to a purpose: Attraction, Trust, Conversion or Retention, with every piece tied to a next step. Route your planned pieces and see where the map is empty." },
  { id: "founder-identity", title: "Founder Identity Infrastructure", type: "Build", status: "live", aapex: [9], elsewhere: ["SIGNET · Signet's Substance"],
    concept: "Link three things so they read as one: your identity, your personal brand and your company brand. People buy people, not logos. Then write the message in four moves: who you were, what you learned, how you solve the problem, why it matters to them." },
  { id: "life-awareness-equation", title: "The Life-Awareness Equation", type: "Conceptual map", status: "live", aapex: [], elsewhere: ["SOVEREIGNTY · Authored Life"],
    concept: "Life awareness plus self awareness equals comprehension. Comprehension becomes narrative and engagement, which becomes resilience, and the chain continues up to polymathy and sovereignty. Reveal it one term at a time." },
  { id: "four-domains", title: "Four Domains of Pursuit", type: "Self-assessment", status: "live", aapex: [21], elsewhere: ["VISION · Adjacent Possible"],
    concept: "Influence, Innovation, Invention and Intuition: the four domains of pursuit in a purpose, and the four cautions of being swept away in a world that doesn't have your best intentions at heart. Each card has a pursuit side and a caution side. Flip it to name yours." },
  { id: "focus-funnel", title: "The Focus Funnel Pressure Test", type: "Build · self-assessment", status: "live", aapex: [2], elsewhere: ["VALUES · Ranked Goods"],
    concept: "Pour everything you are involved in through four filters: Involvements narrow to Subjects, Subjects to Concepts, and Concepts to Values. What comes out the bottom is what your focus is actually for. Write one item per line at each level." },
  { id: "voyage-path", title: "The Voyage Path", type: "Self-assessment · sequence", status: "live", aapex: [10], elsewhere: ["SEQUENCE · Sequence Not Speed"],
    concept: "The path to obtaining anything, as a voyage or a cruise-missile flight: aim, launch, arrive, establish, conquer, analyze, impact, create, refine, repeat. Tap the stage you are at on your current pursuit." },
  { id: "goal-system-tree", title: "Goals Become Systems", type: "Build", status: "live", aapex: [2], elsewhere: ["HABIT · Environment Design"],
    concept: "Goals broken into milestones make up systems. Forget the goal at the end so you can focus on the work in front of you, and make sure the whole system is rooted in your personal values and full of incentives and fast tracks that make it attractive to you." },
  { id: "personal-operating-system", title: "Personal Operating System", type: "Build", status: "live", aapex: [18], elsewhere: ["SEQUENCE · Goals Governed"],
    concept: "A plan reverse-engineered from your 20, 10 and 5-year achievements and outcomes. Set realistic SMART goals periodically, set milestones between them to audit your trajectory, and place the strategy between milestones, carried out through tactics. Start at the far end and work back to today." },
  { id: "type-b-day-type-a-life", title: "Type B Through Your Day, Type A About Your Life", type: "Self-assessment", status: "live", aapex: [], elsewhere: ["RHYTHM · Right-Sized Rhythm"],
    concept: "Be flexible and adaptive as the day comes, but ruthless in your vision and organized in your goals and desired outcomes. Tap the grid where you actually live right now." },
  { id: "funding-chain", title: "The Funding Chain", type: "Sequence · build", status: "live", aapex: [], elsewhere: ["CAPITAL · Assets Active"],
    concept: "Earn money to fund the work that develops the assets that fuel the purpose and passion that build the vision. Each step pays for the next. Name yours at every step, and find the step where the chain breaks." },
  { id: "management-3c", title: "Do They Need Management?", type: "Assessment", status: "live", aapex: [], elsewhere: ["BEARING · Compliance vs. Commitment", "DOCTRINE · Written Standard"],
    concept: "You only need management for three reasons: a lack of competence (they need skill), a lack of context (they need information) or a lack of conscientiousness (they simply don't care). Context can be delivered and competence can be trained; a lack of conscientiousness means you will always need management. Otherwise management is structured synthesis: team your teams to converse in order and the management disappears." },
  { id: "velocity-equation", title: "The Velocity Equation", type: "Self-assessment", status: "live", aapex: [], elsewhere: ["ENTERPRISE · Pure Productivity"],
    concept: "Anti-fragility means eliminating process. Radical prioritization plus extreme transparency equals velocity. Rate your team or your own week on both terms." },
  { id: "versatilist", title: "The Versatilist", type: "Self-assessment", status: "held", aapex: [19], elsewhere: ["EVOLUTION · Brain and Brawn"],
    hold: "The Creator Board flags a Polymath/Generalist naming hold on this term.",
    concept: "A versatilist is roughly 60 percent competent across multiple domains. Product and distribution are the exceptions: those are the founding team's arteries and need more than 60. List your domains and set your honest competence in each." },
  { id: "efficacy-standard", title: "The Efficacy Standard", type: "Assessment", status: "live", aapex: [], elsewhere: ["SIGNET · Intentions Insufficient", "JUDGMENT · Costly Cognition"],
    concept: "Manifest Efficacy is the discipline of reality over rhetoric. Intentions are insufficient: a decision, policy or plan is judged by what survives five tests. “No outputs without accounting; no accounting without sunlight.”" },
  { id: "paired-contrasts", title: "Being vs. Doing", type: "Self-assessment", status: "live", aapex: [], elsewhere: ["HARVEST · Hollow Harvest", "IDENTITY · Compressed Self"],
    concept: "Three pairs people confuse: human being vs. human doing, accomplishment vs. success, wealth vs. wisdom. When worth is output, you have confused the verb for the person. Set where your life actually leans on each pair." },
  { id: "identity-house", title: "Identity Is a House of Many Rooms", type: "Self-assessment", status: "live", aapex: [17], elsewhere: ["IDENTITY · Foreclosed Identity"],
    concept: "If your identity is a single room and it floods, burns or is destroyed, where is your identity? Lost. If you have many well-built rooms and you renovate them over the years, no single disaster takes the self. Build your house, then run the fire test." },
  { id: "humor-bridge", title: "Humor Connects Two Frameworks", type: "Practice", status: "live", aapex: [], elsewhere: ["CRAFT · Creative Combination"],
    concept: "Humor is taking two separate frameworks and finding the connection between them. It is the first stage of mathematics, and the same skill that makes a polymath: a good comedian applies polymathy to life more easily. Pick two unrelated things and build the bridge." },
  { id: "evidence-strength-ladder", title: "The Evidence-Strength Ladder", type: "Practice", status: "live", aapex: [], elsewhere: ["JUDGMENT · Uncertainty Tolerance", "COGNITION (proposed sub-program)"],
    concept: "Choose the strongest verb your design and data actually justify: proves, demonstrates, shows, indicates, suggests, may/might. Write a claim, climb the ladder, and stop at the rung your evidence can hold." },
];

export const frameworkById = (id: string) => FRAMEWORKS.find((f) => f.id === id) ?? null;

/** Frameworks a viewer may open. Held ones are visible to admins only. */
export const visibleFrameworks = (admin: boolean) => FRAMEWORKS.filter((f) => f.status === "live" || admin);

/** Frameworks placed in an AAPEX module, in placement order. */
export const frameworksForModule = (n: number, admin: boolean) => visibleFrameworks(admin).filter((f) => f.aapex.includes(n));
