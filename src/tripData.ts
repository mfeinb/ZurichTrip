import type { LucideIcon } from "lucide-react";
import {
  BadgeSwissFranc,
  CableCar,
  Camera,
  CheckCircle2,
  CloudSun,
  Compass,
  Hotel,
  MapPin,
  Mountain,
  Ship,
  Train,
  TramFront,
  Umbrella,
  Waves,
} from "lucide-react";

export type TransportMode =
  | "train"
  | "boat"
  | "cogwheel"
  | "cable-car"
  | "funicular"
  | "walk"
  | "tram";

export type Place = {
  id: string;
  name: string;
  kind: string;
  region: string;
  coordinates: [number, number];
  role: string;
  note: string;
  bestFor: string;
  allow: string;
  dontMiss: string[];
  practical: string;
  extraDetails: string[];
};

export type TransitLeg = {
  from: string;
  to: string;
  mode: TransportMode;
  duration: string;
  recommendedTime?: string;
  guidance: string;
};

export type TicketLink = {
  label: string;
  url: string;
};

export type TicketPlan = {
  primary: TicketLink;
  schedule?: TicketLink;
  operator?: TicketLink;
  cheapest: string;
  timing: string;
};

export type DecisionOption = {
  title: string;
  bestFor: string;
  tradeoff: string;
  logistics: string;
};

export type BookingReminder = {
  label: string;
  priority: "must" | "optional" | "verify";
};

export type PriceEstimate = {
  label: string;
  estimate: string;
  note: string;
};

export type DayPlan = {
  id: number;
  date: string;
  title: string;
  base: string;
  summary: string;
  jawDrop: string;
  effort: "Very easy" | "Easy scenic" | "Moderate optional";
  weather: string;
  route: string[];
  legs: TransitLeg[];
  highlights: string[];
  optionalAddOns?: string[];
  backup: string;
  priceEstimates: PriceEstimate[];
  reminders: BookingReminder[];
  decisions?: DecisionOption[];
};

export type PassOption = {
  name: string;
  fit: string;
  watchOut: string;
  goodFor: string;
};

export type SourceLink = {
  label: string;
  url: string;
};

const ticketLinks = {
  sbb: { label: "SBB timetable & tickets", url: "https://www.sbb.ch/en" },
  zentralbahn: {
    label: "Luzern-Interlaken Express",
    url: "https://www.zentralbahn.ch/en/experience/leisure/luzern-interlaken-express",
  },
  lakeLucerne: { label: "Lake Lucerne boats", url: "https://www.lakelucerne.ch/en/" },
  rigi: { label: "Rigi tickets & discounts", url: "https://www.rigi.ch/en/inform/prices/discounts-for-individuals" },
  blsBrienz: {
    label: "BLS Lake Brienz boats",
    url: "https://www.bls.ch/en/freizeit-und-ferien/ausfluege/schifffahrt-brienzersee",
  },
  schilthorn: { label: "Schilthorn timetable & tariff", url: "https://schilthorn.ch/en/Infos/Timetable__Tariff" },
  jungfrauTickets: {
    label: "Jungfraujoch tickets",
    url: "https://www.jungfrau.ch/en-gb/jungfraujoch-top-of-europe/buy-jungfraujoch-ticket/",
  },
  harder: { label: "Harder Kulm tickets", url: "https://www.jungfrau.ch/en-gb/harder-kulm/" },
};

