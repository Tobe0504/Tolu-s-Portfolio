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
