import type { Product, ProductId } from "./types";

/**
 * Product knowledge for the four products our interviewees used.
 * Usage steps and timelines are general guidance for each active ingredient;
 * the app always tells people to follow their pack label.
 */
export const PRODUCTS: Record<ProductId, Product> = {
  sa_wash: {
    name: "1% Salicylic Acid Body Wash",
    short: "SA Body Wash",
    icon: "🧴",
    category: "Body care",
    concerns: ["Strawberry legs / bumpy skin (KP)", "Body or back acne", "Rough, uneven texture"],
    markers: [
      { id: "bumps", label: "Bumps / rough texture", primary: true },
      { id: "breakouts", label: "Breakouts", primary: true },
      { id: "dryness", label: "Dryness or irritation", primary: false },
    ],
    keyStep: "Left it on for ~1 minute",
    steps: [
      { text: "Wet your skin in the shower." },
      { text: "Apply to the problem areas and gently massage into a lather." },
      { text: "Leave it on for about a minute before rinsing; the acid needs contact time to work.", key: true },
      { text: "Rinse with lukewarm (not hot) water." },
      { text: "Moisturise while skin is still slightly damp." },
    ],
    mistake: "Using it like a regular body wash and rinsing it off straight away. The salicylic acid barely gets time on the skin.",
    timeline: [
      { week: 1, text: "Skin starts to feel a little smoother to touch." },
      { week: 3, text: "Fewer new bumps and breakouts; texture looks more even." },
      { week: 6, text: "Clearer, smoother skin for most mild-to-moderate cases." },
      { week: 8, text: "Fair point to judge it. Long-standing bumps (KP) improve but need ongoing use. It's managed, not 'cured'." },
    ],
    judgeWeek: 8,
    earlyWeek: 2,
    typical: 0.5,
    lastsDays: 45,
    watch: "Tightness or dryness? Use it every other day and moisturise. Stinging or redness that doesn't settle: stop and check with a dermatologist.",
  },
  zpto: {
    name: "1% ZPTO Anti-Dandruff Shampoo",
    short: "ZPTO Shampoo",
    icon: "🫧",
    category: "Hair care",
    concerns: ["Dandruff / flakes", "Itchy scalp", "Oily, build-up scalp"],
    markers: [
      { id: "itch", label: "Scalp itch", primary: true },
      { id: "flakes", label: "Visible flakes", primary: true },
      { id: "dry", label: "Hair feels dry / thin", primary: false },
    ],
    keyStep: "Left it on the scalp 2–3 min",
    steps: [
      { text: "Wet hair and scalp thoroughly." },
      { text: "Apply to the scalp (not the lengths) and massage with fingertips." },
      { text: "Leave on the scalp for 2–3 minutes so the actives can work, then rinse.", key: true },
      { text: "Use conditioner on the lengths only, to keep hair soft." },
      { text: "Use 2–3 times a week; drop to 1–2 once flakes are under control." },
    ],
    mistake: "Washing it straight out like normal shampoo, or skipping conditioner and blaming the shampoo when lengths feel dry.",
    timeline: [
      { week: 1, text: "Itching usually eases first." },
      { week: 2, text: "Visibly fewer flakes; scalp feels cleaner." },
      { week: 4, text: "Fair point to judge it. Most people see clear control of flakes and itch." },
      { week: 6, text: "Maintenance mode: fewer washes a week keeps it in check." },
    ],
    judgeWeek: 4,
    earlyWeek: 1,
    typical: 0.55,
    lastsDays: 40,
    watch: "Lengths feel dry or thin? Keep the shampoo on the scalp and use conditioner on the ends.",
  },
  rollon: {
    name: "Underarm Roll-On",
    short: "Roll-On",
    icon: "🌿",
    category: "Body care",
    concerns: ["Underarm odour", "Heavy sweating", "Gym / active lifestyle"],
    markers: [
      { id: "odour", label: "Odour by evening", primary: true },
      { id: "sweat", label: "Sweaty feeling", primary: true },
      { id: "irritation", label: "Irritation or wetness on clothes", primary: false },
    ],
    keyStep: "Let it dry fully before dressing",
    steps: [
      { text: "Apply at night on clean, completely dry underarms." },
      { text: "1–2 swipes is enough; more doesn't work better." },
      { text: "Let it dry fully (about 5–6 minutes) before putting on clothes.", key: true },
      { text: "Close the cap tightly and keep it upright in your bag when travelling." },
      { text: "Shower as normal in the morning; protection keeps working." },
    ],
    mistake: "Putting clothes on while it's still wet, and expecting it to work like a spray deodorant applied in the morning.",
    timeline: [
      { week: 1, text: "Noticeable odour control through the day." },
      { week: 2, text: "Fair point to judge it. Consistent freshness and less sweat." },
      { week: 4, text: "Steady routine; one bottle typically lasts about 5 weeks." },
    ],
    judgeWeek: 2,
    earlyWeek: 1,
    typical: 0.6,
    lastsDays: 35,
    watch: "Itching or stinging? Don't apply right after shaving or on broken skin.",
  },
  biotin: {
    name: "Hair Health Biotin Gummies",
    short: "Biotin Gummies",
    icon: "🍓",
    category: "Nutrition",
    concerns: ["Hair fall / thinning", "Weak, brittle nails", "General hair health"],
    markers: [
      { id: "hairfall", label: "Hair fall (shedding)", primary: true },
      { id: "nails", label: "Weak / breaking nails", primary: true },
      { id: "pimples", label: "Breakouts", primary: false },
    ],
    keyStep: "Took today's dose",
    steps: [
      { text: "Take the dose on the label, at the same time every day (pair it with breakfast)." },
      { text: "Consistency matters more than anything; missed days delay results.", key: true },
      { text: "Store in a cool, dry place; heat makes gummies stick to each other and the wrapper." },
      { text: "Log any other hair changes (new shampoo, oil, diet) so you know what's actually working." },
    ],
    mistake: "Changing shampoo or routine at the same time, then not knowing which one made the difference.",
    timeline: [
      { week: 3, text: "Nails often feel stronger first." },
      { week: 6, text: "Shedding may start to slow." },
      { week: 12, text: "Fair point to judge it for hair. Hair grows slowly, so 3 months is the honest window." },
    ],
    judgeWeek: 12,
    earlyWeek: 4,
    typical: 0.4,
    lastsDays: 30,
    watch: "A few small pimples in the first weeks can happen with biotin and usually settle. If they persist, check with a doctor.",
  },
};

export const SCALE = ["None", "Mild", "Noticeable", "Bad", "Severe"];

export const CHANGES = [
  "New hair/skin product",
  "Stopped using it for days",
  "Diet change",
  "Stress / poor sleep",
  "Weather / travel",
  "Periods / hormones",
];

export const DURATIONS = ["Less than 3 months", "3–12 months", "More than a year"];