export const places: Place[] = [
  {
    id: "zurich",
    name: "Zurich",
    kind: "City / rail base",
    region: "Start / finish",
    coordinates: [47.3769, 8.5417],
    role: "Arrival, work day, final base",
    note: "Keep the first afternoon light and use Zurich as the arrival buffer before the scenic outbound route.",
    bestFor: "A low-stress arrival base, final-night buffer, and easy evening walks without committing to a major excursion.",
    allow: "2-4 easy evening hours, or a fuller half-day if July 14 stays in Zurich.",
    dontMiss: ["Limmat river walk", "Lake Zurich promenade", "Niederdorf lanes", "Zurich HB logistics"],
    practical: "If work location allows, finish near Zurich HB so the evening train to Lucerne is low-stress.",
    extraDetails: [
      "Use Zurich as the trip's first logistical anchor: arrivals, luggage, pharmacy/snacks, and rail pass setup.",
      "The revised route avoids backtracking by putting Bern after the Oberland and before the final Zurich return.",
    ],
  },
  {
    id: "bern",
    name: "Bern",
    kind: "City stopover",
    region: "Final day option",
    coordinates: [46.948, 7.4474],
    role: "UNESCO old city stopover",
    note: "A natural stop between Interlaken and Zurich, which avoids a Zurich-to-Bern backtrack on the final day.",
    bestFor: "A compact final-night/final-morning city that feels different from Zurich and works well even in imperfect weather.",
    allow: "One evening plus 2-4 morning hours, depending on final Zurich departure timing.",
    dontMiss: ["Zytglogge clock tower", "Covered arcades", "Cathedral terrace", "Aare river viewpoints"],
    practical: "Sleep here after the Oberland if timing works; it makes Bern part of the return path rather than a separate day trip.",
    extraDetails: [
      "Bern is the best culture/city counterweight to the lake-and-mountain stretch, and it sits neatly between Interlaken and Zurich.",
      "The covered arcades make it a good poor-weather choice, so it can absorb a rainy final morning gracefully.",
    ],
  },
  {
    id: "bern-hotel",
    name: "Bern Backpackers Hotel Glocke",
    kind: "Booked hotel",
    region: "Bern Old City",
    coordinates: [46.9482, 7.4476],
    role: "Bern night: Jul 13",
    note: "Booked Bern old-city base near the clock tower and arcades.",
    bestFor: "A final night that puts the old-city walk directly outside the door before returning to Zurich.",
    allow: "Plan roughly 10-15 minutes from Bern station on foot or a very short tram hop with luggage.",
    dontMiss: ["Zytglogge nearby", "Covered arcades", "Old city cafes"],
    practical: "Use the hotel or station lockers for luggage during the Jul 14 old-city loop.",
    extraDetails: [
      "This makes Bern feel like part of the route instead of an extra day trip.",
      "The pin is close to the old-city core; confirm exact check-in details from the booking.",
    ],
  },
  {
    id: "bern-old-city",
    name: "Bern Old City",
    kind: "Historic walking area",
    region: "UNESCO old town core",
    coordinates: [46.9476, 7.4515],
    role: "Walking loop",
    note: "The arcaded old-town core, clock tower, cathedral terrace, cafes, and river viewpoints.",
    bestFor: "A compact, high-character walking loop that can flex from a quick stroll to a relaxed half-day.",
    allow: "2-4 hours, depending on cafes, viewpoints, and how much buffer you need before leaving Zurich.",
    dontMiss: ["Zytglogge", "Cathedral terrace", "Arcades", "Aare viewpoints"],
    practical: "Keep this loop light and return to Zurich early if you have a same-day flight or fixed departure.",
    extraDetails: [
      "This is the part of Bern that makes the day trip worthwhile, so prioritize the old city over trying to cover the whole city.",
      "Because the streets are compact and mostly walkable, it is easy to shorten the loop if the Zurich return becomes the priority.",
    ],
  },
  {
    id: "lucerne-hotel",
    name: "Capsule Hotel - Lucerne Old Town",
    kind: "Booked hotel",
    region: "Lucerne Old Town",
    coordinates: [47.0501, 8.3037],
    role: "Lucerne nights: Jul 9 and Jul 10",
    note: "Booked Lucerne base in the old town, west of the river and walkable to the station/lakefront.",
    bestFor: "A simple first base for the Zurich arrival night and the Rigi day, with old-town food and evening walks nearby.",
    allow: "Plan roughly 10-15 minutes on foot between Lucerne station/lakefront and the hotel, depending on luggage pace.",
    dontMiss: ["Old town lanes", "Chapel Bridge walk", "Easy station access"],
    practical: "After arriving from Zurich, check in first, then keep the evening to dinner and a short lake/old-town walk.",
    extraDetails: [
      "Use this as the luggage anchor before the Rigi loop.",
      "The pin is a planning marker; confirm the exact entrance from the hotel confirmation before arrival.",
    ],
  },
  {
    id: "lucerne",
    name: "Lucerne",
    kind: "Lake city / rail base",
    region: "Central Switzerland",
    coordinates: [47.0502, 8.3093],
    role: "Lake city and Rigi gateway",
    note: "Compact old town, lakefront, and easy boat connections make this the best first scenic base.",
    bestFor: "Classic Swiss lake scenery with very easy public-transport access to Rigi.",
    allow: "One overnight plus 2-3 hours for old town/lakefront outside the Rigi trip.",
    dontMiss: ["Chapel Bridge", "Lakefront promenade", "Old town", "Boat pier connections"],
    practical: "A hotel near the station or lake pier makes the Rigi day much smoother with luggage.",
    extraDetails: [
      "Lucerne is compact enough that you can treat it as both a base and an evening destination after Rigi.",
      "If the Rigi summit looks cloudy, Lucerne still offers lake views, museums, old-town walks, and boat options.",
    ],
  },
  {
    id: "vitznau",
    name: "Vitznau",
    kind: "Lake village transfer",
    region: "Lake Lucerne",
    coordinates: [47.0105, 8.4843],
    role: "Boat-to-cogwheel transfer",
    note: "Arrive by boat from Lucerne, then climb to Rigi by cogwheel railway.",
    bestFor: "The satisfying transfer point where the lake journey turns into the mountain climb.",
    allow: "Usually just the connection window, plus a little buffer for photos.",
    dontMiss: ["Lake Lucerne arrival", "Cogwheel station", "Waterfront views"],
    practical: "Match the Lucerne boat arrival to the cogwheel train; a missed connection can cost real summit time.",
    extraDetails: [
      "Vitznau is mostly a transfer, but it is the scenic hinge of the day: lake deck to mountain railway.",
      "Keep your connection loose enough for photos and restroom time, especially if traveling with luggage or larger groups.",
    ],
  },
  {
    id: "rigi",
    name: "Rigi Kulm",
    kind: "Mountain summit viewpoint",
    region: "Mt. Rigi",
    coordinates: [47.0569, 8.4851],
    role: "360-degree lake and Alp panorama",
    note: "A scenic payoff that is unusually simple by Swiss public transport.",
    bestFor: "A first big panorama without a difficult hike or complicated high-Alpine ticket decision.",
    allow: "1-2 hours at the top, longer if you want lunch or a gentle ridge walk.",
    dontMiss: ["Rigi Kulm summit", "Lake Lucerne views", "Short summit paths"],
    practical: "Bring a wind layer even in July; summit conditions can feel cooler than Lucerne.",
    extraDetails: [
      "Rigi is a forgiving first mountain day because you can get huge views without committing to a hard hike.",
      "The return can be adapted by time and pass coverage: back via Vitznau/Lucerne or, if useful, toward Arth-Goldau.",
    ],
  },
  {
    id: "interlaken",
    name: "Interlaken Ost",
    kind: "Rail and boat hub",
    region: "Bernese Oberland",
    coordinates: [46.6906, 7.8697],
    role: "Rail, boat, and mountain hub",
    note: "The transfer point for Lauterbrunnen, Lake Brienz, and Harder Kulm.",
    bestFor: "Connections, luggage strategy, Lake Brienz boats, and a quick Harder Kulm viewpoint.",
    allow: "30-60 minutes as a transfer, half-day if doing the lake/funicular combo.",
    dontMiss: ["Interlaken Ost", "Aare-side walk", "Boat pier", "Harder Kulm funicular base"],
    practical: "Interlaken Ost is the key station for Lauterbrunnen and Lake Brienz; avoid mixing it up with Interlaken West.",
    extraDetails: [
      "Think of Interlaken Ost as the switchboard, not necessarily the main place to sleep on this plan.",
      "It is where luggage storage, boat timing, Harder Kulm timing, and Zurich-return timing should be checked together.",
    ],
  },
  {
    id: "lauterbrunnen",
    name: "Lauterbrunnen",
    kind: "Alpine valley village",
    region: "Jungfrau region",
    coordinates: [46.5935, 7.9091],
    role: "Two-night mountain base",
    note: "Best valley atmosphere and central access to waterfalls, Mürren, Wengen, and Interlaken.",
    bestFor: "Sleeping inside the valley scenery and keeping both Mürren/Schilthorn and Wengen/Jungfraujoch reachable.",
    allow: "Two nights is ideal for weather flexibility; add spare time for waterfall walks.",
    dontMiss: ["Staubbach Falls", "Valley floor views", "Trümmelbach Falls option", "Evening after day-trippers leave"],
    practical: "Book lodging early and keep luggage minimal; summer availability is tight and transfers are frequent.",
    extraDetails: [
      "Lauterbrunnen is the emotional center of the itinerary: cliffs, waterfalls, and evening quiet after day-trippers leave.",
      "Two nights here protect the mountain-day decision from weather; do not overpack every hour.",
    ],
  },
  {
    id: "lauterbrunnen-hotel",
    name: "Alpine Base Hostel - Adults only",
    kind: "Booked hotel",
    region: "Lauterbrunnen",
    coordinates: [46.5904, 7.909],
    role: "Lauterbrunnen nights: Jul 11 and Jul 12",
    note: "Booked Lauterbrunnen base for the Jungfrau-region nights.",
    bestFor: "Sleeping in the valley while keeping Mürren, Schilthorn, Wengen, waterfalls, and Interlaken reachable.",
    allow: "Expect a short local arrival transfer or a longer walk from Lauterbrunnen station if carrying bags.",
    dontMiss: ["Staubbach Falls nearby", "Valley evening", "Easy mountain-day base"],
    practical: "On arrival day, drop bags before choosing Mürren versus waterfalls; keep the mountain day light on luggage.",
    extraDetails: [
      "This keeps the plan flexible between Schilthorn and Jungfraujoch.",
      "Check the hotel confirmation for the easiest station-to-hostel route before arrival.",
    ],
  },
  {
    id: "murren",
    name: "Mürren",
    kind: "Car-free cliff village",
    region: "Car-free cliff village",
    coordinates: [46.5595, 7.8921],
    role: "Easy scenic viewpoint",
    note: "Face-to-face views of the Eiger, Mönch, and Jungfrau without committing to a huge hiking day.",
    bestFor: "A car-free balcony village with huge views and a calmer feel than the valley floor.",
    allow: "2-4 hours for the village, viewpoints, and cafe time.",
    dontMiss: ["Cliffside village lanes", "Eiger/Mönch/Jungfrau views", "Allmendhubel option"],
    practical: "Access routes can vary with maintenance; check whether the Lauterbrunnen-Grütschalp route or Stechelberg route fits best.",
    extraDetails: [
      "Mürren is a great first Jungfrau-region viewpoint because it delivers the cliff-village feeling without forcing the expensive summit choice.",
      "It also works as a soft backup if Schilthorn is cloudy but the village level still has atmosphere.",
    ],
  },
  {
    id: "schilthorn",
    name: "Schilthorn",
    kind: "Mountain summit viewpoint",
    region: "Piz Gloria",
    coordinates: [46.5575, 7.8352],
    role: "Simpler big-mountain choice",
    note: "Bond history, revolving restaurant, Birg Thrill Walk, and dramatic cable-car logistics.",
    bestFor: "A dramatic high viewpoint with easier decision-making than Jungfraujoch if weather is decent.",
    allow: "Half to most of a day, depending on time at Birg and Piz Gloria.",
    dontMiss: ["Birg Thrill Walk", "Piz Gloria", "Cable-car views", "James Bond exhibits"],
    practical: "Use webcams before committing; the trip is much better when upper stations are clear.",
    extraDetails: [
      "Schilthorn is the simpler big-mountain default for this route: dramatic, memorable, and naturally paired with Mürren.",
      "If visibility is marginal, Birg and Mürren can still be worthwhile even when the very top is not.",
    ],
  },
  {
    id: "jungfraujoch",
    name: "Jungfraujoch",
    kind: "High-Alpine glacier station",
    region: "Top of Europe",
    coordinates: [46.5475, 7.9854],
    role: "Glacier bucket-list choice",
    note: "The highest railway station in Europe, with bigger cost and stricter weather stakes.",
    bestFor: "The most iconic glacier day and the highest-altitude experience in the plan.",
    allow: "Most of the day from Lauterbrunnen, especially if you want to avoid rushing connections.",
    dontMiss: ["Sphinx viewpoint", "Aletsch Glacier view", "Ice Palace", "High-Alpine station experience"],
    practical: "This is the ticket to be most careful with: price it against your rail pass and only go with strong visibility.",
    extraDetails: [
      "Jungfraujoch is the most iconic glacier option, but it is also the day where weather and cost matter most.",
      "Treat it as a deliberate upgrade, not the automatic plan, unless the forecast and webcams are clearly excellent.",
    ],
  },
  {
    id: "brienz",
    name: "Lake Brienz",
    kind: "Lake / boat cruise",
    region: "Turquoise lake day",
    coordinates: [46.727, 7.97],
    role: "Boat cruise option",
    note: "A low-effort scenic day if the mountain visibility is weak or energy is low.",
    bestFor: "A scenic reset day with turquoise water, villages, and less altitude/weather pressure.",
    allow: "2-4 hours depending on the cruise segment and whether you stop in Brienz or Iseltwald.",
    dontMiss: ["Turquoise water", "Brienz village", "Boat deck views", "Flexible lunch stop"],
    practical: "Boat frequency matters; check the exact July timetable before building the Bern transfer around it.",
    extraDetails: [
      "Lake Brienz gives the trip a lower-altitude visual payoff after the peak day, which helps avoid mountain fatigue.",
      "Build the boat segment around the evening transfer to Bern, not the other way around.",
    ],
  },
  {
    id: "harder",
    name: "Harder Kulm",
    kind: "Funicular viewpoint",
    region: "Top of Interlaken",
    coordinates: [46.697, 7.851],
    role: "Short funicular viewpoint",
    note: "Fast panorama over Interlaken, Lake Thun, and Lake Brienz.",
    bestFor: "A quick, high-value viewpoint when you do not want another full mountain logistics chain.",
    allow: "60-90 minutes including the funicular if lines are manageable.",
    dontMiss: ["Two-lake panorama", "Interlaken viewpoint platform", "Sunset possibility"],
    practical: "Skip it if the cloud ceiling is low or if it would make the Zurich return feel rushed.",
    extraDetails: [
      "Harder Kulm is a compact finale viewpoint: high reward, short logistics, and easy to drop if timing gets tight.",
      "It works best as an optional add-on after Lake Brienz rather than a fixed obligation.",
    ],
  },
];

