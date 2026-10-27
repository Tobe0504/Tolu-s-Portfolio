/* ═══════════════════════════════════════════════════════════════════════════
   Project data. Everything the site shows about a project lives here.

   Content comes from Tolulope's CV (Oct 2026). Only what the CV states is
   written as fact. Where it is silent the field is left out rather than
   filled in, and the page hides what is missing — so anything that reads as
   a gap is waiting on her, not on the code. Known gaps:

     · no testimonials: `quote` and `reviews` are omitted everywhere, since
       a quote attributed to a real colleague cannot be invented
     · no performance figures: the `outcome` badges count only what the CV
       itself lists (steps covered, banks compared), never impact
     · no real screens: `gallery` captions describe the screens the CV
       names, but the images under them are still generated artwork

   Audio: each project has a `track`. With `audio: null` the player
   synthesises an original loop in the browser from the track's key and bpm,
   so every disc plays something without shipping anyone else's music. The
   titles are part of the record-sleeve conceit, not claims about the work.

   Artwork: each project renders a generated disc label and hero image
   from `art` below. To use real images instead, add them to the project:
     discImage: 'assets/discs/<slug>.webp'    square, printed on the disc
     heroImage: 'assets/heroes/<slug>.webp'   landscape, the project page
   The disc label covers the whole square; keep anything important more
   than a third of the way out from the centre, where the hole and the
   clear hub are.
   ═══════════════════════════════════════════════════════════════════════════ */

export const COLLECTIONS = [{ id: 'work', label: 'Selected work' }];

