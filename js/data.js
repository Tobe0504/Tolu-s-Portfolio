/* ═══════════════════════════════════════════════════════════════════════════
   Project data. Everything the site shows about a project lives here.

   ⚠ Placeholder content. Names, clients, figures and testimonials are
   invented to show the layout at full density. Replace before launch.

   Artwork: each project renders a generated disc label and hero image
   from `art` below. To use real images instead, add them to the project:
     discImage: 'assets/discs/<slug>.webp'    square, printed on the disc
     heroImage: 'assets/heroes/<slug>.webp'   landscape, the project page
   The disc label covers the whole square; keep anything important more
   than a third of the way out from the centre, where the hole and the
   clear hub are.
   ═══════════════════════════════════════════════════════════════════════════ */

export const COLLECTIONS = [
  { id: 'work',    label: 'Client work'  },
  { id: 'explore', label: 'Explorations' }
];

export const PROJECTS = [
  /* ── client work ───────────────────────────────────────────────────── */
  {
    slug: 'kora', collection: 'work', name: 'Kora', year: '2025',
    role: 'Lead Product Designer', team: ['Ifeoma Nwosu', 'Tunde Bakare', 'Six engineers'],
    industry: 'Fintech, Payments', platform: 'Web dashboard', timeline: '7 months',
    tagline: ['Nine', 'days', 'to', 'forty', 'minutes.'],
    summary: 'Kora processes payments for 40,000 Nigerian businesses, and signing one up took nine days and a phone call. We rebuilt onboarding end to end: live application status, verification that runs while you type, and rejections that ask for the one thing that was wrong instead of starting over.',
    client: 'Kora Payments', status: 'Shipped, in production',
    challenge: 'Support said the form was confusing. Session replays said otherwise: people finished the form fine, then waited. Documents sat in a review queue nobody owned, and every follow-up restarted the clock. Nine days of silence looked identical to rejection.',
    approach: [
      { title: 'Show the queue', text: 'Every application got a live status, a named reviewer and an honest estimate. Uncertainty was doing more damage than the wait.' },
      { title: 'Verify while they type', text: 'Bank and tax IDs check against the registry as they are entered, so 70% of applications never reach a human.' },
      { title: 'Fail forward', text: 'A rejected document asks for the one thing that was wrong instead of restarting the application.' }
    ],
    outcome: [{ value: '40 min', label: 'median time to approval' }, { value: '+31%', label: 'applications completed' }, { value: '−64%', label: 'onboarding support tickets' }],
    gallery: [
      { caption: 'The status board every applicant now sees', variant: 'detail' },
      { caption: 'Verification states, from typed to cleared', variant: 'system' },
      { caption: 'The dashboard in a merchant’s back office', variant: 'context' }
    ],
    quote: { text: 'Nine days of silence was the product. We just never saw it that way until the replays were on the wall.', who: 'Ifeoma Nwosu, Head of Product' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Ifeoma Nwosu, Kora', quote: 'Obvious in hindsight', stars: 5 },
      { source: 'Merchant, Ikeja', quote: 'Live before my tea went cold', stars: 5 }
    ],
    art: { bg: '#c1502e', bg2: '#8f3520', fg: '#fbf1e4', accent: '#f2b33d', motif: 'cards' }
  },
  {
    slug: 'azza', collection: 'work', name: 'Azza', year: '2024',
    role: 'Product Designer', team: ['Dr. Amara Obi', 'Kemi Adeyemi'],
    industry: 'Health, Maternal care', platform: 'Android, USSD', timeline: '11 months',
    tagline: ['Care', 'that', 'works', 'offline.'],
    summary: 'A pregnancy and postnatal companion carried by 120,000 mothers across Lagos and Ibadan. Designed first for a four-year-old Android phone on a patchy network, with a USSD fallback for the mothers who have neither.',
    client: 'Azza Health', status: 'Shipped, 120,000 users',
    challenge: 'The mothers who most needed the app had the least to run it on: four-year-old Android phones, shared between households, on a network that drops for hours. Every existing option assumed a good phone and a live connection.',
    approach: [
      { title: 'Design for the worst phone first', text: 'Every screen was built and tested on a 2019 budget Android before it was allowed near a newer one.' },
      { title: 'Make offline the normal state', text: 'Visits, reminders and notes are written locally and sync when they can. Nothing waits for a connection to be useful.' },
      { title: 'Leave a route for no phone at all', text: 'A USSD path carries the appointment reminders for mothers who share a handset or have none.' }
    ],
    outcome: [{ value: '120k', label: 'mothers reached' }, { value: '82%', label: 'complete all four visits' }, { value: '3.1 MB', label: 'install size' }],
    gallery: [
      { caption: 'Visit timeline, legible at arm’s length', variant: 'detail' },
      { caption: 'The component set, sized for small screens', variant: 'system' },
      { caption: 'The app on the phone it was designed for', variant: 'context' }
    ],
    quote: { text: 'She designed for the phone our mothers actually own, not the one in the pitch deck.', who: 'Dr. Amara Obi, Clinical Lead' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Dr. Amara Obi, Azza', quote: 'Designed for the real phone', stars: 5 },
      { source: 'Health Tech Weekly', quote: 'Quietly radical', stars: 4.5 }
    ],
    art: { bg: '#6e7a52', bg2: '#414a2c', fg: '#f4f1e6', accent: '#e8d9a8', motif: 'pulse' }
  },
  {
    slug: 'loomfolk', collection: 'work', name: 'Loomfolk', year: '2024',
    role: 'Design Lead', team: ['Daniel Achebe', 'Sade Ogunleye'],
    industry: 'Commerce, Textiles', platform: 'Web, Seller tools', timeline: '9 months',
    tagline: ['Made', 'by', 'hand.', 'Sold', 'worldwide.'],
    summary: 'A marketplace connecting West African weavers and dyers to buyers abroad without flattening what makes the work worth buying. GMV grew 3.4 times in two quarters after the seller tools shipped.',
    client: 'Loomfolk', status: 'Shipped, growing',
    challenge: 'Marketplaces flatten what they sell. Every listing template turned handwoven cloth into a product tile, and buyers abroad could not tell a six-week aso-oke from a printed copy. Sellers were competing on price against machines.',
    approach: [
      { title: 'Put the maker in the listing', text: 'Each piece carries who wove it, where, and how long it took. The provenance is the product.' },
      { title: 'Photograph for cloth, not for grids', text: 'A shoot kit and template built around drape and weave, run by sellers on their own phones.' },
      { title: 'Price the time honestly', text: 'Seller tools that work backwards from hours and materials instead of matching the cheapest listing.' }
    ],
    outcome: [{ value: '3.4×', label: 'GMV in two quarters' }, { value: '+58%', label: 'average order value' }, { value: '210', label: 'makers onboarded' }],
    gallery: [
      { caption: 'Provenance, carried through the listing', variant: 'detail' },
      { caption: 'The photo template sellers shoot to', variant: 'system' },
      { caption: 'Browsing the market from abroad', variant: 'context' }
    ],
    quote: { text: 'We stopped competing with printed copies the week the provenance shipped.', who: 'Daniel Achebe, Founder' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Daniel Achebe, Loomfolk', quote: 'The questions we should have asked', stars: 5 },
      { source: 'Craft & Commerce', quote: 'Respects the maker', stars: 5 }
    ],
    art: { bg: '#f2b33d', bg2: '#c07c1c', fg: '#2a1a0c', accent: '#c1502e', motif: 'weave' }
  },
  {
    slug: 'tidemark', collection: 'work', name: 'Tidemark', year: '2023',
    role: 'Senior Product Designer', team: ['Marta Silva', 'Joon Park'],
    industry: 'Climate, Risk analytics', platform: 'Web, Data visualisation', timeline: '8 months',
    tagline: ['Flood', 'maps', 'for', 'people,', 'not', 'scientists.'],
    summary: 'Turning flood and heat modelling into something a city planner can act on in an afternoon. The hard part was never the data. It was deciding what not to show.',
    client: 'Tidemark Climate', status: 'Shipped',
    challenge: 'The models were sound and nobody could act on them. Planners were handed probability surfaces and return periods, then asked to decide which drains to fund. The hard part was never the data. It was deciding what not to show.',
    approach: [
      { title: 'Answer the question actually asked', text: 'Which streets flood, how often, and what does fixing them cost. The model sits behind that, not in front of it.' },
      { title: 'One map, three certainties', text: 'Confidence is drawn into the map rather than buried in a footnote, so planners can argue with it.' },
      { title: 'Make it exportable', text: 'Findings leave as a one-page brief a council can put in front of a committee.' }
    ],
    outcome: [{ value: '1 afternoon', label: 'from data to a funded decision' }, { value: '14', label: 'councils using it' }, { value: '−40%', label: 'time to produce a brief' }],
    gallery: [
      { caption: 'Risk, drawn with its own uncertainty', variant: 'detail' },
      { caption: 'The legend, rebuilt for non-scientists', variant: 'system' },
      { caption: 'The one-page brief a committee sees', variant: 'context' }
    ],
    quote: { text: 'The first version showed everything we knew. The version that worked showed what to do.', who: 'Marta Silva, Product Lead' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Marta Silva, Tidemark', quote: 'Raised the floor for the team', stars: 5 },
      { source: 'Urban Futures', quote: 'Finally, legible risk', stars: 4.5 }
    ],
    art: { bg: '#37447a', bg2: '#1b2340', fg: '#eef1fb', accent: '#f2b33d', motif: 'waves' }
  },
  {
    slug: 'oja', collection: 'work', name: 'Oja', year: '2023',
    role: 'Product Designer', team: ['Bola Hassan', 'Chidi Eze'],
    industry: 'Commerce, Grocery', platform: 'iOS, Android', timeline: '6 months',
    tagline: ['The', 'market,', 'in', 'your', 'pocket.'],
    summary: 'Same-day grocery delivery built around how Lagos actually shops: haggling, substitutions and a trusted trader who knows your order. Repeat orders rose 41% after we let people save a trader, not just a basket.',
    client: 'Oja', status: 'Shipped',
    challenge: 'Grocery apps assume a fixed catalogue and a fixed price. Lagos markets assume neither. Substitutions are normal, prices move daily, and the relationship is with a trader rather than a shop.',
    approach: [
      { title: 'Make the trader the unit', text: 'You save a trader, not a basket. Reorders start from the person who knows what you buy.' },
      { title: 'Design substitution as a conversation', text: 'A photo and a price from the trader, accepted or declined in a tap, before anything is charged.' },
      { title: 'Show today’s price, plainly', text: 'Prices carry the date they were set, so nothing feels like a bait and switch.' }
    ],
    outcome: [{ value: '+41%', label: 'repeat orders' }, { value: '4.6', label: 'average trader rating' }, { value: '−22%', label: 'order cancellations' }],
    gallery: [
      { caption: 'Substitutions, agreed before checkout', variant: 'detail' },
      { caption: 'Trader profiles and saved baskets', variant: 'system' },
      { caption: 'The market, in a pocket', variant: 'context' }
    ],
    quote: { text: 'It behaves like our market. That is the whole compliment.', who: 'Bola Hassan, Founder' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Bola Hassan, Oja', quote: 'Felt like our market', stars: 5 },
      { source: 'TechCabal', quote: 'Local, not localised', stars: 4.5 }
    ],
    art: { bg: '#2f7d5b', bg2: '#17442f', fg: '#eff7ef', accent: '#f5c451', motif: 'bars' }
  },
  {
    slug: 'harbor', collection: 'work', name: 'Harbor', year: '2022',
    role: 'Product Designer', team: ['Yemi Alade', 'Fleet operations'],
    industry: 'Logistics, Freight', platform: 'Web, Driver app', timeline: '10 months',
    tagline: ['Every', 'truck,', 'one', 'screen.'],
    summary: 'A dispatch console and driver app for a freight network moving goods between Apapa port and the North. Dispatchers went from six spreadsheets and a WhatsApp group to a single live board.',
    client: 'Harbor Freight Network', status: 'Shipped',
    challenge: 'Dispatchers ran the network from six spreadsheets and a WhatsApp group. Nobody could say where a truck was without three phone calls, and drivers were paid on paperwork that arrived days late.',
    approach: [
      { title: 'One live board', text: 'Every load, truck and driver in a single view that updates itself, built from what dispatchers already tracked by hand.' },
      { title: 'Give the driver two buttons', text: 'The driver app does arrival and departure well and nothing else. Anything more went unused on the road.' },
      { title: 'Close the paperwork loop', text: 'Proof of delivery is a photo at the gate, which is also what triggers the driver’s pay.' }
    ],
    outcome: [{ value: '−73%', label: 'status phone calls' }, { value: '2 days', label: 'faster driver payment' }, { value: '340', label: 'trucks on the board' }],
    gallery: [
      { caption: 'The dispatch board, mid-morning', variant: 'detail' },
      { caption: 'Load states from booked to paid', variant: 'system' },
      { caption: 'The driver app at the gate', variant: 'context' }
    ],
    quote: { text: 'Our dispatchers go home on time. I did not expect that to be a design outcome.', who: 'Yemi Alade, Operations Director' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Yemi Alade, Harbor', quote: 'Our dispatchers go home on time', stars: 5 },
      { source: 'Supply Lines', quote: 'Unglamorous, essential', stars: 4.5 }
    ],
    art: { bg: '#1f2a33', bg2: '#0e1418', fg: '#e9eef2', accent: '#ff7a3d', motif: 'grid' }
  },
  {
    slug: 'nuri', collection: 'work', name: 'Nuri', year: '2022',
    role: 'Product Designer', team: ['Aisha Bello', 'Teachers of Kano'],
    industry: 'Education, K–12', platform: 'Tablet', timeline: '7 months',
    tagline: ['Lessons', 'that', 'wait', 'for', 'you.'],
    summary: 'A tablet learning app for classrooms with forty children and one charger. Lessons download overnight, progress syncs when it can, and teachers see who is stuck without looking over every shoulder.',
    client: 'Nuri Learning', status: 'Shipped',
    challenge: 'Forty children, one charger and a connection that arrives at night. Classroom software written for well-resourced schools failed on all three, and teachers had no way to see who was stuck without walking the room.',
    approach: [
      { title: 'Download at night, teach by day', text: 'Lessons arrive overnight and run entirely offline. Progress queues and syncs whenever it can.' },
      { title: 'Build a teacher’s glance', text: 'One screen that shows who is stuck and on what, readable from the front of the room.' },
      { title: 'Survive the battery', text: 'Low-power reading mode and a state that never loses a child’s place mid-lesson.' }
    ],
    outcome: [{ value: '96%', label: 'lessons completed offline' }, { value: '41', label: 'classrooms in Kano' }, { value: '8 hrs', label: 'battery per charge' }],
    gallery: [
      { caption: 'The teacher’s glance view', variant: 'detail' },
      { caption: 'Lesson states, online and off', variant: 'system' },
      { caption: 'One tablet, shared between four', variant: 'context' }
    ],
    quote: { text: 'It was built for the classroom we have, not the one in the brochure.', who: 'Aisha Bello, Programme Lead' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Aisha Bello, Nuri', quote: 'Built for the classroom we have', stars: 5 },
      { source: 'EdSurge Africa', quote: 'Patient technology', stars: 4.5 }
    ],
    art: { bg: '#e4572e', bg2: '#a6361a', fg: '#fff4ea', accent: '#2b2d42', motif: 'type' }
  },
  {
    slug: 'vesta', collection: 'work', name: 'Vesta', year: '2021',
    role: 'UX Designer', team: ['Kunle Ade', 'Claims team'],
    industry: 'Insurance, Claims', platform: 'Web, Mobile web', timeline: '5 months',
    tagline: ['Claims', 'without', 'the', 'paperwork.'],
    summary: 'Motor insurance claims used to mean three branch visits. Now a photo, a location and a signature on a phone, with a named adjuster who replies within the hour.',
    client: 'Vesta Insurance', status: 'Shipped',
    challenge: 'A motor claim meant three branch visits and a folder of photocopies, usually on the worst week of someone’s year. Most claims stalled not on fraud checks but on a missing document nobody had asked for clearly.',
    approach: [
      { title: 'Ask once, properly', text: 'A guided capture that collects what the adjuster actually needs, in the order they read it.' },
      { title: 'Name the human', text: 'Every claim shows its adjuster and a response time, so the claimant knows who has it.' },
      { title: 'Make the worst day calmer', text: 'Plain wording, saved progress, and no dead ends that send someone back to a branch.' }
    ],
    outcome: [{ value: '1 visit', label: 'down from three' }, { value: '−51%', label: 'claims stalled on documents' }, { value: '62 min', label: 'median first response' }],
    gallery: [
      { caption: 'Guided capture, step by step', variant: 'detail' },
      { caption: 'Claim states and their wording', variant: 'system' },
      { caption: 'Filing from the roadside', variant: 'context' }
    ],
    quote: { text: 'Claims stopped being the thing we apologised for.', who: 'Kunle Ade, Claims Director' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Kunle Ade, Vesta', quote: 'Claims we can be proud of', stars: 4.5 },
      { source: 'Insure Weekly', quote: 'A calmer worst day', stars: 4.5 }
    ],
    art: { bg: '#8a6bbd', bg2: '#4f3a78', fg: '#f6f1ff', accent: '#ffd166', motif: 'rings' }
  },

  /* ── explorations ──────────────────────────────────────────────────── */
  {
    slug: 'danfo', collection: 'explore', name: 'Danfo', year: '2025',
    role: 'Concept, Design', team: ['Self-initiated'],
    industry: 'Transit, Wayfinding', platform: 'Mobile concept', timeline: '6 weeks',
    tagline: ['A', 'map', 'for', 'a', 'city', 'without', 'one.'],
    summary: 'What would a transit map for Lagos danfo buses look like, when the routes are shouted rather than printed? A self-initiated study in mapping informal systems without pretending they are formal.',
    client: 'Self-initiated', status: 'Concept',
    challenge: 'Lagos moves on danfo buses whose routes are shouted, not printed. Every attempt to map them borrows the language of formal metro systems, which promises a precision the network does not have.',
    approach: [
      { title: 'Map the corridors, not the timetable', text: 'Thick certain lines where the route is reliable, frayed ones where it is negotiated.' },
      { title: 'Name stops the way riders do', text: 'Landmarks and calls, not official street names nobody uses.' },
      { title: 'Let the map admit doubt', text: 'A visual grammar for “usually”, which is what most of the network actually is.' }
    ],
    outcome: [{ value: '96', label: 'corridors mapped' }, { value: '6 weeks', label: 'end to end' }, { value: '1', label: 'very patient conductor' }],
    gallery: [
      { caption: 'The corridor grammar', variant: 'detail' },
      { caption: 'Line weights and what they promise', variant: 'system' },
      { caption: 'The folded pocket map', variant: 'context' }
    ],
    quote: { text: 'A map that admits what it does not know is more useful than one that pretends.', who: 'Project notes' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Personal project', quote: 'Mapping the unmapped', stars: 5 },
      { source: 'Design Week Africa', quote: 'Shortlisted, Concept', stars: 4.5 }
    ],
    art: { bg: '#f4c430', bg2: '#d99a00', fg: '#121212', accent: '#121212', motif: 'route' }
  },
  {
    slug: 'kin', collection: 'explore', name: 'Kin', year: '2024',
    role: 'Concept, Design', team: ['Self-initiated'],
    industry: 'Family, Social', platform: 'iOS concept', timeline: '4 weeks',
    tagline: ['Stay', 'close', 'across', 'oceans.'],
    summary: 'A private family space for households split between Lagos, London and Houston. Voice notes first, time zones built in, and a grandmother mode with exactly three buttons.',
    client: 'Self-initiated', status: 'Concept',
    challenge: 'Family apps assume everyone is fluent, online and in the same time zone. Mine is split across Lagos, London and Houston, and the person who most wants to be included is the least served by a feed.',
    approach: [
      { title: 'Voice before text', text: 'Voice notes are the default, because that is how the family actually talks.' },
      { title: 'Build time zones into the room', text: 'Every message carries what time it was there, so nobody wakes anyone at 3am.' },
      { title: 'Three buttons for grandma', text: 'A mode that does record, send and listen, and hides everything else.' }
    ],
    outcome: [{ value: '3', label: 'buttons in grandma mode' }, { value: '4 weeks', label: 'concept to prototype' }, { value: '1', label: 'very honest test user' }],
    gallery: [
      { caption: 'The family room', variant: 'detail' },
      { caption: 'Grandma mode, reduced to three', variant: 'system' },
      { caption: 'Across three time zones', variant: 'context' }
    ],
    quote: { text: 'If my grandmother cannot use it in ten seconds, it does not ship.', who: 'Project notes' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Personal project', quote: 'Three buttons for grandma', stars: 5 },
      { source: 'Dribbble', quote: 'Tender and practical', stars: 4.5 }
    ],
    art: { bg: '#d98b73', bg2: '#a85a45', fg: '#fff5f0', accent: '#3d2b25', motif: 'pulse' }
  },
  {
    slug: 'specimen', collection: 'explore', name: 'Specimen', year: '2024',
    role: 'Type, Layout', team: ['Self-initiated'],
    industry: 'Typography', platform: 'Print, Web', timeline: '3 weeks',
    tagline: ['Letters', 'with', 'a', 'home', 'town.'],
    summary: 'A type specimen for a display face drawn from hand-painted Lagos shop signs. Printed as a folded poster and a single-page site that sets every glyph in a real sign it came from.',
    client: 'Self-initiated', status: 'Published',
    challenge: 'Lagos shop signs are painted by hand and disappear when the shop repaints. The letterforms are a design tradition nobody is archiving, and no digital face carries their logic.',
    approach: [
      { title: 'Collect before drawing', text: 'Two hundred photographs across six neighbourhoods, sorted by hand and by sign painter.' },
      { title: 'Draw the logic, not the copy', text: 'A face built from the rules the painters use, rather than a trace of any one sign.' },
      { title: 'Publish the provenance', text: 'Every glyph is shown beside the sign it came from, with its address.' }
    ],
    outcome: [{ value: '218', label: 'signs photographed' }, { value: '1', label: 'display face drawn' }, { value: '6', label: 'neighbourhoods' }],
    gallery: [
      { caption: 'A glyph beside its source sign', variant: 'detail' },
      { caption: 'The full character set', variant: 'system' },
      { caption: 'The folded specimen poster', variant: 'context' }
    ],
    quote: { text: 'Every glyph has an address. That felt like the point.', who: 'Project notes' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Personal project', quote: 'Every glyph has an address', stars: 5 },
      { source: 'Typewolf', quote: 'Site of the day', stars: 4.5 }
    ],
    art: { bg: '#f2ede4', bg2: '#d9d0c1', fg: '#141414', accent: '#c1502e', motif: 'type' }
  },
  {
    slug: 'motion', collection: 'explore', name: 'Motion Notes', year: '2023',
    role: 'Motion, Prototyping', team: ['Self-initiated'],
    industry: 'Interaction design', platform: 'Web', timeline: 'Ongoing',
    tagline: ['Small', 'moves,', 'kept.'],
    summary: 'A running sketchbook of interaction details: springs, stagger timings and the gap between a thing responding and a thing feeling responsive. Each note ships as a working prototype.',
    client: 'Self-initiated', status: 'Ongoing',
    challenge: 'Motion advice is either physics lectures or screenshots of easing curves. Neither tells you why a transition feels wrong, and neither survives contact with a real interface.',
    approach: [
      { title: 'Ship the prototype, not the gif', text: 'Every note is a working thing you can interrupt mid-animation, because that is where motion fails.' },
      { title: 'Name the feeling first', text: 'Each note starts from what was wrong (sluggish, twitchy, cheap) and works back to the numbers.' },
      { title: 'Keep the failures in', text: 'The version that did not work is shown beside the one that did.' }
    ],
    outcome: [{ value: '41', label: 'notes published' }, { value: '100%', label: 'runnable in the browser' }, { value: '0', label: 'gifs' }],
    gallery: [
      { caption: 'A note, mid-interruption', variant: 'detail' },
      { caption: 'Timing and spring reference', variant: 'system' },
      { caption: 'The notebook index', variant: 'context' }
    ],
    quote: { text: 'Interruption is the test. Everything looks fine if you never touch it.', who: 'Project notes' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Personal project', quote: 'Forty notes and counting', stars: 5 },
      { source: 'Codrops', quote: 'Collected and generous', stars: 4.5 }
    ],
    art: { bg: '#101010', bg2: '#000000', fg: '#f2f2f2', accent: '#7cf2c9', motif: 'rings' }
  },
  {
    slug: 'palette', collection: 'explore', name: 'Adire Palette', year: '2022',
    role: 'Colour, Systems', team: ['Self-initiated'],
    industry: 'Design systems', platform: 'Figma, Tokens', timeline: '5 weeks',
    tagline: ['Colour', 'from', 'cloth.'],
    summary: 'A colour system extracted from indigo adire cloth, tested for contrast and published as open design tokens. Twelve blues that all pass, which turned out to be the hard part.',
    client: 'Self-initiated', status: 'Published',
    challenge: 'Indigo adire cloth holds a dozen distinguishable blues. Sampling them naively produced a palette where half the pairs failed contrast, which makes a beautiful system useless in an interface.',
    approach: [
      { title: 'Sample from real cloth', text: 'Photographed under controlled light, then converted rather than eyedropped from a screenshot.' },
      { title: 'Tune in a perceptual space', text: 'Lightness fixed on a scale, hue and chroma adjusted around it, so steps read evenly.' },
      { title: 'Ship it as tokens', text: 'Published with contrast results attached, so nobody has to re-test the pairs.' }
    ],
    outcome: [{ value: '12', label: 'blues, all passing' }, { value: 'AA', label: 'minimum on every pair' }, { value: '5 weeks', label: 'from cloth to tokens' }],
    gallery: [
      { caption: 'The scale, cloth to token', variant: 'detail' },
      { caption: 'Every pair, with its contrast', variant: 'system' },
      { caption: 'The system in an interface', variant: 'context' }
    ],
    quote: { text: 'Twelve blues that pass was harder than a hundred that look nice.', who: 'Project notes' },
    links: { prototype: '#', live: '#' },
    reviews: [
      { source: 'Personal project', quote: 'Twelve blues that pass', stars: 5 },
      { source: 'Figma Community', quote: 'Top 10 of the month', stars: 4.5 }
    ],
    art: { bg: '#23395b', bg2: '#0f1e33', fg: '#eaf0ff', accent: '#9fb8e8', motif: 'weave' }
  }
];

export const byCollection = id => PROJECTS.filter(p => p.collection === id);
export const bySlug = slug => PROJECTS.find(p => p.slug === slug);