export const placeById = new Map(places.map((place) => [place.id, place]));

export const iconByMode: Record<TransportMode, LucideIcon> = {
  train: Train,
  boat: Ship,
  cogwheel: Mountain,
  "cable-car": CableCar,
  funicular: TramFront,
  walk: Compass,
  tram: TramFront,
};

export function ticketPlanForLeg(leg: TransitLeg): TicketPlan {
  const routeText = `${leg.from} ${leg.to}`.toLowerCase();

  if (routeText.includes("lake brienz") || routeText.includes("brienz")) {
    return {
      primary: ticketLinks.blsBrienz,
      schedule: ticketLinks.blsBrienz,
      operator: ticketLinks.sbb,
      cheapest:
        "Check whether your Swiss Travel Pass, Saver Day Pass, or Half Fare Card covers the exact boat segment before buying a separate cruise ticket.",
      timing:
        "Do not lock this too early. Recheck the July boat timetable close to travel and buy once the Bern transfer still looks comfortable.",
    };
  }

  if (routeText.includes("vitznau") || routeText.includes("rigi")) {
    return {
      primary: ticketLinks.rigi,
      schedule: leg.mode === "boat" ? ticketLinks.lakeLucerne : ticketLinks.rigi,
      operator: ticketLinks.sbb,
      cheapest:
        "With a Swiss Travel Pass or Saver Day Pass, Rigi railways can be free and may require no separate Rigi ticket; without one, compare Half Fare pricing before paying full fare.",
      timing:
        "Buy only after choosing your pass strategy. On the day, use the timetable to match the Lucerne boat with the Vitznau cogwheel connection.",
    };
  }

  if (routeText.includes("luzern") || routeText.includes("lucerne") || routeText.includes("interlaken ost")) {
    if (routeText.includes("lucerne") && routeText.includes("interlaken")) {
      return {
        primary: ticketLinks.sbb,
        schedule: ticketLinks.zentralbahn,
        operator: ticketLinks.zentralbahn,
        cheapest:
          "If you are not using a pass, check SBB early for Supersaver or Saver Day Pass options; seat reservation is optional and mainly about comfort.",
        timing:
          "Price it in advance, but keep flexibility if your pass choice is not settled. Regular point-to-point tickets are usually easy to buy in SBB.",
      };
    }

    return {
      primary: ticketLinks.sbb,
      schedule: ticketLinks.sbb,
      cheapest:
        "For plain rail transfers, SBB is the cleanest place to compare point-to-point, Half Fare, Supersaver, Saver Day Pass, and pass-covered options.",
      timing:
        "Look early for train-specific Supersaver fares if you can commit to a departure; otherwise buy flexible tickets closer to travel or ride with a valid pass.",
    };
  }

  if (routeText.includes("schilthorn") || routeText.includes("birg") || routeText.includes("stechelberg")) {
    return {
      primary: ticketLinks.schilthorn,
      schedule: ticketLinks.schilthorn,
      operator: ticketLinks.sbb,
      cheapest:
        "Price the Schilthorn fare with your rail pass or Half Fare Card. Avoid buying a high-summit ticket before webcams confirm useful visibility.",
      timing:
        "Best bought the night before or morning of, after checking operations and webcams. The cheapest bad-weather summit ticket is the one you skip.",
    };
  }

  if (routeText.includes("mürren") || routeText.includes("murren")) {
    return {
      primary: ticketLinks.sbb,
      schedule: ticketLinks.schilthorn,
      cheapest:
        "Use SBB to price the valley-to-Mürren connection with your pass or Half Fare Card, then check Schilthorn operations for cable-car status.",
      timing:
        "Buy like normal public transport unless your chosen route requires a mountain add-on. Recheck operations close to travel because maintenance can change access routes.",
    };
  }

  if (routeText.includes("jungfraujoch")) {
    return {
      primary: ticketLinks.jungfrauTickets,
      schedule: { label: "Jungfrau operating info", url: "https://www.jungfrau.ch/en-gb/live/operating-info/" },
      operator: ticketLinks.sbb,
      cheapest:
        "This is the biggest-ticket day. Compare the Jungfrau price with Swiss Travel Pass/Half Fare reductions and only buy if the forecast earns it.",
      timing:
        "Do not buy far ahead unless you are comfortable with the weather risk. Decide the night before or morning of; add seat reservation only if required/useful.",
    };
  }

  if (routeText.includes("harder")) {
    return {
      primary: ticketLinks.harder,
      schedule: ticketLinks.harder,
      cheapest:
        "Treat Harder Kulm as an optional add-on. Buy only if the sky is clear enough and the Lake Brienz-to-Bern timing still feels relaxed.",
      timing:
        "Same-day purchase is usually the sane planning move because this stop is optional and weather-sensitive.",
    };
  }

  if (leg.mode === "walk") {
    return {
      primary: { label: "Bern Old City info", url: "https://bern.com/en/explore/tourist-attractions/attractions/bern-s-old-city" },
      cheapest: "Walking is free. Budget only for lockers, cafes, trams, or paid attractions you decide to add.",
      timing: "No ticket needed unless weather or luggage makes a short tram ride worthwhile.",
    };
  }

  return {
    primary: ticketLinks.sbb,
    schedule: ticketLinks.sbb,
    cheapest:
      "Use SBB as the default public-transport source, then compare against your pass choice before buying a separate ticket.",
    timing:
      "Check early for saver fares when you can commit to a time; keep regular flexible tickets for legs that may shift with weather.",
  };
}

