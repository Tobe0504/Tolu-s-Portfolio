/* ═══════════════════════════════════════════════════════════════════════════
   Project data. Everything the site shows about a project lives here.

   Content comes from Tolulope's CV and her own case studies. Only what
   those state is written as fact. Where they are silent the field is left
   out rather than filled in, and the page hides what is missing — so
   anything that reads as a gap is waiting on her, not on the code. Known
   gaps: no testimonials (`quote` and `reviews` are omitted everywhere,
   since a quote attributed to a real colleague cannot be invented) and no
   performance figures (the `outcome` badges count only what the source
   itself lists — steps covered, banks compared — never impact).

   Screens: drop real pictures of the work into a project's `images` and
   they fill the second section of its page. Each entry is a URL and a
   name, and the name shows as the caption underneath:

     images: [
       { src: 'assets/shots/rewards-balance.webp', name: 'The points balance' },
       { src: 'https://res.cloudinary.com/.../redeem.png', name: 'Redeeming' }
     ]

   Local paths and full URLs both work. One image fills the width, two sit
   side by side, and from three the first leads with the rest underneath.
   Leave the array empty and the page falls back to the project's record
   sleeve — a picture of nothing is worse than no picture.

   Audio: each project has a `track`. With `audio: null` the player
   synthesises an original loop in the browser from the track's key and
   bpm, so every disc plays something without shipping anyone else's music.
   Point `audio` at a file and the player uses that instead, taking the
   real length from the file. The titles are part of the record-sleeve
   conceit, not claims about the work.

   Artwork: each project renders a generated disc label from `art` below.
   To print a real square on the disc instead, add
   `discImage: 'assets/discs/<slug>.webp'`. The label covers the whole
   square, so keep anything important more than a third of the way out from
   the centre, where the hole and the clear hub are.
   ═══════════════════════════════════════════════════════════════════════════ */

export const COLLECTIONS = [{ id: "work", label: "Selected work" }];

