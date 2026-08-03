/**
 * Nokma / MeghFarm product catalogue.
 * Every figure, size and flavour here is taken from the company brochure
 * and the product pamphlet — nothing is invented.
 */

export const BRAND = {
  name: 'MeghFarm',
  flagship: 'Nokma',
  tagline: 'Fresh From Meghalaya',
  promise: ['Rooted in Meghalaya', 'Crafted for the World'],
  parent: 'Muktidata Multipurpose Co-operative Society Ltd.',
  established: 2017,
  registration: 'NO. T-3 OF 2017-18',
  registeredOn: '30th June 2017',
  registeredUnder:
    'The Meghalaya Co-operative Societies Act, 1971 (vide adoption of Laws Order NO. I of 1971)',
  address: {
    unit: 'MeghFarm Processing Hub',
    sub: '(A Unit of Muktidata Multipurpose Co-Operative Society Ltd.)',
    lines: ['Khamari, P.O. Hollaidanga', 'Dist — West Garo Hills', 'Meghalaya — 794109'],
  },
  phone: '+91 93663 23755',
  email: 'sales@themeghfarm.com',
  care: 'customercare@themeghfarm.com',
  website: 'www.themeghfarm.com',
  social: {
    instagram: '@nokma_meghfarm',
    facebook: '@meghfarm',
  },
  fssai: '11725006000073',
};

/* ------------------------------------------------------------------ *
 *  Ice cream flavours — the showcase carousel
 * ------------------------------------------------------------------ */