export const PROJECTS = [
  {
    slug: 'rewards', collection: 'work', name: 'Rewards', year: '2025',
    role: 'UX/UI design', client: 'First City Monument Bank',
    industry: 'Digital banking', platform: 'FCMB mobile app',
    status: 'Live on the FCMB mobile app',
    tagline: ['Points', 'you', 'can', 'actually', 'read.'],
    summary: 'A points-based rewards system on the FCMB mobile app. I contributed the UX and UI design, working on how customers understand the points they hold and find their way around the rewards experience.',
    challenge: 'A rewards balance is only worth what a customer can make sense of. Points have to be legible at a glance — what you have, what moves them, and where to go next — inside a banking app people open to do something else.',
    approach: [
      { title: 'Make the balance plain', text: 'The points a customer holds are stated first and stated simply, so the answer to “where am I?” never has to be looked for.' },
      { title: 'Give the rewards a route', text: 'Navigation through the rewards experience was designed as a path rather than a menu, so there is always an obvious next move.' },
      { title: 'Build it to be reused', text: 'Patterns from the work feed the design system, so the next team to touch rewards inherits them instead of redrawing them.' }
    ],
    outcome: [{ value: 'Live', label: 'on the FCMB mobile app' }],
    gallery: [
      { caption: 'The points balance, stated first', variant: 'detail' },
      { caption: 'Moving through the rewards experience', variant: 'system' },
      { caption: 'In the app people already have open', variant: 'context' }
    ],
    track: { title: 'Points, Plainly Put', duration: '2:24', key: 'A', bpm: 96, audio: null },
    links: {},
    art: { bg: '#c1502e', bg2: '#8f3520', fg: '#fbf1e4', accent: '#f2b33d', motif: 'rings' }
  },
  {
    slug: 'target-savings', collection: 'work', name: 'Target Savings', year: '2025',
    role: 'UX design', client: 'First City Monument Bank',
    industry: 'Digital banking', platform: 'FCMB mobile app',
    status: 'Designed, savings plan journeys',
    tagline: ['A', 'plan', 'you', 'can', 'put', 'down', 'and', 'pick', 'up.'],
    summary: 'Savings plan journeys end to end: creating a plan, setting recurring contributions, choosing a duration, resuming a plan that was paused, and reading back the savings history. The work was about making schedules and plan status clear at the moment they matter.',
    challenge: 'Saving on a schedule asks a customer to keep a promise to themselves over months. The journeys have to say plainly what has been agreed, what state a plan is in today, and how to start again after a break — otherwise a paused plan quietly becomes an abandoned one.',
    approach: [
      { title: 'Say what the schedule is', text: 'Duration and recurring contributions are set and then restated in the customer’s own terms, so the commitment is never implied.' },
      { title: 'Make status readable', text: 'A plan’s state is carried through every screen that touches it, so “where is this plan?” is answered before it is asked.' },
      { title: 'Leave the door open', text: 'Resuming a paused plan is designed as its own journey rather than an edge case, and the savings history reads as a record, not a ledger.' }
    ],
    outcome: [
      { value: '5', label: 'journeys designed' },
      { value: 'Resume', label: 'designed in, not bolted on' }
    ],
    gallery: [
      { caption: 'Creating a plan and setting its duration', variant: 'system' },
      { caption: 'Recurring contributions, stated back', variant: 'detail' },
      { caption: 'Savings history, read as a record', variant: 'context' }
    ],
    track: { title: 'Put Down, Picked Up', duration: '3:02', key: 'D', bpm: 88, audio: null },
    links: {},
    art: { bg: '#3f6f5c', bg2: '#27493d', fg: '#f3f7f2', accent: '#e9c46a', motif: 'waves' }
  },
  {
    slug: 'csl-activation', collection: 'work', name: 'CSL Activation', year: '2025',
    role: 'UX design', client: 'First City Monument Bank',
    industry: 'Digital banking, Trading', platform: 'FCMB digital banking',
    status: 'Designed, activation flows',
    tagline: ['Consent,', 'said', 'out', 'loud.'],
    summary: 'Activation flows for a CSL trading account. The journey covers what data is shared with CSL, explicit consent for sharing it, read-only prefilled details, the additional information still needed, and confirmation that the account is active.',
    challenge: 'Activating a trading account moves a customer’s details from the bank to a third party. Consent for that cannot be buried in a tick box: the customer has to be able to see exactly what is being shared, agree to it deliberately, and know when it is done.',
    approach: [
      { title: 'Show what is being shared', text: 'The data going to CSL is listed before the customer is asked about it, rather than described after the fact.' },
      { title: 'Ask explicitly', text: 'Consent is its own step with its own decision, so agreeing is an act rather than a side effect of continuing.' },
      { title: 'Prefill, but read-only', text: 'Details the bank already holds arrive filled in and locked, so the customer only types what is genuinely still needed — and then gets told plainly that the account is active.' }
    ],
    outcome: [
      { value: '5', label: 'steps, sharing to confirmation' },
      { value: 'Explicit', label: 'consent, as its own step' }
    ],
    gallery: [
      { caption: 'The data shared with CSL, listed', variant: 'system' },
      { caption: 'Consent as a step of its own', variant: 'detail' },
      { caption: 'Prefilled, read-only, then confirmed', variant: 'context' }
    ],
    track: { title: 'Said Out Loud', duration: '2:41', key: 'E', bpm: 104, audio: null },
    links: {},
    art: { bg: '#4a5a8c', bg2: '#2e3a63', fg: '#f2f4fb', accent: '#e8a0a0', motif: 'route' }
  },
  {
    slug: 'tier-upgrade', collection: 'work', name: 'Tier Upgrade', year: '2025',
    role: 'Competitive UX analysis', client: 'First City Monument Bank',
    industry: 'Digital banking', platform: 'Research, stakeholder summary',
    status: 'Delivered to stakeholders',
    tagline: ['Five', 'banks,', 'one', 'journey,', 'side', 'by', 'side.'],
    summary: 'A competitive UX analysis of account tier upgrades. I compared the journey across FCMB, Wema, Moniepoint, OPay and PalmPay, then organised the steps and screens into a stakeholder summary used to push journey improvements.',
    challenge: 'Everyone had an opinion on where the tier upgrade journey lost people, and no shared picture to argue with. The work was to replace opinions with the journeys themselves, laid out so they could be compared step by step.',
    approach: [
      { title: 'Walk all five', text: 'The upgrade journey was taken end to end on FCMB, Wema, Moniepoint, OPay and PalmPay, capturing each step and screen as it came.' },
      { title: 'Line the steps up', text: 'Screens were organised by the step they belong to rather than by the bank they came from, which is what makes the gaps visible.' },
      { title: 'Hand it over as a summary', text: 'The comparison was written up for stakeholders, so the findings could drive improvements rather than sit in a file.' }
    ],
    outcome: [
      { value: '5', label: 'banks compared' },
      { value: '1', label: 'stakeholder summary' }
    ],
    gallery: [
      { caption: 'The upgrade journey, walked five times', variant: 'system' },
      { caption: 'Screens lined up by step', variant: 'detail' },
      { caption: 'The summary stakeholders worked from', variant: 'context' }
    ],
    track: { title: 'Side By Side', duration: '2:58', key: 'G', bpm: 92, audio: null },
    links: {},
    art: { bg: '#7a4b78', bg2: '#4e2d4d', fg: '#f8f1f7', accent: '#f0b9d4', motif: 'grid' }
  }
];

export const byCollection = id => PROJECTS.filter(p => p.collection === id);
export const bySlug = slug => PROJECTS.find(p => p.slug === slug);