export const PROJECTS = [
  {
    slug: "wisecare",
    collection: "work",
    name: "WiseCare",
    year: "2026",
    role: "Product Designer",
    client: "WiseCare",
    industry: "Healthcare, AI",
    platform: "Web and mobile",
    status: "Product design, end to end",
    summary:
      "An AI-first healthcare platform built to help patients reach the right care faster. I defined the product structure and user flows, designed the end-to-end experience for both patients and providers, and wrote the UX copy and interaction patterns.",
    challenge:
      "Getting care is slow, fragmented and confusing. People who feel unwell do not know where to start; teleconsultation and in-person care both exist but are disconnected from each other; and every decision is left to the patient with no guidance. The cost is delayed care, poor decisions, and inefficiency for providers.",
    approach: [
      {
        title: "Medi AI, the way in",
        text: "An intelligent health assistant as the first point of contact. It reads what someone is actually worried about and sends them to the right next step — self-care, a teleconsultation, or in-person support — instead of leaving them to guess.",
      },
      {
        title: "TeleDoc, care without the journey",
        text: "Remote consultation with licensed professionals, so distance, waiting rooms and limited availability stop deciding who gets seen.",
      },
      {
        title: "DocOnDoor, care that comes to you",
        text: "On-demand visits for the situations that genuinely need someone present, booked to a location rather than a hospital queue.",
      },
      {
        title: "AI Doc, for the other side of the desk",
        text: "Decision support for the clinicians themselves, so high workloads and short appointments do not come at the cost of accuracy.",
      },
    ],
    outcome: [
      { value: "4", label: "services in one ecosystem" },
      { value: "AI", label: "as the first point of contact" },
    ],
    images: [],
    track: {
      title: "The Right Door First",
      duration: "2:36",
      key: "F",
      bpm: 92,
      audio: null,
    },
    links: {},
    art: {
      bg: "#2b6cb0",
      bg2: "#1a4a7a",
      fg: "#f2f7fc",
      accent: "#5ec8e0",
      motif: "pulse",
    },
  },
  {
    slug: "fcmb-group",
    collection: "work",
    name: "FCMB Group",
    year: "2025",
    role: "UX design",
    client: "FCMB Group Plc",
    industry: "Banking, Corporate",
    platform: "Web",
    status: "Live at fcmbgroup.com",
    summary:
      "The corporate and investor site for FCMB Group Plc, the holding company behind the bank. One site carrying the group at a glance, its subsidiaries, the board, sustainability, investor relations and the press room — with a live share price on the front page.",
    challenge:
      "A group site is read by people who want completely different things from it on the same day: an investor after the quarterly numbers, a journalist after a statement, a candidate after a job, a customer who simply typed the bank into a search box. It has to make a group of separate businesses legible as one, without burying any of them.",
    approach: [
      {
        title: "The group at a glance",
        text: "The structure leads with what the group is and which businesses sit inside it, so the shape of the company is the first thing a visitor understands.",
      },
      {
        title: "Investors get their own floor",
        text: "Reports, share information, corporate governance, events and contacts are gathered in one place rather than scattered through the site.",
      },
      {
        title: "The number on the front",
        text: "The share price sits on the homepage with its open, last and change, so the thing investors check most often takes no navigation at all.",
      },
    ],
    outcome: [{ value: "Live", label: "at fcmbgroup.com" }],
    images: [],
    track: {
      title: "One Vision",
      duration: "2:48",
      key: "C",
      bpm: 86,
      audio: null,
    },
    links: { live: "https://fcmbgroup.com" },
    art: {
      bg: "#5b3a8e",
      bg2: "#3b2560",
      fg: "#f6f2fb",
      accent: "#c9a8f0",
      motif: "cards",
    },
  },
  {
    slug: "rewards",
    collection: "work",
    name: "Rewards",
    year: "2025",
    role: "UX/UI design",
    client: "First City Monument Bank",
    industry: "Digital banking",
    platform: "FCMB mobile app",
    status: "Live on the FCMB mobile app",
    summary:
      "A points-based rewards system on the FCMB mobile app. I contributed the UX and UI design, working on how customers understand the points they hold and find their way around the rewards experience.",
    challenge:
      "A rewards balance is only worth what a customer can make sense of. Points have to be legible at a glance — what you have, what moves them, and where to go next — inside a banking app people open to do something else.",
    approach: [
      {
        title: "Make the balance plain",
        text: "The points a customer holds are stated first and stated simply, so the answer to “where am I?” never has to be looked for.",
      },
      {
        title: "Give the rewards a route",
        text: "Navigation through the rewards experience was designed as a path rather than a menu, so there is always an obvious next move.",
      },
      {
        title: "Build it to be reused",
        text: "Patterns from the work feed the design system, so the next team to touch rewards inherits them instead of redrawing them.",
      },
    ],
    outcome: [{ value: "Live", label: "on the FCMB mobile app" }],
    images: [],
    track: {
      title: "Points, Plainly Put",
      duration: "2:24",
      key: "A",
      bpm: 96,
      audio: null,
    },
    links: {},
    art: {
      bg: "#c1502e",
      bg2: "#8f3520",
      fg: "#fbf1e4",
      accent: "#f2b33d",
      motif: "rings",
    },
  },
  {
    slug: "target-savings",
    collection: "work",
    name: "Target Savings",
    year: "2025",
    role: "UX design",
    client: "First City Monument Bank",
    industry: "Digital banking",
    platform: "FCMB mobile app",
    status: "Designed, savings plan journeys",
    summary:
      "Savings plan journeys end to end: creating a plan, setting recurring contributions, choosing a duration, resuming a plan that was paused, and reading back the savings history. The work was about making schedules and plan status clear at the moment they matter.",
    challenge:
      "Saving on a schedule asks a customer to keep a promise to themselves over months. The journeys have to say plainly what has been agreed, what state a plan is in today, and how to start again after a break — otherwise a paused plan quietly becomes an abandoned one.",
    approach: [
      {
        title: "Say what the schedule is",
        text: "Duration and recurring contributions are set and then restated in the customer’s own terms, so the commitment is never implied.",
      },
      {
        title: "Make status readable",
        text: "A plan’s state is carried through every screen that touches it, so “where is this plan?” is answered before it is asked.",
      },
      {
        title: "Leave the door open",
        text: "Resuming a paused plan is designed as its own journey rather than an edge case, and the savings history reads as a record, not a ledger.",
      },
    ],
    outcome: [
      { value: "5", label: "journeys designed" },
      { value: "Resume", label: "designed in, not bolted on" },
    ],
    images: [],
    track: {
      title: "Put Down, Picked Up",
      duration: "3:02",
      key: "D",
      bpm: 88,
      audio: null,
    },
    links: {},
    art: {
      bg: "#3f6f5c",
      bg2: "#27493d",
      fg: "#f3f7f2",
      accent: "#e9c46a",
      motif: "waves",
    },
  },
  {
    slug: "csl-activation",
    collection: "work",
    name: "CSL Activation",
    year: "2025",
    role: "UX design",
    client: "First City Monument Bank",
    industry: "Digital banking, Trading",
    platform: "FCMB digital banking",
    status: "Designed, activation flows",
    summary:
      "Activation flows for a CSL trading account. The journey covers what data is shared with CSL, explicit consent for sharing it, read-only prefilled details, the additional information still needed, and confirmation that the account is active.",
    challenge:
      "Activating a trading account moves a customer’s details from the bank to a third party. Consent for that cannot be buried in a tick box: the customer has to be able to see exactly what is being shared, agree to it deliberately, and know when it is done.",
    approach: [
      {
        title: "Show what is being shared",
        text: "The data going to CSL is listed before the customer is asked about it, rather than described after the fact.",
      },
      {
        title: "Ask explicitly",
        text: "Consent is its own step with its own decision, so agreeing is an act rather than a side effect of continuing.",
      },
      {
        title: "Prefill, but read-only",
        text: "Details the bank already holds arrive filled in and locked, so the customer only types what is genuinely still needed — and then gets told plainly that the account is active.",
      },
    ],
    outcome: [
      { value: "5", label: "steps, sharing to confirmation" },
      { value: "Explicit", label: "consent, as its own step" },
    ],
    images: [],
    track: {
      title: "Said Out Loud",
      duration: "2:41",
      key: "E",
      bpm: 104,
      audio: null,
    },
    links: {},
    art: {
      bg: "#4a5a8c",
      bg2: "#2e3a63",
      fg: "#f2f4fb",
      accent: "#e8a0a0",
      motif: "route",
    },
  },
  {
    slug: "tier-upgrade",
    collection: "work",
    name: "Tier Upgrade",
    year: "2025",
    role: "Competitive UX analysis",
    client: "First City Monument Bank",
    industry: "Digital banking",
    platform: "Research, stakeholder summary",
    status: "Delivered to stakeholders",
    summary:
      "A competitive UX analysis of account tier upgrades. I compared the journey across FCMB, Wema, Moniepoint, OPay and PalmPay, then organised the steps and screens into a stakeholder summary used to push journey improvements.",
    challenge:
      "Everyone had an opinion on where the tier upgrade journey lost people, and no shared picture to argue with. The work was to replace opinions with the journeys themselves, laid out so they could be compared step by step.",
    approach: [
      {
        title: "Walk all five",
        text: "The upgrade journey was taken end to end on FCMB, Wema, Moniepoint, OPay and PalmPay, capturing each step and screen as it came.",
      },
      {
        title: "Line the steps up",
        text: "Screens were organised by the step they belong to rather than by the bank they came from, which is what makes the gaps visible.",
      },
      {
        title: "Hand it over as a summary",
        text: "The comparison was written up for stakeholders, so the findings could drive improvements rather than sit in a file.",
      },
    ],
    outcome: [
      { value: "5", label: "banks compared" },
      { value: "1", label: "stakeholder summary" },
    ],
    images: [],
    track: {
      title: "Side By Side",
      duration: "2:58",
      key: "G",
      bpm: 92,
      audio: null,
    },
    links: {},
    art: {
      bg: "#7a4b78",
      bg2: "#4e2d4d",
      fg: "#f8f1f7",
      accent: "#f0b9d4",
      motif: "grid",
    },
  },
];

export const byCollection = (id) => PROJECTS.filter((p) => p.collection === id);
export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug);