export const FLAVOURS = [
  {
    id: 'vanilla',
    name: 'Vanilla',
    sub: 'Tantalise White Temptation',
    img: 'flavour-vanilla',
    note: 'Snow-soft, slow-churned, the quiet classic every scoop is measured against.',
    formats: ['IML Container 100 / 125 ML', 'Round & Oval Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'Mono Carton 750 / 1000 ML'],
    theme: { bg: '#F6EEDC', deep: '#5A4526', ink: '#3A2C15', accent: '#C89A4A', glow: '#FFF3D6' },
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    sub: 'Deep Cocoa Indulgence',
    img: 'flavour-chocolate',
    note: 'Dark, rounded cocoa folded through rich Meghalaya cream.',
    formats: ['Round Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'IML Container 125 ML'],
    theme: { bg: '#EADCCF', deep: '#4A2C1B', ink: '#33200F', accent: '#8A5230', glow: '#F6E3D2' },
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    sub: 'Blush of the Hills',
    img: 'flavour-strawberry',
    note: 'Bright berry brought forward with real fruit pulp, never essence alone.',
    formats: ['Round Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'IML Container 125 ML'],
    theme: { bg: '#F7DDE6', deep: '#7A2745', ink: '#511628', accent: '#D4436F', glow: '#FFE7EF' },
  },
  {
    id: 'orange',
    name: 'Orange',
    sub: 'Sunrise Citrus',
    img: 'flavour-orange',
    note: 'A clean citrus lift — the first light over the Garo Hills, in a scoop.',
    formats: ['Round Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'IML Container 125 ML'],
    theme: { bg: '#FCE3CC', deep: '#8A3D0E', ink: '#5E2708', accent: '#E2731C', glow: '#FFEBD6' },
  },
  {
    id: 'jackfruit',
    name: 'Jackfruit',
    sub: 'Jack-A-licious',
    img: 'flavour-jackfruit',
    note: 'Meghalaya’s own jackfruit — honeyed, tropical, unmistakably regional.',
    formats: ['IML Container 100 / 125 ML', 'Round & Oval Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'Cone 45 / 80 / 110 ML'],
    theme: { bg: '#F8EBBE', deep: '#6E5410', ink: '#4A3806', accent: '#C9A21B', glow: '#FFF6D0' },
  },
  {
    id: 'butterscotch',
    name: 'Butterscotch',
    sub: 'Golden Crunch',
    img: 'flavour-butterscotch',
    note: 'Burnt-sugar warmth with a crunch that keeps finding you.',
    formats: ['IML Container 100 / 125 ML', 'Round & Oval Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'Cone 45 / 80 / 110 ML'],
    theme: { bg: '#F7E4C3', deep: '#6B4412', ink: '#472C06', accent: '#C4832A', glow: '#FFEFD5' },
  },
  {
    id: 'pistachio',
    name: 'Pistachio',
    sub: 'Tantalise Green Crush',
    img: 'flavour-pistachio',
    note: 'Nut-forward and gently savoury — the grown-up scoop of the range.',
    formats: ['IML Container 100 / 125 ML', 'Round & Oval Tub 750 / 1000 ML', 'Cup 55 / 70 ML'],
    theme: { bg: '#E7EDCE', deep: '#3F4F1C', ink: '#2A360F', accent: '#7B9435', glow: '#F3F8DC' },
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    sub: 'Field-Grown Sweetness',
    img: 'flavour-pineapple',
    note: 'From the same raw pineapples we supply in bulk — straight into cream.',
    formats: ['Round Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'IML Container 125 ML'],
    theme: { bg: '#E3EEDF', deep: '#1F4A32', ink: '#12301F', accent: '#3E8055', glow: '#EFF8EC' },
  },
  {
    id: 'lychee',
    name: 'Lychee',
    sub: 'Orchard Blush',
    img: 'flavour-lychee',
    note: 'Delicate, floral, faintly rose — the most fragile flavour we make.',
    formats: ['Round Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'IML Container 125 ML'],
    theme: { bg: '#FADCE3', deep: '#7B2438', ink: '#54141F', accent: '#CF4560', glow: '#FFE9EE' },
  },
  {
    id: 'ginger',
    name: 'Ginger',
    sub: 'Hill Spice',
    img: 'flavour-ginger',
    note: 'Made with our own dehydrated ginger — warm, clean, quietly bold.',
    formats: ['Round Tub 750 / 1000 ML', 'Cup 55 / 70 ML', 'IML Container 125 ML'],
    theme: { bg: '#F6E2CE', deep: '#7A3E14', ink: '#52270A', accent: '#C1701E', glow: '#FFEDDA' },
  },
  {
    id: 'lemon',
    name: 'Lemon',
    sub: 'Sharp & Clear',
    img: 'flavour-lemon',
    note: 'A cold, clean finish — the palate-cleanser of the collection.',
    formats: ['Cup 55 / 70 ML'],
    theme: { bg: '#EEF2D8', deep: '#4B5518', ink: '#333C0B', accent: '#8A9A2C', glow: '#F7FAE6' },
  },
  {
    id: 'banana',
    name: 'Banana',
    sub: 'Local Harvest',
    img: 'flavour-banana',
    note: 'The same local bananas that become our chips — churned soft and sweet.',
    formats: ['Cup 55 / 70 ML'],
    theme: { bg: '#F7EFC8', deep: '#655412', ink: '#443806', accent: '#B79C1E', glow: '#FFFAD8' },
  },
];

/* ------------------------------------------------------------------ *
 *  Product universe — every format, floating in 3D
 * ------------------------------------------------------------------ */
export const UNIVERSE = [
  {
    id: 'family-tub',
    img: 'family-tub-jackfruit',
    name: 'Family Tub',
    kicker: 'IML Round Tub · Jackfruit',
    sizes: '750 ML · 1000 ML',
    blurb: 'Generous servings of happiness, made for parties, celebrations and joyful moments.',
    flavours: 'Vanilla · Butterscotch · Jackfruit · Pistachio · Chocolate · Strawberry · Pineapple · Lychee · Orange · Ginger',
    cat: 'ice-cream',
  },
  {
    id: 'iml-round',
    img: 'iml-round-butterscotch',
    name: 'IML Container',
    kicker: 'Round · Butterscotch',
    sizes: '100 ML · 125 ML',
    blurb: 'Small in size, rich in creamy satisfaction — crafted for everyday delight.',
    flavours: 'Vanilla · Pistachio · Butterscotch · Jackfruit',
    cat: 'ice-cream',
  },
  {
    id: 'iml-oval',
    img: 'iml-oval-pistachio',
    name: 'IML Container',
    kicker: 'Oval · Pistachio',
    sizes: '100 ML · 125 ML',
    blurb: 'The same everyday scoop in an oval format built for the freezer door.',
    flavours: 'Vanilla · Jackfruit · Butterscotch · Pistachio',
    cat: 'ice-cream',
  },
  {
    id: 'cup-vanilla',
    img: 'cup-strawberry',
    name: 'Cup Ice Cream',
    kicker: 'Single Serve · Strawberry',
    sizes: '55 ML · 70 ML',
    blurb: 'Individual portions packed with rich flavour — twelve flavours, one hand.',
    flavours: 'All 12 flavours',
    cat: 'ice-cream',
  },
  {
    id: 'cone-vanilla-wink',
    img: 'cone-vanilla-wink',
    name: 'Vanilla Wink',
    kicker: 'Cone',
    sizes: '45 · 80 · 110 ML',
    blurb: 'Crunchy cones filled with smooth, creamy delight.',
    flavours: 'Vanilla',
    cat: 'ice-cream',
  },
  {
    id: 'cone-choco-thunder',
    img: 'cone-choco-thunder',
    name: 'Choco Thunder',
    kicker: 'Cone',
    sizes: '45 · 80 · 110 ML',
    blurb: 'Deep cocoa through a wafer cone that keeps its snap.',
    flavours: 'Chocolate',
    cat: 'ice-cream',
  },
  {
    id: 'cone-jack-royale',
    img: 'cone-jack-royale',
    name: 'Jack Royale',
    kicker: 'Cone',
    sizes: '45 · 80 · 110 ML',
    blurb: 'Our jackfruit, given the cone it deserves.',
    flavours: 'Jackfruit',
    cat: 'ice-cream',
  },
  {
    id: 'cone-scotch',
    img: 'cone-scotch',
    name: 'Scotch Cone',
    kicker: 'Cone',
    sizes: '45 · 80 · 110 ML',
    blurb: 'Butterscotch and crunch, all the way to the tip.',
    flavours: 'Butterscotch',
    cat: 'ice-cream',
  },
  {
    id: 'cone-berry-giggles',
    img: 'cone-berry-giggles',
    name: 'Berry Giggles',
    kicker: 'Cone',
    sizes: '45 · 80 · 110 ML',
    blurb: 'Bright strawberry in the range’s most cheerful wrapper.',
    flavours: 'Strawberry',
    cat: 'ice-cream',
  },
  {
    id: 'carton-vanilla',
    img: 'carton-vanilla',
    name: 'Snow Drift Vanilla',
    kicker: 'Mono Carton',
    sizes: '750 ML · 1000 ML',
    blurb: 'Premium presentation paired with irresistible taste.',
    flavours: 'Vanilla',
    cat: 'ice-cream',
  },
  {
    id: 'carton-butterscotch',
    img: 'carton-butterscotch',
    name: 'Golden Crunch',
    kicker: 'Mono Carton',
    sizes: '750 ML · 1000 ML',
    blurb: 'Butterscotch, boxed for the table rather than the freezer aisle.',
    flavours: 'Butterscotch',
    cat: 'ice-cream',
  },
  {
    id: 'carton-jackfruit',
    img: 'carton-jackfruit',
    name: 'Jack-A-licious',
    kicker: 'Mono Carton',
    sizes: '750 ML · 1000 ML',
    blurb: 'Made with our own farm-fresh jackfruit.',
    flavours: 'Jackfruit',
    cat: 'ice-cream',
  },
  {
    id: 'drink-passion',
    img: 'drink-passion',
    name: 'Passion Fruit Drink',
    kicker: 'Nokma Beverages',
    sizes: '125 · 250 · 500 ML',
    blurb: 'Made from real fruit extracts, naturally refreshing.',
    flavours: 'Passion Fruit',
    cat: 'drinks',
  },
  {
    id: 'drink-pineapple',
    img: 'drink-pineapple',
    name: 'Pineapple Drink',
    kicker: 'Nokma Beverages',
    sizes: '125 · 320 · 500 ML',
    blurb: 'Meghalaya-grown pineapple, pressed and bottled.',
    flavours: 'Pineapple',
    cat: 'drinks',
  },
  {
    id: 'drink-lychee',
    img: 'drink-lychee',
    name: 'Lychee Drink',
    kicker: 'Nokma Beverages',
    sizes: '125 · 250 · 500 ML',
    blurb: 'Floral, light and cold — freshness in every sip.',
    flavours: 'Lychee',
    cat: 'drinks',
  },
  {
    id: 'water-bottle',
    img: 'water-bottle',
    name: 'Packaged Drinking Water',
    kicker: 'Blink · Shots · Squad',
    sizes: '250 ML · 500 ML · 1 L',
    blurb: 'Clean, refreshing water for every lifestyle — no compromise on purity.',
    flavours: 'Nokma BLINK 250 ML · SHOTS 500 ML · SQUAD 1 L',
    cat: 'drinks',
  },
  {
    id: 'chips-crispy',
    img: 'chips-crispy',
    name: 'Crispy Banana Chips',
    kicker: 'TE·RIK',
    sizes: '30 · 60 · 85 · 105 G',
    blurb: 'Crispy chips prepared from carefully selected local bananas.',
    flavours: 'Crispy',
    cat: 'chips',
  },
  {
    id: 'chips-plain',
    img: 'chips-plain',
    name: 'Plain Banana Chips',
    kicker: 'TE·RIK',
    sizes: '30 · 60 · 85 · 105 G',
    blurb: 'Light, crunchy and naturally delicious — hygienically packed for freshness.',
    flavours: 'Plain',
    cat: 'chips',
  },
  {
    id: 'spice-turmeric',
    img: 'spice-turmeric',
    name: 'Turmeric Powder',
    kicker: 'Dehydrated',
    sizes: '100 G · 500 G',
    blurb: 'Carefully processed to preserve aroma, colour and nutrition.',
    flavours: 'Chemical-free processing',
    cat: 'spices',
  },
  {
    id: 'spice-ginger',
    img: 'spice-ginger',
    name: 'Ginger Powder',
    kicker: 'Dehydrated',
    sizes: '100 G · 500 G',
    blurb: 'Pure flavour, traditional strength — naturally sourced.',
    flavours: 'Chemical-free processing',
    cat: 'spices',
  },
];

/* ------------------------------------------------------------------ *
 *  Category islands
 * ------------------------------------------------------------------ */
export const ISLANDS = [
  { id: 'ice-cream', label: 'Ice Cream', icon: '🍦', img: 'family-tub', count: '12 flavours · 6 formats', line: 'A Scoop of Meghalaya’s Finest' },
  { id: 'drinks', label: 'Drinks', icon: '🥤', img: 'drink-passion', count: '3 fruit drinks · 1 water', line: 'Freshness in Every Sip' },
  { id: 'chips', label: 'Banana Chips', icon: '🍌', img: 'chips-crispy', count: '2 variants · 4 pack sizes', line: 'Crunch with Authentic Flavour' },
  { id: 'spices', label: 'Spices', icon: '🌿', img: 'spice-turmeric', count: '2 powders · 2 pack sizes', line: 'Pure Flavour, Traditional Strength' },
];

/* ------------------------------------------------------------------ *
 *  Ingredient pipeline
 * ------------------------------------------------------------------ */
export const INGREDIENTS = [
  { id: 'fruit', label: 'Real Fruit Pulp', img: 'raw-pineapple', note: 'Jackfruit, pineapple, lychee, orange, banana — pulped, never powdered.' },
  { id: 'milk', label: 'Fresh Milk', img: null, note: 'The base of every scoop, brought in and standardised on site.', glyph: 'milk' },
  { id: 'butter', label: 'Rich Butter', img: null, note: 'Butter-fat is what carries flavour — ours is not thinned out.', glyph: 'butter' },
  { id: 'spice', label: 'Dehydrated Herbs', img: 'flakes-ginger', note: 'Our own ginger and turmeric, dried to hold aroma.' },
  { id: 'mix', label: 'Slow Churn', img: null, note: 'Blended, aged and churned until the texture holds a clean edge.', glyph: 'churn' },
  { id: 'done', label: 'Nokma Ice Cream', img: 'family-tub', note: 'Frozen at −18 °C and sealed. Indulgence inspired by nature.' },
];

/* ------------------------------------------------------------------ *
 *  Impact counters
 * ------------------------------------------------------------------ */
export const IMPACT = [
  { id: 'flavours', value: 12, suffix: '', label: 'Ice Cream Flavours', note: 'From Vanilla to Jackfruit' },
  { id: 'lines', value: 5, suffix: '', label: 'Product Categories', note: 'Ice cream, drinks, water, chips and spices' },
  { id: 'formats', value: 30, suffix: '+', label: 'Pack Formats & Sizes', note: 'Cups, cones, tubs, cartons, bottles, pouches' },
  { id: 'since', value: 2024, suffix: '', label: 'Building Since', label2: 'Nokma production began in 2024', note: 'MeghFarm Processing Hub', raw: true },
];

export const IMPACT_PILLARS = [
  'Local sourcing',
  'Employment generation',
  'Women participation',
  'Sustainable livelihoods',
  'Regional brand development',
];

/* ------------------------------------------------------------------ *
 *  Why Nokma
 * ------------------------------------------------------------------ */
export const WHY = [
  { t: '100% Locally Sourced', d: 'Every ingredient traced back to Meghalaya’s farming communities.' },
  { t: 'Farmer-Led Cooperative', d: 'Owned and steered through a registered co-operative society.' },
  { t: 'Women Empowerment Focused', d: 'Women and youth participation built into how the enterprise runs.' },
  { t: 'Ethical & Sustainable', d: 'Value added at source, so the margin stays in the region.' },
  { t: 'Modern Processing Facility', d: 'A purpose-built hub in West Garo Hills with cold-chain capability.' },
  { t: 'Premium Quality Assurance', d: 'Strict control over taste, nutrition, hygiene, freshness and packaging.' },
];

export const OPPORTUNITIES = [
  'Distributor Enquiries',
  'Retail Partnerships',
  'Institutional Supply',
  'Bulk Orders',
  'Private Label',
];