export const dayPlans: DayPlan[] = [
  {
    id: 1,
    date: "Thu, Jul 9",
    title: "Zurich workday, evening to Lucerne",
    base: "Capsule Hotel - Lucerne Old Town",
    summary:
      "Keep the workday simple in Zurich, then take an evening train to Lucerne so the first scenic morning starts already by the lake.",
    jawDrop: "A low-friction sunset arrival in Lucerne, with the lakefront and old town ready for a short evening walk.",
    effort: "Very easy",
    weather: "Good in almost any weather; if it is rainy, make the evening about hotel check-in, dinner, and rail/pass setup.",
    route: ["zurich", "lucerne-hotel"],
    legs: [
      {
        from: "Zurich work base / Zurich HB",
        to: "Lucerne",
        mode: "train",
        duration: "~45-55 min",
        recommendedTime: "Aim for a post-work departure around 17:30-19:00.",
        guidance: "Travel after work, walk or take a short local hop to the hotel, and check in; this removes the Day 2 morning transfer.",
      },
    ],
    highlights: ["Easy Zurich departure", "Lucerne lakefront evening", "Early setup for the Rigi day"],
    backup: "If work runs late, take a later direct train and keep Lucerne to dinner/check-in only.",
    priceEstimates: [
      {
        label: "Zurich-Lucerne train",
        estimate: "CHF 15-30+ pp",
        note: "Approximate exposure before pass/saver/half-fare choices; verify exact July fare in SBB.",
      },
      {
        label: "Pass setup",
        estimate: "CHF 0 now",
        note: "Save the Rigi and Luzern-Interlaken routes in SBB after checking into Lucerne.",
      },
    ],
    reminders: [
      { label: "Book Lucerne hotel for July 9 and July 10", priority: "must" },
      { label: "Install SBB Mobile and save Zurich-Lucerne route", priority: "must" },
      { label: "Verify whether a pass or point-to-point tickets wins for your exact group", priority: "verify" },
    ],
  },
  {
    id: 2,
    date: "Fri, Jul 10",
    title: "Lucerne and Mt. Rigi",
    base: "Capsule Hotel - Lucerne Old Town",
    summary:
      "Wake up in Lucerne, then make the classic lake-and-cogwheel loop to Rigi Kulm for the first proper Alpine panorama.",
    jawDrop: "Rigi Kulm gives a 360-degree view over Lake Lucerne, nearby ridges, and layers of Alpine peaks.",
    effort: "Easy scenic",
    weather: "Worth doing in mixed weather if clouds are high; if the summit is socked in, stay lower around Lucerne and the lake.",
    route: ["lucerne-hotel", "lucerne", "vitznau", "rigi", "lucerne", "lucerne-hotel"],
    legs: [
      {
        from: "Capsule Hotel - Lucerne Old Town",
        to: "Lucerne boat pier / station",
        mode: "walk",
        duration: "~10-15 min",
        recommendedTime: "Leave the hotel around 08:30-09:00 for an unhurried Rigi day.",
        guidance: "Walk through the old town toward the station and lake piers; keep the exact boat time flexible until you check the day’s timetable.",
      },
      {
        from: "Lucerne",
        to: "Vitznau",
        mode: "boat",
        duration: "~1 hr",
        recommendedTime: "Target a morning boat around 09:00-10:00.",
        guidance: "Pick a boat that connects cleanly with the Rigi cogwheel train.",
      },
      {
        from: "Vitznau",
        to: "Rigi Kulm",
        mode: "cogwheel",
        duration: "~35-45 min",
        recommendedTime: "Connect from the boat with buffer, ideally reaching Rigi Kulm before lunch.",
        guidance: "Ride up for summit views, then return by Vitznau or via Arth-Goldau if timing works.",
      },
      {
        from: "Rigi Kulm",
        to: "Lucerne",
        mode: "cogwheel",
        duration: "~1.5-2 hr",
        recommendedTime: "Start descending around 15:00-16:30 if you want a relaxed Lucerne dinner.",
        guidance: "Descend and connect back to Lucerne; choose the return side by timetable and pass coverage.",
      },
      {
        from: "Lucerne station / lakefront",
        to: "Capsule Hotel - Lucerne Old Town",
        mode: "walk",
        duration: "~10-15 min",
        recommendedTime: "Return before dinner, or later if the weather makes Lucerne evening time appealing.",
        guidance: "Use the hotel as the luggage and evening reset point after the Rigi loop.",
      },
    ],
    highlights: ["Lucerne lakefront", "Historic boat approach", "Rigi Kulm summit", "Old town dinner"],
    optionalAddOns: ["Chapel Bridge / old town walk", "Lake promenade before dinner", "Transport Museum if Rigi is cloudy"],
    backup: "If Rigi weather is poor, replace the summit with Lucerne old town, lake cruise, or Transport Museum.",
    priceEstimates: [
      {
        label: "Swiss Travel Pass option",
        estimate: "Often fully/mostly covered",
        note: "Rigi railways and many lake/public-transport legs are pass-friendly; verify exact 2026 validity.",
      },
      {
        label: "Without pass",
        estimate: "CHF 65-120+ pp",
        note: "Approximate Lucerne boat, cogwheel, and return exposure before discounts.",
      },
    ],
    reminders: [
      { label: "Check Rigi and Lake Lucerne timetables the week before", priority: "verify" },
      { label: "Rigi does not need advance booking for individual travelers; groups of 10+ must reserve at least 24 hours ahead", priority: "verify" },
      { label: "Book Lucerne hotel near station or lakefront", priority: "must" },
      { label: "No Rigi rail ticket needed if using Swiss Travel Pass coverage; verify pass choice first", priority: "verify" },
    ],
  },
  {
    id: 3,
    date: "Sat, Jul 11",
    title: "Panorama train to Lauterbrunnen",
    base: "Alpine Base Hostel - Adults only",
    summary:
      "Take the Luzern-Interlaken Express through lakes and mountain passes, continue into Lauterbrunnen, then use Mürren as the easy first Jungfrau viewpoint.",
    jawDrop: "The arrival into Lauterbrunnen stacks vertical cliffs, waterfalls, and high peaks into one valley.",
    effort: "Easy scenic",
    weather: "Still strong in moody weather; waterfalls and valley drama can be better after rain.",
    route: ["lucerne-hotel", "interlaken", "lauterbrunnen", "lauterbrunnen-hotel", "murren", "lauterbrunnen-hotel"],
    legs: [
      {
        from: "Capsule Hotel - Lucerne Old Town / Lucerne station",
        to: "Interlaken Ost",
        mode: "train",
        duration: "~1 hr 50 min",
        recommendedTime: "Aim for a mid-morning train around 09:00-10:00.",
        guidance: "Use the Luzern-Interlaken Express; seat reservations are optional but useful in peak season.",
      },
      {
        from: "Interlaken Ost",
        to: "Lauterbrunnen",
        mode: "train",
        duration: "~20 min",
        recommendedTime: "Connect onward after the panorama train; avoid a long Interlaken stop while carrying bags.",
        guidance: "Local train into the valley; keep luggage simple for station transfers.",
      },
      {
        from: "Lauterbrunnen station",
        to: "Alpine Base Hostel - Adults only",
        mode: "walk",
        duration: "~10-20 min",
        recommendedTime: "Drop bags before choosing the afternoon plan.",
        guidance: "Check the booking for the easiest arrival route; if luggage feels heavy, use local transport or a short taxi rather than forcing the walk.",
      },
      {
        from: "Alpine Base Hostel - Adults only / Lauterbrunnen",
        to: "Mürren",
        mode: "cable-car",
        duration: "~25-40 min",
        recommendedTime: "Go up around 15:00-16:30 if weather and energy are good.",
        guidance: "Use whichever public-transport route is operating best that day; confirm maintenance and bus substitutes.",
      },
      {
        from: "Mürren",
        to: "Alpine Base Hostel - Adults only",
        mode: "cable-car",
        duration: "~25-40 min",
        recommendedTime: "Return before dinner and before the late-evening mountain connections get sparse.",
        guidance: "Return to Lauterbrunnen for the overnight, leaving margin for dinner and a calmer valley evening.",
      },
    ],
    highlights: ["Luzern-Interlaken Express", "Staubbach Falls", "Mürren cliffside village", "Car-free mountain evening"],
    optionalAddOns: ["Mürren evening walk if energy is good", "Staubbach Falls after check-in", "Trümmelbach Falls instead of Mürren if clouds are low"],
    backup: "If clouds block Mürren views, do Trümmelbach Falls or a short Lauterbrunnen valley walk instead.",
    priceEstimates: [
      {
        label: "Main rail day",
        estimate: "CHF 40-90+ pp",
        note: "Lucerne-Interlaken-Lauterbrunnen varies by pass, half fare, saver availability, and route.",
      },
      {
        label: "Mürren access",
        estimate: "CHF 10-30+ pp",
        note: "Depends on selected access route and whether a pass/discount applies.",
      },
    ],
    reminders: [
      { label: "Book Lauterbrunnen lodging early; summer availability is tight", priority: "must" },
      { label: "Consider Luzern-Interlaken Express seat reservation for a guaranteed seat; July 2026 reservation fee is CHF 16 pp", priority: "optional" },
      { label: "Check Schilthorn/Mürren access route status before travel", priority: "verify" },
    ],
  },
  {
    id: 4,
    date: "Sun, Jul 12",
    title: "Choose the mountain by visibility",
    base: "Alpine Base Hostel - Adults only",
    summary:
      "This is the expensive/high-reward day, so decide the night before or morning of based on webcams, cloud ceiling, and energy.",
    jawDrop: "Schilthorn is the simpler dramatic peak; Jungfraujoch is the glacier bucket-list day.",
    effort: "Easy scenic",
    weather: "Only commit to the high summit if webcams show clear upper elevations. Low clouds can erase the value fast.",
    route: ["lauterbrunnen-hotel", "murren", "schilthorn", "murren", "lauterbrunnen-hotel"],
    legs: [
      {
        from: "Alpine Base Hostel - Adults only / Lauterbrunnen",
        to: "Mürren / Stechelberg access",
        mode: "cable-car",
        duration: "~25-45 min",
        recommendedTime: "If webcams are good, start around 08:30-09:30.",
        guidance: "Start with the access route that is operating best that morning; this is the gateway to the Schilthorn day.",
      },
      {
        from: "Mürren / Birg",
        to: "Schilthorn",
        mode: "cable-car",
        duration: "~30-60 min with connections",
        recommendedTime: "Try to be at Birg/Piz Gloria before midday for clearer odds and less rush.",
        guidance: "Continue upward if webcams look good; Birg is the useful intermediate stop for the Thrill Walk.",
      },
      {
        from: "Schilthorn",
        to: "Mürren",
        mode: "cable-car",
        duration: "~30-45 min",
        recommendedTime: "Start descending mid-afternoon unless visibility is excellent and you want to linger.",
        guidance: "Descend in stages so you can keep Birg or Mürren time flexible.",
      },
      {
        from: "Mürren",
        to: "Alpine Base Hostel - Adults only",
        mode: "cable-car",
        duration: "~25-40 min",
        recommendedTime: "Return with a healthy buffer before last connections.",
        guidance: "Return to Lauterbrunnen for the overnight; keep enough margin for last operating connections.",
      },
    ],
    highlights: ["Morning webcam decision", "Schilthorn / Birg Thrill Walk", "Optional Jungfraujoch glacier day", "Flexible valley evening"],
    backup: "Skip the peak and do Wengen, Mürren, waterfalls, or Interlaken if visibility is poor.",
    priceEstimates: [
      {
        label: "Schilthorn default",
        estimate: "CHF 50-110+ pp",
        note: "Varies heavily by start point and rail pass; simpler than Jungfraujoch but still a mountain-ticket day.",
      },
      {
        label: "Jungfraujoch upgrade",
        estimate: "CHF 75-170+ pp",
        note: "From Lauterbrunnen-style routes, this is usually the expensive option; add seat reservation if required.",
      },
    ],
    decisions: [
      {
        title: "Schilthorn",
        bestFor: "A dramatic but simpler mountain day from Lauterbrunnen.",
        tradeoff: "Less glacier-iconic than Jungfraujoch, but usually easier and less punishing if the day shifts.",
        logistics: "Bus/train to Stechelberg or Mürren access, cable cars through Birg to Piz Gloria.",
      },
      {
        title: "Jungfraujoch",
        bestFor: "The big bucket-list glacier experience.",
        tradeoff: "Higher cost and a longer logistics chain; poor visibility hurts more.",
        logistics: "Rail/cable route toward Eigergletscher, then Jungfrau Railway to the summit station.",
      },
    ],
    reminders: [
      { label: "Check webcams before buying high-mountain tickets", priority: "must" },
      { label: "If choosing Jungfraujoch, book the mandatory May-Oct 2026 seat reservation after the forecast looks good; it is CHF 10 pp", priority: "must" },
      { label: "For Schilthorn, buy mountain tickets only once visibility looks worthwhile; reserve Piz Gloria separately only if you want a set restaurant table", priority: "optional" },
      { label: "Price both Schilthorn and Jungfraujoch with your chosen rail pass", priority: "verify" },
      { label: "Pack warm layer and sunglasses even in July", priority: "must" },
    ],
  },
  {
    id: 5,
    date: "Mon, Jul 13",
    title: "Lake Brienz, then Bern",
    base: "Bern Backpackers Hotel Glocke",
    summary:
      "Use this as a softer scenic day after the mountain stretch: turquoise Lake Brienz, then continue to Bern for the night instead of backtracking from Zurich later.",
    jawDrop: "Lake Brienz has glacial turquoise water, while Harder Kulm gives a compact overview of the two lakes and Interlaken.",
    effort: "Easy scenic",
    weather: "Better than a peak day in mixed weather; skip Harder Kulm if cloud ceiling is low.",
    route: ["lauterbrunnen-hotel", "interlaken", "brienz", "interlaken", "bern-hotel"],
    legs: [
      {
        from: "Alpine Base Hostel - Adults only / Lauterbrunnen",
        to: "Interlaken Ost",
        mode: "train",
        duration: "~20 min",
        recommendedTime: "Leave around 09:00-10:00 for a calm lake day.",
        guidance: "Morning transfer out of the valley; store luggage at Interlaken if helpful.",
      },
      {
        from: "Interlaken Ost",
        to: "Lake Brienz / Brienz",
        mode: "boat",
        duration: "Flexible",
        recommendedTime: "Target late morning or early afternoon, depending on the boat timetable.",
        guidance: "Pick a cruise segment that leaves time for the evening transfer to Bern.",
      },
      {
        from: "Lake Brienz / Brienz",
        to: "Interlaken Ost",
        mode: "boat",
        duration: "Flexible",
        recommendedTime: "Be back at Interlaken by mid/late afternoon if adding Harder Kulm or keeping a relaxed Bern transfer.",
        guidance: "Return to Interlaken with enough buffer for the optional Harder Kulm stop and the Bern train.",
      },
      {
        from: "Interlaken Ost",
        to: "Bern Backpackers Hotel Glocke",
        mode: "train",
        duration: "~1 hr",
        recommendedTime: "Aim for an early evening arrival in Bern, roughly 17:00-19:00.",
        guidance: "Evening transfer to Bern for the overnight; this keeps the final city stop on the natural route toward Zurich.",
      },
    ],
    highlights: ["Lake Brienz cruise", "Optional Iseltwald/Brienz stop", "Earlier Bern arrival"],
    backup: "If boats/timing do not fit, do Trümmelbach Falls plus a relaxed Interlaken lunch before the Bern transfer.",
    priceEstimates: [
      {
        label: "Lake + rail day",
        estimate: "CHF 45-100+ pp",
        note: "Depends on Lake Brienz segment, pass coverage, and Interlaken-Bern rail ticket.",
      },
      {
        label: "Harder Kulm add-on",
        estimate: "CHF 20-45+ pp",
        note: "Treat as optional; buy only if weather and timing make it feel easy.",
      },
    ],
    reminders: [
      { label: "Check Lake Brienz boat timetable for July 13", priority: "verify" },
      { label: "Lake Brienz scheduled boats do not take seat reservations; buy day-of unless reserving an onboard restaurant table", priority: "verify" },
      { label: "Harder Kulm can stay day-of; buy only if weather and Bern timing make it easy", priority: "optional" },
      { label: "Book Bern hotel near the station or old town", priority: "must" },
      { label: "Keep this day flexible after two mountain-region nights", priority: "optional" },
    ],
  },
  {
    id: 6,
    date: "Tue, Jul 14",
    title: "Bern morning, Zurich finish",
    base: "Trip ends Zurich",
    summary:
      "Wake up in Bern, use the old city while it is already on your route, then return to Zurich with a departure buffer.",
    jawDrop: "Bern’s old city sits in a bend of the Aare with long sandstone arcades, clock tower, and compact viewpoints.",
    effort: "Easy scenic",
    weather: "Bern works well in rain because the old town has long covered arcades.",
    route: ["bern-hotel", "bern-old-city", "bern", "zurich"],
    legs: [
      {
        from: "Bern Backpackers Hotel Glocke",
        to: "Old City loop",
        mode: "walk",
        duration: "2-4 hr",
        recommendedTime: "Start around 09:00-10:00 if your Zurich departure is not early.",
        guidance: "Zytglogge, arcades, cathedral terrace, river viewpoints, and cafes.",
      },
      {
        from: "Old City loop",
        to: "Bern station",
        mode: "walk",
        duration: "~10-20 min",
        recommendedTime: "Head back to luggage by late morning or early afternoon, depending on your Zurich buffer.",
        guidance: "Return to the station for luggage and the Zurich train; use tram shortcuts if weather or timing pushes you.",
      },
      {
        from: "Bern",
        to: "Zurich HB",
        mode: "train",
        duration: "~1 hr",
        recommendedTime: "Choose a train that reaches Zurich at least 2-3 hours before any fixed onward departure.",
        guidance: "Return to Zurich with a generous departure buffer; skip Bern entirely if this feels tight.",
      },
    ],
    highlights: ["UNESCO Old City", "Zytglogge", "Aare viewpoints", "Covered arcades for rain"],
    backup: "If the final departure is early, skip the old-city loop and take a direct Bern-to-Zurich transfer.",
    priceEstimates: [
      {
        label: "Bern old city",
        estimate: "CHF 0-25 pp",
        note: "Walking is free; budget for lockers, cafes, or paid attractions if you choose them.",
      },
      {
        label: "Bern-Zurich rail",
        estimate: "CHF 20-55+ pp",
        note: "Depends on saver availability and half-fare/pass coverage.",
      },
    ],
    reminders: [
      { label: "Leave Bern early enough for the Zurich departure buffer", priority: "must" },
      { label: "Use Bern hotel storage or station lockers during the old-city loop", priority: "verify" },
    ],
  },
];

export const passOptions: PassOption[] = [
  {
    name: "Swiss Travel Pass",
    fit: "Best if you want one simple ticket for trains, boats, city transit, Rigi, museums, and low friction.",
    goodFor: "Rigi coverage, Lake Lucerne boats, BLS boats, Zurich/Lucerne/Bern city transit, and lots of flexibility.",
    watchOut: "Jungfraujoch and Schilthorn still need careful discount checks; do not assume every mountain lift is fully covered.",
  },
  {
    name: "Swiss Half Fare Card",
    fit: "Often strong when the high mountain day is expensive but you are comfortable buying each route.",
    goodFor: "Reducing mountain railway/cable-car costs and most point-to-point public transport fares.",
    watchOut: "More admin than a pass, and saver tickets can sometimes beat the simple half-fare math.",
  },
  {
    name: "Saver Day Pass",
    fit: "Good for fixed long-travel days if bought early and the plan is unlikely to change.",
    goodFor: "Zurich-Lucerne-Rigi style travel days or Interlaken-Zurich returns when locked in advance.",
    watchOut: "Less flexible; prices rise as travel dates get closer.",
  },
  {
    name: "Point-to-point tickets",
    fit: "Best only if you want maximum simplicity per leg and the pass comparison does not pencil out.",
    goodFor: "Travelers with few included boats/museums/mountain discounts.",
    watchOut: "This itinerary has enough public transport variety that pure point-to-point may become expensive.",
  },
];

export const sourceLinks: SourceLink[] = [
  { label: "SBB timetable & tickets", url: "https://www.sbb.ch/en" },
  { label: "SBB Swiss Travel Pass", url: "https://www.sbb.ch/en/offers/swiss-travel-pass" },
  { label: "Lake Lucerne boats", url: "https://www.lakelucerne.ch/en/" },
  { label: "Rigi discounts", url: "https://www.rigi.ch/en/inform/prices/discounts-for-individuals" },
  { label: "Luzern-Interlaken Express", url: "https://www.zentralbahn.ch/en/experience/leisure/luzern-interlaken-express" },
  { label: "Lake Brienz boats", url: "https://www.bls.ch/en/freizeit-und-ferien/ausfluege/schifffahrt-brienzersee" },
  { label: "BLS boat booking FAQ", url: "https://www.bls-schiff.ch/en/contact-help/frequently-asked-questions" },
  { label: "Schilthorn timetable & tariff", url: "https://schilthorn.ch/en/Infos/Timetable__Tariff" },
  { label: "Jungfraujoch tickets", url: "https://www.jungfrau.ch/en-gb/jungfraujoch-top-of-europe/buy-jungfraujoch-ticket/" },
  { label: "Jungfraujoch seat reservation FAQ", url: "https://www.jungfrau.ch/en-gb/faq/" },
  { label: "Harder Kulm", url: "https://www.jungfrau.ch/en-gb/harder-kulm/" },
  { label: "Jungfrau operating info", url: "https://www.jungfrau.ch/en-gb/live/operating-info/" },
  { label: "Bern Old City", url: "https://bern.com/en/explore/tourist-attractions/attractions/bern-s-old-city" },
];

export const summaryStats = [
  { label: "Travel dates", value: "Jul 9-14, 2026", icon: Camera },
  { label: "Car rental", value: "None", icon: CheckCircle2 },
  { label: "Hotel bases", value: "Lucerne, Lauterbrunnen, Bern", icon: Hotel },
  { label: "Style", value: "Easy scenic", icon: CloudSun },
];

export const planningFocus = [
  { label: "Map-first", icon: MapPin },
  { label: "Commute-aware", icon: Train },
  { label: "Weather-flexible", icon: Umbrella },
  { label: "Pass comparison", icon: BadgeSwissFranc },
  { label: "Lake + peak balance", icon: Waves },
];
