import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import {
  BadgeCheck,
  BadgeSwissFranc,
  Briefcase,
  Calculator,
  CalendarDays,
  ChevronRight,
  CloudSun,
  ExternalLink,
  Hotel,
  Info,
  ListChecks,
  MapPinned,
  Mountain,
  MousePointerClick,
  Printer,
  Route,
  Sparkles,
  TicketCheck,
  Utensils,
} from "lucide-react";
import {
  dayPlans,
  foodSpots,
  iconByMode,
  passOptions,
  placeById,
  places,
  planningFocus,
  sourceLinks,
  summaryStats,
  ticketPlanForLeg,
  type BookingReminder,
  type DayPlan,
  type FoodSpot,
  type Place,
  type TransitLeg,
} from "./tripData";

type RouteSegment = {
  id: string;
  from: Place;
  to: Place;
  leg?: TransitLeg;
  index: number;
};

type WeatherMode = "clear" | "cloudy" | "rain";
type BookingStatus = "todo" | "checking" | "booked";

type FareLine = {
  day: string;
  leg: string;
  fullFare: number;
  halfFare: number;
  swissTravelPass: number;
  note: string;
  buyUrl?: string;
  buyLabel?: string;
};

type StrategyTotal = {
  name: string;
  passCost: number;
  payAsYouGo: number;
  total: number;
  verdict: string;
  buyUrl?: string;
  buyLabel?: string;
};

type DayFareItem = {
  type: "Commute" | "Attraction" | "Optional";
  name: string;
  fullFare: number;
  halfFare: number;
  swissTravelPass: number;
  note: string;
  buyUrl?: string;
  buyLabel?: string;
};

type DayFareBreakdown = {
  day: string;
  date: string;
  title: string;
  items: DayFareItem[];
};

const weatherLabels: Record<WeatherMode, string> = {
  clear: "Clear",
  cloudy: "Cloudy",
  rain: "Rain",
};

const weatherAdvice: Record<number, Record<WeatherMode, string>> = {
  1: {
    clear: "Use the lakefront and old town; keep admin short and protect sleep.",
    cloudy: "Stay flexible: Limmat walk, old town, rail setup, and an easy dinner.",
    rain: "Make this the logistics evening: SBB app, passes, hotel confirmations, and covered old-town streets.",
  },
  2: {
    clear: "Do the full Lucerne-boat-Vitznau-Rigi loop and leave summit time for photos or lunch.",
    cloudy: "Check Rigi webcams; if the summit is covered, enjoy Lucerne and a lower lake cruise.",
    rain: "Favor Lucerne old town, museums, cafes, and a shorter lake segment over committing to Rigi Kulm.",
  },
  3: {
    clear: "Prioritize Mürren after arrival; this is a beautiful first Jungfrau-region viewpoint.",
    cloudy: "Still a good travel day: waterfalls and the Lauterbrunnen valley can look dramatic.",
    rain: "Use the train day calmly, then pick waterfalls or a short valley walk instead of chasing views.",
  },
  4: {
    clear: "Choose the big summit: Schilthorn for simpler drama, Jungfraujoch for the glacier bucket list.",
    cloudy: "Use webcams. Stay lower in Mürren/Wengen if the upper stations disappear.",
    rain: "Skip expensive summit tickets and build the day around villages, waterfalls, and warm indoor breaks.",
  },
  5: {
    clear: "Do Lake Brienz and add Harder Kulm if the sky is still open before Bern.",
    cloudy: "Lake Brienz still works; make Harder Kulm optional and protect the Bern transfer.",
    rain: "Shorten the lake plan, use Interlaken/Lauterbrunnen backup time, and transfer to Bern earlier.",
  },
  6: {
    clear: "Enjoy Bern viewpoints, then return to Zurich with a comfortable buffer.",
    cloudy: "Bern is still strong: old-town arcades, cafes, clock tower, and river bends.",
    rain: "Use the covered arcades and shorten the loop before the Zurich train.",
  },
};

const luggageNotes: Record<number, string[]> = {
  1: ["Travel light from Zurich work to Lucerne.", "A Lucerne station/lakefront hotel makes the next morning much easier."],
  2: ["Wake up already in Lucerne.", "Leave luggage at the hotel before the Rigi boat/cogwheel loop."],
  3: ["Pack for quick rail transfers.", "Lauterbrunnen lodging should be close enough to make arrival easy."],
  4: ["Carry warm layers, sunglasses, water, and a compact rain shell.", "Avoid taking heavy bags on mountain lifts."],
  5: ["Use Interlaken Ost lockers if the Lake Brienz/Harder sequence gets awkward.", "Keep the Bern hotel close to station or old town."],
  6: ["Leave luggage at the Bern hotel or station lockers during the old-city loop.", "Return to Zurich early enough for airport or onward rail buffer."],
};

const passItems = [
  { id: "city", label: "Zurich-Lucerne + city transit", swiss: 3, half: 1, saver: 1, point: 1 },
  { id: "rigi", label: "Lucerne boat + Rigi rail day", swiss: 3, half: 2, saver: 2, point: 1 },
  { id: "oberland", label: "Lucerne to Lauterbrunnen rail day", swiss: 3, half: 2, saver: 2, point: 1 },
  { id: "schilthorn", label: "Schilthorn / mountain lifts", swiss: 2, half: 3, saver: 1, point: 1 },
  { id: "lake", label: "Lake Brienz + Interlaken moves", swiss: 3, half: 2, saver: 2, point: 1 },
  { id: "bern", label: "Interlaken-Bern-Zurich rail", swiss: 3, half: 2, saver: 2, point: 1 },
];

const bookingItems = [
  "Lucerne hotel Jul 9-10",
  "Lauterbrunnen hotel",
  "Bern hotel",
  "Rigi / Lake Lucerne timetable check",
  "Mountain-day webcam decision",
  "Lake Brienz boat timetable",
  "Rail pass or ticket strategy",
];

const ticketLinks = {
  sbb: "https://www.sbb.ch/en",
  halfFareCard: "https://www.sbb.ch/en/offers/swiss-half-fare-card",
  swissTravelPass: "https://www.sbb.ch/en/offers/swiss-travel-pass",
  rigi: "https://www.rigi.ch/en/inform/prices/discounts-for-individuals",
  schilthorn: "https://schilthorn.ch/en/Infos/Timetable__Tariff",
  lakeBrienz: "https://www.bls.ch/en/freizeit-und-ferien/ausfluege/schifffahrt-brienzersee",
  harderKulm: "https://www.jungfrau.ch/en-gb/harder-kulm/",
  jungfraujoch: "https://www.jungfrau.ch/en-gb/jungfraujoch-top-of-europe/buy-jungfraujoch-ticket/",
  luzernInterlakenReservation: "https://www.zentralbahn.ch/en/experience/leisure/luzern-interlaken-express",
};

const coreFareLines: FareLine[] = [
  {
    day: "Jul 9",
    leg: "Zurich HB -> Lucerne",
    fullFare: 27,
    halfFare: 13.5,
    swissTravelPass: 0,
    note: "Plain SBB train; exact fare depends on saver availability and departure time.",
    buyUrl: ticketLinks.sbb,
    buyLabel: "Check SBB",
  },
  {
    day: "Jul 10",
    leg: "Lucerne boat + Vitznau-Rigi Kulm + return",
    fullFare: 118,
    halfFare: 59,
    swissTravelPass: 0,
    note: "Rigi is the one day where Swiss Travel Pass convenience is very strong; Half Fare is roughly half.",
    buyUrl: ticketLinks.rigi,
    buyLabel: "Check Rigi",
  },
  {
    day: "Jul 11",
    leg: "Lucerne -> Interlaken Ost -> Lauterbrunnen + Mürren access",
    fullFare: 75,
    halfFare: 38,
    swissTravelPass: 0,
    note: "Luzern-Interlaken seat reservation is optional and not included here.",
    buyUrl: ticketLinks.sbb,
    buyLabel: "Check SBB",
  },
  {
    day: "Jul 12",
    leg: "Default mountain day: Lauterbrunnen/Mürren -> Schilthorn -> return",
    fullFare: 108,
    halfFare: 54,
    swissTravelPass: 46,
    note: "Swiss Travel Pass covers to Mürren, then gives a discount above Mürren; buy only after webcam check.",
    buyUrl: ticketLinks.schilthorn,
    buyLabel: "Check Schilthorn",
  },
  {
    day: "Jul 13",
    leg: "Lauterbrunnen -> Interlaken + Lake Brienz boat + Interlaken -> Bern",
    fullFare: 122,
    halfFare: 61,
    swissTravelPass: 0,
    note: "Assumes regular BLS Lake Brienz boat and rail legs; verify boat timetable before buying.",
    buyUrl: ticketLinks.lakeBrienz,
    buyLabel: "Check BLS",
  },
  {
    day: "Jul 14",
    leg: "Bern -> Zurich HB",
    fullFare: 51,
    halfFare: 26,
    swissTravelPass: 0,
    note: "Regular intercity train; saver fares can beat the full-fare estimate if departure is fixed.",
    buyUrl: ticketLinks.sbb,
    buyLabel: "Check SBB",
  },
];

const optionalFareLines = [
  {
    name: "Harder Kulm add-on",
    fullFare: 44,
    halfFare: 22,
    swissTravelPass: 22,
    note: "Optional and weather-dependent; buy day-of if the Lake Brienz/Bern timing still feels relaxed.",
    buyUrl: ticketLinks.harderKulm,
    buyLabel: "Check Harder",
  },
  {
    name: "Jungfraujoch instead of Schilthorn",
    fullFare: 220,
    halfFare: 120,
    swissTravelPass: 160,
    note: "Replaces Schilthorn, does not stack with it. Seat reservation is separate; do only with excellent webcams.",
    buyUrl: ticketLinks.jungfraujoch,
    buyLabel: "Check Jungfraujoch",
  },
  {
    name: "Luzern-Interlaken Express seat reservation",
    fullFare: 16,
    halfFare: 16,
    swissTravelPass: 16,
    note: "Comfort add-on only; useful in July, not mandatory.",
    buyUrl: ticketLinks.luzernInterlakenReservation,
    buyLabel: "Check reservation",
  },
];

const passCosts = {
  swissHalfFareCard: 150,
  swissTravelPass6Day: 389,
  swissTravelPass4Day: 309,
};

const coreFullFareTotal = coreFareLines.reduce((total, line) => total + line.fullFare, 0);
const coreHalfFareTicketTotal = coreFareLines.reduce((total, line) => total + line.halfFare, 0);
const coreSwissTravelPassTicketTotal = coreFareLines.reduce((total, line) => total + line.swissTravelPass, 0);

const strategyTotals: StrategyTotal[] = [
  {
    name: "Full-price separate tickets",
    passCost: 0,
    payAsYouGo: coreFullFareTotal,
    total: coreFullFareTotal,
    verdict: "Simple but expensive; only makes sense if you find major saver fares.",
    buyUrl: ticketLinks.sbb,
    buyLabel: "Price in SBB",
  },
  {
    name: "Swiss Half Fare Card + half-fare tickets",
    passCost: passCosts.swissHalfFareCard,
    payAsYouGo: coreHalfFareTicketTotal,
    total: passCosts.swissHalfFareCard + coreHalfFareTicketTotal,
    verdict: "Best likely value for this route; more ticket admin, but the math is strongest.",
    buyUrl: ticketLinks.halfFareCard,
    buyLabel: "Buy card",
  },
  {
    name: "6-day Swiss Travel Pass + Schilthorn add-on",
    passCost: passCosts.swissTravelPass6Day,
    payAsYouGo: coreSwissTravelPassTicketTotal,
    total: passCosts.swissTravelPass6Day + coreSwissTravelPassTicketTotal,
    verdict: "Easiest option, but likely costs more than Half Fare for this exact plan.",
    buyUrl: ticketLinks.swissTravelPass,
    buyLabel: "Check pass",
  },
  {
    name: "4-day Swiss Travel Pass Jul 10-13 + separate edge trains",
    passCost: passCosts.swissTravelPass4Day,
    payAsYouGo: 27 + 51 + 46,
    total: passCosts.swissTravelPass4Day + 27 + 51 + 46,
    verdict: "Convenience compromise, but usually still not as good as Half Fare.",
    buyUrl: ticketLinks.swissTravelPass,
    buyLabel: "Check pass",
  },
];

const dayFareBreakdowns: DayFareBreakdown[] = [
  {
    day: "Day 1",
    date: "Thu Jul 9",
    title: "Zurich to Lucerne",
    items: [
      {
        type: "Commute",
        name: "Zurich HB -> Lucerne",
        fullFare: 27,
        halfFare: 13.5,
        swissTravelPass: 0,
        note: "Evening train after work; saver fare may be lower if you lock the departure.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Attraction",
        name: "Lucerne old-town evening walk",
        fullFare: 0,
        halfFare: 0,
        swissTravelPass: 0,
        note: "Free walk after check-in.",
      },
    ],
  },
  {
    day: "Day 2",
    date: "Fri Jul 10",
    title: "Lucerne and Mt. Rigi",
    items: [
      {
        type: "Commute",
        name: "Lucerne -> Vitznau lake boat",
        fullFare: 32,
        halfFare: 16,
        swissTravelPass: 0,
        note: "Regular Lake Lucerne boat segment; covered by Swiss Travel Pass.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Attraction",
        name: "Vitznau -> Rigi Kulm -> Lucerne mountain loop",
        fullFare: 86,
        halfFare: 43,
        swissTravelPass: 0,
        note: "Rigi railways are the big included win for Swiss Travel Pass; verify route side before buying separately.",
        buyUrl: ticketLinks.rigi,
        buyLabel: "Check Rigi",
      },
      {
        type: "Optional",
        name: "Lucerne museums or paid sights if Rigi is cloudy",
        fullFare: 20,
        halfFare: 20,
        swissTravelPass: 0,
        note: "Not in the core total; many museums are covered or discounted with Swiss Travel Pass.",
      },
    ],
  },
  {
    day: "Day 3",
    date: "Sat Jul 11",
    title: "Panorama train to Lauterbrunnen",
    items: [
      {
        type: "Commute",
        name: "Lucerne -> Interlaken Ost, Luzern-Interlaken Express",
        fullFare: 35,
        halfFare: 18,
        swissTravelPass: 0,
        note: "Core scenic rail leg; optional CHF 16 seat reservation is separate.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Commute",
        name: "Interlaken Ost -> Lauterbrunnen",
        fullFare: 8,
        halfFare: 4,
        swissTravelPass: 0,
        note: "Regional train into the valley.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Attraction",
        name: "Lauterbrunnen <-> Mürren afternoon access",
        fullFare: 32,
        halfFare: 16,
        swissTravelPass: 0,
        note: "Village add-on after bag drop; Swiss Travel Pass generally covers to Mürren.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Optional",
        name: "Luzern-Interlaken Express seat reservation",
        fullFare: 16,
        halfFare: 16,
        swissTravelPass: 16,
        note: "Comfort add-on only; not required.",
        buyUrl: ticketLinks.luzernInterlakenReservation,
        buyLabel: "Check reservation",
      },
    ],
  },
  {
    day: "Day 4",
    date: "Sun Jul 12",
    title: "Schilthorn default mountain day",
    items: [
      {
        type: "Commute",
        name: "Lauterbrunnen -> Mürren / Stechelberg access",
        fullFare: 32,
        halfFare: 16,
        swissTravelPass: 0,
        note: "Covered to Mürren with Swiss Travel Pass; route depends on operations.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Attraction",
        name: "Mürren / Birg -> Schilthorn -> return",
        fullFare: 76,
        halfFare: 38,
        swissTravelPass: 46,
        note: "Buy only when webcams justify going high.",
        buyUrl: ticketLinks.schilthorn,
        buyLabel: "Check Schilthorn",
      },
      {
        type: "Optional",
        name: "Jungfraujoch instead of Schilthorn",
        fullFare: 220,
        halfFare: 120,
        swissTravelPass: 160,
        note: "Alternative, not additive. Add CHF 10 seat reservation in May-Oct if choosing it.",
        buyUrl: ticketLinks.jungfraujoch,
        buyLabel: "Check Jungfraujoch",
      },
    ],
  },
  {
    day: "Day 5",
    date: "Mon Jul 13",
    title: "Lake Brienz, then Bern",
    items: [
      {
        type: "Commute",
        name: "Lauterbrunnen -> Interlaken Ost",
        fullFare: 8,
        halfFare: 4,
        swissTravelPass: 0,
        note: "Morning valley train.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Attraction",
        name: "Lake Brienz boat segment",
        fullFare: 83,
        halfFare: 42,
        swissTravelPass: 0,
        note: "Boat timetable controls the day; regular scheduled boats are covered by Swiss Travel Pass.",
        buyUrl: ticketLinks.lakeBrienz,
        buyLabel: "Check BLS",
      },
      {
        type: "Commute",
        name: "Interlaken Ost -> Bern",
        fullFare: 31,
        halfFare: 15,
        swissTravelPass: 0,
        note: "Evening transfer to Bern.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
      {
        type: "Optional",
        name: "Harder Kulm funicular",
        fullFare: 44,
        halfFare: 22,
        swissTravelPass: 22,
        note: "Weather/timing add-on; keep day-of.",
        buyUrl: ticketLinks.harderKulm,
        buyLabel: "Check Harder",
      },
    ],
  },
  {
    day: "Day 6",
    date: "Tue Jul 14",
    title: "Bern morning, Zurich finish",
    items: [
      {
        type: "Attraction",
        name: "Bern old city walking loop",
        fullFare: 0,
        halfFare: 0,
        swissTravelPass: 0,
        note: "Free unless you add lockers, cafes, trams, or paid sights.",
      },
      {
        type: "Commute",
        name: "Bern -> Zurich HB",
        fullFare: 51,
        halfFare: 26,
        swissTravelPass: 0,
        note: "Choose a train with a 2-3 hour Zurich buffer before fixed onward plans.",
        buyUrl: ticketLinks.sbb,
        buyLabel: "Check SBB",
      },
    ],
  },
];

function chf(amount: number) {
  return Number.isInteger(amount) ? `CHF ${amount}` : `CHF ${amount.toFixed(2)}`;
}

function dayFareTotals(items: DayFareItem[]) {
  const coreItems = items.filter((item) => item.type !== "Optional");
  return {
    fullFare: coreItems.reduce((total, item) => total + item.fullFare, 0),
    halfFare: coreItems.reduce((total, item) => total + item.halfFare, 0),
    swissTravelPass: coreItems.reduce((total, item) => total + item.swissTravelPass, 0),
  };
}

function TicketCheckLink({ url, label = "Check price" }: { url?: string; label?: string }) {
  if (!url) return null;

  return (
    <a className="ticket-check-link" href={url} target="_blank" rel="noreferrer">
      {label} <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}

function applyVariants(day: DayPlan, mountainVariant: "schilthorn" | "jungfraujoch", includeHarder: boolean): DayPlan {
  if (day.id === 4 && mountainVariant === "jungfraujoch") {
    return {
      ...day,
      title: "Jungfraujoch weather-window day",
      summary:
        "Use this version only if the webcams and forecast are strong: it is the most iconic glacier day, but also the costliest and most weather-sensitive.",
      jawDrop: "Jungfraujoch gives the glacier and high-Alpine station experience; save it for the clearest day.",
      route: ["lauterbrunnen-hotel", "jungfraujoch", "lauterbrunnen-hotel"],
      legs: [
        {
          from: "Alpine Base Hostel - Adults only / Lauterbrunnen",
          to: "Jungfraujoch",
          mode: "train",
          duration: "Most of the day",
          recommendedTime: "Start early, ideally around 07:30-08:30, only if the forecast and webcams justify it.",
          guidance: "Price this carefully with your pass choice and only commit if visibility is excellent.",
        },
        {
          from: "Jungfraujoch",
          to: "Alpine Base Hostel - Adults only",
          mode: "train",
          duration: "Most of the day",
          recommendedTime: "Return mid-afternoon so the day does not become a rushed high-altitude marathon.",
          guidance: "Return with a generous margin; this is not the day to stack extra evening logistics.",
        },
      ],
    };
  }

  if (day.id === 5 && includeHarder) {
    return {
      ...day,
      title: "Lake Brienz, Harder Kulm, then Bern",
      summary:
        "Add Harder Kulm only if the Lake Brienz timing, weather, and energy all look good before continuing to Bern.",
      route: ["lauterbrunnen-hotel", "interlaken", "brienz", "interlaken", "harder", "interlaken", "bern-hotel"],
      legs: [
        day.legs[0],
        day.legs[1],
        day.legs[2],
        {
          from: "Interlaken Ost",
          to: "Harder Kulm",
          mode: "funicular",
          duration: "~10 min each way",
          recommendedTime: "Only add this in the mid/late afternoon if skies are open and Bern still feels easy.",
          guidance: "Use as a quick viewpoint if visibility is good and energy remains.",
        },
        {
          from: "Harder Kulm",
          to: "Interlaken Ost",
          mode: "funicular",
          duration: "~10 min",
          recommendedTime: "Come down with enough margin for the Bern train.",
          guidance: "Return to Interlaken Ost before committing to the evening train to Bern.",
        },
        day.legs[3],
      ].filter((leg): leg is TransitLeg => Boolean(leg)),
      highlights: ["Lake Brienz cruise", "Optional Iseltwald/Brienz stop", "Harder Kulm", "Bern evening"],
      backup: "If Harder Kulm would make the Bern transfer feel rushed, skip it and keep the lake day calm.",
    };
  }

  return day;
}

function scoreLabel(score: number) {
  if (score >= 13) return "Strong fit";
  if (score >= 9) return "Possible fit";
  return "Weak fit";
}

const defaultMarkerIcon = L.divIcon({
  className: "pin inactive-pin",
  html: "<span></span>",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function routeMarkerIcon(label: string, selected: boolean) {
  return L.divIcon({
    className: selected ? "pin route-pin selected-route-pin" : "pin route-pin",
    html: `<span>${label}</span>`,
    iconSize: selected ? [36, 36] : [30, 30],
    iconAnchor: selected ? [18, 18] : [15, 15],
  });
}

const alternateMarkerIcon = L.divIcon({
  className: "pin alternate-pin",
  html: "<span>?</span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const foodMarkerIcon = L.divIcon({
  className: "pin food-pin",
  html: "<span>V</span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function priorityLabel(priority: BookingReminder["priority"]) {
  if (priority === "must") return "Must";
  if (priority === "optional") return "Optional";
  return "Verify";
}

function SelectedTicketDetail({ leg }: { leg: TransitLeg }) {
  const ticketPlan = ticketPlanForLeg(leg);
  const scheduleLink = ticketPlan.schedule ?? ticketPlan.primary;

  return (
    <div className="selected-ticket-detail">
      <strong>Cheapest buying strategy</strong>
      <p>{ticketPlan.cheapest}</p>
      <small>{ticketPlan.timing}</small>
      <div className="ticket-links">
        <a href={ticketPlan.primary.url} target="_blank" rel="noreferrer">
          {ticketPlan.primary.label} <ExternalLink size={12} aria-hidden="true" />
        </a>
        {scheduleLink.url !== ticketPlan.primary.url && (
          <a href={scheduleLink.url} target="_blank" rel="noreferrer">
            {scheduleLink.label} <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
        {ticketPlan.operator && (
          <a href={ticketPlan.operator.url} target="_blank" rel="noreferrer">
            Compare in {ticketPlan.operator.label.replace(" timetable & tickets", "")} <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function FoodSpotCard({ spot }: { spot: FoodSpot }) {
  return (
    <article className="food-card">
      <div className="food-card-header">
        <div>
          <strong>{spot.name}</strong>
          <span>{spot.area}</span>
        </div>
        <em>{spot.veganLevel}</em>
      </div>
      <p>{spot.bestFor}</p>
      <div className="food-meta">
        <span>{spot.cuisine}</span>
        <small>{spot.verify}</small>
      </div>
      <a href={spot.url} target="_blank" rel="noreferrer">
        Check menu / hours <ExternalLink size={12} aria-hidden="true" />
      </a>
    </article>
  );
}

function PriceBreakdownPage() {
  const bestStrategy = strategyTotals.reduce((best, current) => (current.total < best.total ? current : best), strategyTotals[0]);
  const schilthornSavings = coreFullFareTotal - bestStrategy.total;
  const swissTravelPassPremium = strategyTotals.find((strategy) => strategy.name.startsWith("6-day Swiss Travel Pass"))?.total ?? 0;
  const conveniencePremium = swissTravelPassPremium - bestStrategy.total;

  return (
    <main className="app-shell price-page">
      <section className="price-hero">
        <div>
          <p className="eyebrow">Fare strategy</p>
          <h1>Trip Price Breakdown</h1>
          <p>
            Planning estimate for one adult in 2nd class, using the current route and the default Schilthorn mountain day.
            Exact fares can move with saver-ticket availability, exchange timing, and final mountain operations.
          </p>
          <p className="price-source-note">
            Source check: Swiss Half Fare Card cost, pass coverage, Rigi discounts, Lake Brienz, Harder Kulm, and
            Jungfraujoch are confirmed from operator pages. Point-to-point SBB fares, Swiss Travel Pass purchase prices,
            and Schilthorn totals should be rechecked in live checkout before purchase.
          </p>
        </div>
        <div className="price-recommendation">
          <BadgeSwissFranc size={26} aria-hidden="true" />
          <span>Best likely option</span>
          <strong>{bestStrategy.name}</strong>
          <p>
            Estimated at <b>{chf(bestStrategy.total)}</b>, about <b>{chf(schilthornSavings)}</b> less than buying the
            core plan at ordinary full fare.
          </p>
        </div>
      </section>

      <section className="price-grid">
        <article className="price-card price-card-wide">
          <div className="panel-heading">
            <Calculator size={19} aria-hidden="true" />
            <h2>Core Route Costs</h2>
          </div>
          <div className="price-table-wrap">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Leg / attraction</th>
                  <th>Full fare</th>
                  <th>Half Fare Card</th>
                  <th>Swiss Travel Pass</th>
                  <th>Buy / validate</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {coreFareLines.map((line) => (
                  <tr key={`${line.day}-${line.leg}`}>
                    <td>{line.day}</td>
                    <td>{line.leg}</td>
                    <td>{chf(line.fullFare)}</td>
                    <td>{chf(line.halfFare)}</td>
                    <td>{line.swissTravelPass === 0 ? "Covered" : chf(line.swissTravelPass)}</td>
                    <td>
                      <TicketCheckLink url={line.buyUrl} label={line.buyLabel} />
                    </td>
                    <td>{line.note}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Core ticket subtotal before pass cost</td>
                  <td>{chf(coreFullFareTotal)}</td>
                  <td>{chf(coreHalfFareTicketTotal)}</td>
                  <td>{chf(coreSwissTravelPassTicketTotal)}</td>
                  <td></td>
                  <td>Pass/card purchase price is added in the strategy table below.</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

        <article className="price-card price-card-wide">
          <div className="panel-heading">
            <BadgeSwissFranc size={19} aria-hidden="true" />
            <h2>Payment Strategy Comparison</h2>
          </div>
          <div className="strategy-grid">
            {strategyTotals.map((strategy) => (
              <div className={strategy.name === bestStrategy.name ? "strategy-card best" : "strategy-card"} key={strategy.name}>
                <span>{strategy.name}</span>
                <strong>{chf(strategy.total)}</strong>
                <p>
                  Pass/card: {strategy.passCost ? chf(strategy.passCost) : "none"} · Tickets/add-ons:{" "}
                  {chf(strategy.payAsYouGo)}
                </p>
                <small>{strategy.verdict}</small>
                <TicketCheckLink url={strategy.buyUrl} label={strategy.buyLabel} />
              </div>
            ))}
          </div>
        </article>

        <article className="price-card price-card-wide">
          <div className="panel-heading">
            <Route size={19} aria-hidden="true" />
            <h2>Day-by-Day Commute & Attraction Breakdown</h2>
          </div>
          <div className="day-price-grid">
            {dayFareBreakdowns.map((day) => {
              const totals = dayFareTotals(day.items);
              return (
                <section className="day-price-card" key={day.day}>
                  <div className="day-price-header">
                    <div>
                      <span>
                        {day.day} · {day.date}
                      </span>
                      <h3>{day.title}</h3>
                    </div>
                    <div className="day-price-total">
                      <small>Core day cost</small>
                      <strong>{chf(totals.halfFare)}</strong>
                      <em>with Half Fare Card</em>
                    </div>
                  </div>
                  <div className="day-price-rows">
                    {day.items.map((item) => (
                      <div className={item.type === "Optional" ? "day-price-row optional" : "day-price-row"} key={item.name}>
                        <div>
                          <span>{item.type}</span>
                          <strong>{item.name}</strong>
                          <p>{item.note}</p>
                          <TicketCheckLink url={item.buyUrl} label={item.buyLabel} />
                        </div>
                        <dl>
                          <div>
                            <dt>Full</dt>
                            <dd>{chf(item.fullFare)}</dd>
                          </div>
                          <div>
                            <dt>Half</dt>
                            <dd>{chf(item.halfFare)}</dd>
                          </div>
                          <div>
                            <dt>STP</dt>
                            <dd>{item.swissTravelPass === 0 ? "Covered" : chf(item.swissTravelPass)}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                  <div className="day-price-summary">
                    <span>Core subtotal, excluding optional rows</span>
                    <strong>Full {chf(totals.fullFare)}</strong>
                    <strong>Half {chf(totals.halfFare)}</strong>
                    <strong>STP {totals.swissTravelPass === 0 ? "covered" : chf(totals.swissTravelPass)}</strong>
                  </div>
                </section>
              );
            })}
          </div>
        </article>

        <article className="price-card">
          <div className="panel-heading">
            <Mountain size={19} aria-hidden="true" />
            <h2>Optional Add-ons</h2>
          </div>
          <div className="addon-list">
            {optionalFareLines.map((line) => (
              <div key={line.name}>
                <strong>{line.name}</strong>
                <span>Full {chf(line.fullFare)} · Half Fare {chf(line.halfFare)} · STP {chf(line.swissTravelPass)}</span>
                <p>{line.note}</p>
                <TicketCheckLink url={line.buyUrl} label={line.buyLabel} />
              </div>
            ))}
          </div>
        </article>

        <article className="price-card">
          <div className="panel-heading">
            <Info size={19} aria-hidden="true" />
            <h2>Recommendation</h2>
          </div>
          <div className="recommendation-copy">
            <p>
              Buy the <b>Swiss Half Fare Card</b>, then price each travel day in SBB with Half Fare selected. Check a
              Half Fare Saver Day Pass for the Rigi day and the Lake Brienz/Bern day before buying point-to-point tickets.
            </p>
            <p>
              Choose the 6-day Swiss Travel Pass only if you value maximum convenience over roughly{" "}
              {chf(conveniencePremium)} of possible savings, or if you find the final live SBB prices are higher than
              these estimates.
            </p>
          </div>
          <a className="return-link" href="/">
            Back to itinerary
          </a>
        </article>

        <article className="price-card price-card-wide">
          <div className="panel-heading">
            <ExternalLink size={19} aria-hidden="true" />
            <h2>Verify Before Buying</h2>
          </div>
          <div className="source-grid">
            <a href="https://www.sbb.ch/en" target="_blank" rel="noreferrer">
              SBB timetable & tickets <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a href="https://www.sbb.ch/en/offers/swiss-half-fare-card" target="_blank" rel="noreferrer">
              Swiss Half Fare Card <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a href="https://www.sbb.ch/en/offers/swiss-travel-pass" target="_blank" rel="noreferrer">
              Swiss Travel Pass <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a href="https://www.rigi.ch/en/inform/prices/discounts-for-individuals" target="_blank" rel="noreferrer">
              Rigi discounts <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a href="https://schilthorn.ch/en/Infos/Timetable__Tariff" target="_blank" rel="noreferrer">
              Schilthorn tariff <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a href="https://www.bls.ch/en/freizeit-und-ferien/ausfluege/schifffahrt-brienzersee" target="_blank" rel="noreferrer">
              Lake Brienz boats <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
          <p className="source-footnote">
            Treat the listed CHF values as a planning model. Before buying, reproduce each leg in SBB for your exact date,
            time, class, selected discount card, and pass duration.
          </p>
        </article>
      </section>
    </main>
  );
}

function MapViewportController({
  routePlaces,
  contextPlaces,
  selectedPlace,
  selectedPlaceId,
  selectedDayId,
}: {
  routePlaces: Place[];
  contextPlaces: Place[];
  selectedPlace?: Place;
  selectedPlaceId: string | null;
  selectedDayId: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlaceId && selectedPlace) {
      map.flyTo(selectedPlace.coordinates, 11, { duration: 0.65 });
      return;
    }

    const focusPlaces = contextPlaces.length ? contextPlaces : routePlaces;

    if (focusPlaces.length === 1) {
      map.flyTo(focusPlaces[0].coordinates, 11, { duration: 0.65 });
      return;
    }

    if (focusPlaces.length > 1) {
      const bounds = L.latLngBounds(focusPlaces.map((place) => place.coordinates));
      map.fitBounds(bounds, {
        animate: true,
        duration: 0.65,
        maxZoom: 10,
        padding: [42, 42],
      });
    }
  }, [contextPlaces, map, routePlaces, selectedDayId, selectedPlace, selectedPlaceId]);

  return null;
}

export default function App() {
  if (window.location.pathname === "/prices") {
    return <PriceBreakdownPage />;
  }

  const [selectedDayId, setSelectedDayId] = useState(2);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(0);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>("clear");
  const [mountainVariant, setMountainVariant] = useState<"schilthorn" | "jungfraujoch">("schilthorn");
  const [includeHarder, setIncludeHarder] = useState(false);
  const [passSelection, setPassSelection] = useState(() => new Set(passItems.map((item) => item.id)));
  const [bookingStatus, setBookingStatus] = useState<Record<string, BookingStatus>>({});
  const baseDay = dayPlans.find((day) => day.id === selectedDayId) ?? dayPlans[0];
  const selectedDay = useMemo(
    () => applyVariants(baseDay, mountainVariant, includeHarder),
    [baseDay, mountainVariant, includeHarder]
  );

  useEffect(() => {
    setSelectedSegmentIndex(0);
    setSelectedPlaceId(null);
    setSelectedStopIndex(0);
  }, [selectedDayId, mountainVariant, includeHarder]);

  const routePlaces = useMemo(
    () =>
      selectedDay.route
        .map((placeId) => placeById.get(placeId))
        .filter((place): place is Place => Boolean(place)),
    [selectedDay]
  );

  const routeSegments = useMemo(
    () => {
      const segments: RouteSegment[] = [];
      for (let index = 0; index < routePlaces.length - 1; index += 1) {
        const from = routePlaces[index];
        const to = routePlaces[index + 1];
        if (from && to) {
          segments.push({
            id: `${from.id}-${to.id}-${index}`,
            from,
            to,
            leg: selectedDay.legs[index],
            index,
          });
        }
      }
      return segments;
    },
    [routePlaces, selectedDay.legs]
  );

  const selectedSegment = routeSegments[selectedSegmentIndex] ?? routeSegments[0];
  const selectedPlace =
    (selectedStopIndex !== null && routePlaces[selectedStopIndex]) ||
    (selectedPlaceId && placeById.get(selectedPlaceId)) ||
    routePlaces[0];
  const activePlaceIds = new Set(selectedDay.route);
  const alternatePlaceIds = new Set<string>();
  if (baseDay.id === 4) {
    alternatePlaceIds.add("schilthorn");
    alternatePlaceIds.add("jungfraujoch");
  }
  const contextPlaces = useMemo(() => {
    const ids = new Set([...selectedDay.route, ...alternatePlaceIds]);
    return Array.from(ids)
      .map((id) => placeById.get(id))
      .filter((place): place is Place => Boolean(place));
  }, [alternatePlaceIds, selectedDay.route]);
  const selectedFoodSpots = useMemo(() => {
    const routeIds = new Set(selectedDay.route);
    return foodSpots.filter((spot) => routeIds.has(spot.placeId));
  }, [selectedDay.route]);
  const routeOrderLabelsByPlaceId = new Map<string, string>();
  selectedDay.route.forEach((placeId, index) => {
    const current = routeOrderLabelsByPlaceId.get(placeId);
    routeOrderLabelsByPlaceId.set(placeId, current ? `${current}/${index + 1}` : String(index + 1));
  });
  const selectDay = (dayId: number) => {
    setSelectedDayId(dayId);
    setSelectedSegmentIndex(0);
    setSelectedPlaceId(null);
    setSelectedStopIndex(0);
  };
  const selectStop = (place: Place, index: number) => {
    setSelectedStopIndex(index);
    setSelectedPlaceId(place.id);
    if (index > 0) {
      setSelectedSegmentIndex(index - 1);
    } else {
      setSelectedSegmentIndex(0);
    }
  };
  const selectSegment = (segmentIndex: number) => {
    setSelectedSegmentIndex(segmentIndex);
    const destination = routeSegments[segmentIndex]?.to;
    if (destination) {
      setSelectedPlaceId(destination.id);
      setSelectedStopIndex(segmentIndex + 1);
    }
  };
  const selectedPassItems = passItems.filter((item) => passSelection.has(item.id));
  const passScores = {
    swiss: selectedPassItems.reduce((total, item) => total + item.swiss, 0),
    half: selectedPassItems.reduce((total, item) => total + item.half, 0),
    saver: selectedPassItems.reduce((total, item) => total + item.saver, 0),
    point: selectedPassItems.reduce((total, item) => total + item.point, 0),
  };
  const bookingCounts = bookingItems.reduce(
    (counts, item) => {
      counts[bookingStatus[item] ?? "todo"] += 1;
      return counts;
    },
    { todo: 0, checking: 0, booked: 0 }
  );
  const exportLines = [
    `${selectedDay.date}: ${selectedDay.title}`,
    selectedDay.base,
    ...selectedDay.legs.map((leg) =>
      `${leg.from} -> ${leg.to} (${leg.duration})${leg.recommendedTime ? ` | ${leg.recommendedTime}` : ""}`
    ),
    `Weather note: ${weatherAdvice[selectedDay.id][weatherMode]}`,
    `Luggage: ${(luggageNotes[selectedDay.id] ?? []).join(" ")}`,
  ];

  return (
    <main className="app-shell">
      <section className="planner-top">
        <div className="intro">
          <p className="eyebrow">No-car Switzerland planner</p>
          <h1>Zurich loop, July 9-14</h1>
          <p className="intro-copy">
            A practical planning site for a scenic public-transport trip through Zurich, Lucerne, Mt. Rigi,
            Lauterbrunnen, Interlaken, and a flexible Bern finale.
          </p>
          <div className="focus-row" aria-label="Planning focus">
            {planningFocus.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.label}>
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </span>
              );
            })}
          </div>
          <a className="hero-link" href="/prices">
            Price breakdown <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="trip-stats">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label}>
                <Icon size={20} aria-hidden="true" />
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="timeline-panel" aria-label="Trip days">
          <div className="panel-heading">
            <CalendarDays size={19} aria-hidden="true" />
            <h2>Itinerary</h2>
          </div>
          <div className="timeline-list">
            {dayPlans.map((day) => (
              <button
                key={day.id}
                className={day.id === selectedDay.id ? "day-button selected" : "day-button"}
                onClick={() => selectDay(day.id)}
                type="button"
              >
                <span className="day-number">Day {day.id}</span>
                <span className="day-date">{day.date}</span>
                <strong>{day.title}</strong>
                <span className="day-base">
                  <Hotel size={14} aria-hidden="true" />
                  {day.base}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="map-panel" aria-label="Map and active day details">
          <div className="map-wrap">
            <MapContainer center={[46.95, 8.1]} zoom={8} scrollWheelZoom={true} className="leaflet-map">
              <MapViewportController
                contextPlaces={contextPlaces}
                routePlaces={routePlaces}
                selectedDayId={selectedDay.id}
                selectedPlace={selectedPlace}
                selectedPlaceId={selectedPlaceId}
              />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {places.map((place) => (
                <Marker
                  key={place.id}
                  position={place.coordinates}
                  icon={
                    activePlaceIds.has(place.id)
                      ? routeMarkerIcon(routeOrderLabelsByPlaceId.get(place.id) ?? "1", selectedPlace?.id === place.id)
                      : alternatePlaceIds.has(place.id)
                        ? alternateMarkerIcon
                      : defaultMarkerIcon
                  }
                  eventHandlers={{
                    click: () => {
                      const firstRouteIndex = selectedDay.route.findIndex((placeId) => placeId === place.id);
                      selectStop(place, Math.max(firstRouteIndex, 0));
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <strong>{place.name}</strong>
                    <br />
                    {place.role}
                  </Tooltip>
                </Marker>
              ))}
              {foodSpots.map((spot) => {
                const isDayRelevant = selectedFoodSpots.some((selectedSpot) => selectedSpot.id === spot.id);
                return (
                  <Marker
                    key={spot.id}
                    position={spot.coordinates}
                    icon={foodMarkerIcon}
                    opacity={isDayRelevant ? 1 : 0.42}
                    zIndexOffset={isDayRelevant ? 650 : 120}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      <strong>{spot.name}</strong>
                      <br />
                      {spot.veganLevel}
                      <br />
                      {spot.bestFor}
                    </Tooltip>
                  </Marker>
                );
              })}
              {places
                .filter((place) => activePlaceIds.has(place.id))
                .map((place) => (
                  <Circle
                    key={`${place.id}-active`}
                    center={place.coordinates}
                    radius={2600}
                    pathOptions={{ color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 0.16, weight: 2 }}
                  />
                ))}
              {routeSegments.map((segment) => (
                <Polyline
                  key={segment.id}
                  positions={[segment.from.coordinates, segment.to.coordinates]}
                  pathOptions={{
                    color: segment.index === selectedSegmentIndex ? "#e11d48" : "#1d4ed8",
                    weight: segment.index === selectedSegmentIndex ? 7 : 4,
                    opacity: segment.index === selectedSegmentIndex ? 0.95 : 0.7,
                  }}
                  eventHandlers={{
                    click: () => {
                      selectSegment(segment.index);
                    },
                  }}
                >
                  <Tooltip sticky opacity={1}>
                    <strong>
                      {segment.leg?.from ?? segment.from.name} to {segment.leg?.to ?? segment.to.name}
                    </strong>
                    <br />
                    {segment.leg?.duration ?? "Route segment"}
                  </Tooltip>
                </Polyline>
              ))}
            </MapContainer>
            <div className="map-caption">
              <MapPinned size={17} aria-hidden="true" />
              <span>
                {selectedSegment
                  ? `Selected commute: ${selectedSegment.leg?.from ?? selectedSegment.from.name} -> ${
                      selectedSegment.leg?.to ?? selectedSegment.to.name
                    }`
                  : `Selected route: ${selectedDay.route.map((id) => placeById.get(id)?.name).join(" -> ")}`}
              </span>
            </div>
          </div>

          <article className="day-detail">
            <div className="detail-header">
              <div>
                <span>{selectedDay.date}</span>
                <h2>{selectedDay.title}</h2>
              </div>
              <strong>{selectedDay.effort}</strong>
            </div>
            <p>{selectedDay.summary}</p>
            <div className="insight-grid">
              <div>
                <Sparkles size={18} aria-hidden="true" />
                <h3>Jaw-drop factor</h3>
                <p>{selectedDay.jawDrop}</p>
              </div>
              <div>
                <CloudSun size={18} aria-hidden="true" />
                <h3>Weather call</h3>
                <p>{selectedDay.weather}</p>
              </div>
            </div>
            <div className="price-estimate-panel">
              <div className="panel-heading">
                <BadgeSwissFranc size={18} aria-hidden="true" />
                <h3>Budget estimate</h3>
              </div>
              <div className="price-estimate-grid">
                {selectedDay.priceEstimates.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.estimate}</strong>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="place-detail control-detail">
            <div className="panel-heading">
              <CloudSun size={19} aria-hidden="true" />
              <h2>Weather Decision</h2>
            </div>
            <div className="segmented-control" aria-label="Weather mode">
              {(Object.keys(weatherLabels) as WeatherMode[]).map((mode) => (
                <button
                  key={mode}
                  className={mode === weatherMode ? "selected-segment" : ""}
                  onClick={() => setWeatherMode(mode)}
                  type="button"
                >
                  {weatherLabels[mode]}
                </button>
              ))}
            </div>
            <p className="decision-note">{weatherAdvice[selectedDay.id][weatherMode]}</p>

            {(selectedDay.id === 4 || selectedDay.id === 5) && (
              <div className="variant-controls">
                {selectedDay.id === 4 && (
                  <div>
                    <h3>Mountain route</h3>
                    <div className="segmented-control">
                      <button
                        className={mountainVariant === "schilthorn" ? "selected-segment" : ""}
                        onClick={() => setMountainVariant("schilthorn")}
                        type="button"
                      >
                        Schilthorn
                      </button>
                      <button
                        className={mountainVariant === "jungfraujoch" ? "selected-segment" : ""}
                        onClick={() => setMountainVariant("jungfraujoch")}
                        type="button"
                      >
                        Jungfraujoch
                      </button>
                    </div>
                  </div>
                )}
                {selectedDay.id === 5 && (
                  <label className="toggle-row">
                    <input
                      checked={includeHarder}
                      onChange={(event) => setIncludeHarder(event.target.checked)}
                      type="checkbox"
                    />
                    Include Harder Kulm before Bern
                  </label>
                )}
              </div>
            )}
          </article>

          <article className="place-detail">
            <div className="panel-heading">
              <MapPinned size={19} aria-hidden="true" />
              <h2>Place Info</h2>
            </div>
            {selectedPlace && (
              <div className="place-info-card">
                <div className="place-type-row">
                  <strong>{selectedPlace.kind}</strong>
                  <span>{selectedPlace.region}</span>
                </div>
                <h3>{selectedPlace.name}</h3>
                <p>{selectedPlace.bestFor}</p>
                <div className="place-meta">
                  <strong>Allow: {selectedPlace.allow}</strong>
                  <small>{selectedPlace.practical}</small>
                </div>
                <div className="mini-chip-row">
                  {selectedPlace.dontMiss.map((item) => (
                    <em key={item}>{item}</em>
                  ))}
                </div>
                <div className="place-extra-list">
                  {selectedPlace.extraDetails.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>

        <section className="planning-panel">
          <article className="section-block">
            <div className="panel-heading">
              <Route size={19} aria-hidden="true" />
              <h2>Commute Options</h2>
            </div>
            <div className="leg-list">
              {selectedDay.legs.map((leg, index) => {
                const Icon = iconByMode[leg.mode];
                const ticketPlan = ticketPlanForLeg(leg);
                const scheduleLink = ticketPlan.schedule ?? ticketPlan.primary;
                return (
                  <div className={index === selectedSegmentIndex ? "leg selected-leg" : "leg"} key={`${leg.from}-${leg.to}`}>
                    <button
                      className="leg-main"
                      onClick={() => {
                        selectSegment(index);
                      }}
                      type="button"
                    >
                      <div className="leg-icon">
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <strong>
                          {leg.from} <ChevronRight size={14} aria-hidden="true" /> {leg.to}
                        </strong>
                        <span>{leg.duration}</span>
                        {leg.recommendedTime && <em className="recommended-time">{leg.recommendedTime}</em>}
                        <p>{leg.guidance}</p>
                      </div>
                    </button>
                    <div className="ticket-advice">
                      <div className="ticket-mini">
                        <TicketCheck size={14} aria-hidden="true" />
                        <span>{ticketPlan.cheapest}</span>
                      </div>
                      <small>{ticketPlan.timing}</small>
                      <div className="ticket-links">
                        <a href={ticketPlan.primary.url} target="_blank" rel="noreferrer">
                          {ticketPlan.primary.label} <ExternalLink size={12} aria-hidden="true" />
                        </a>
                        {scheduleLink.url !== ticketPlan.primary.url && (
                          <a href={scheduleLink.url} target="_blank" rel="noreferrer">
                            {scheduleLink.label} <ExternalLink size={12} aria-hidden="true" />
                          </a>
                        )}
                        {ticketPlan.operator && (
                          <a href={ticketPlan.operator.url} target="_blank" rel="noreferrer">
                            Compare in {ticketPlan.operator.label.replace(" timetable & tickets", "")}{" "}
                            <ExternalLink size={12} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedSegment && (
              <div className="selected-commute-note">
                <div>
                  <MousePointerClick size={16} aria-hidden="true" />
                  <span>Map segment selected: {selectedSegment.from.name} to {selectedSegment.to.name}</span>
                </div>
                {selectedSegment.leg && (
                  <SelectedTicketDetail leg={selectedSegment.leg} />
                )}
              </div>
            )}
          </article>

          {selectedDay.decisions && (
            <article className="section-block decision-block">
              <div className="panel-heading">
                <Mountain size={19} aria-hidden="true" />
                <h2>Mountain Decision</h2>
              </div>
              <div className="decision-grid">
                {selectedDay.decisions.map((decision) => (
                  <div key={decision.title}>
                    <h3>{decision.title}</h3>
                    <p>{decision.bestFor}</p>
                    <span>{decision.tradeoff}</span>
                    <small>{decision.logistics}</small>
                  </div>
                ))}
              </div>
            </article>
          )}

          <article className="section-block food-block">
            <div className="panel-heading">
              <Utensils size={19} aria-hidden="true" />
              <h2>Food Nearby</h2>
            </div>
            <p className="food-block-note">
              Vegan-friendly options shown on the map as V pins. They are not route stops; use them as food backup and
              reservation ideas.
            </p>
            <div className="food-grid">
              {selectedFoodSpots.map((spot) => (
                <FoodSpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </article>

          <article className="section-block">
            <div className="panel-heading">
              <BadgeCheck size={19} aria-hidden="true" />
              <h2>Highlights & Backup</h2>
            </div>
            <div className="highlight-list">
              {selectedDay.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
            {selectedDay.optionalAddOns && (
              <div className="optional-addons">
                <strong>Optional Add-ons</strong>
                <div className="highlight-list">
                  {selectedDay.optionalAddOns.map((addOn) => (
                    <span key={addOn}>{addOn}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="backup-note">
              <Info size={16} aria-hidden="true" />
              {selectedDay.backup}
            </p>
          </article>

          <article className="section-block places-block">
            <div className="panel-heading">
              <MapPinned size={19} aria-hidden="true" />
              <h2>Route Order</h2>
            </div>
            <div className="route-order-list">
              {routePlaces.map((place, index) => (
                <button
                  key={`${place.id}-${index}`}
                  className={index === selectedStopIndex ? "route-stop active-stop" : "route-stop"}
                  onClick={() => selectStop(place, index)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  <div>
                    <strong>{place.name}</strong>
                    <em>{place.kind}</em>
                    <small>{place.role}</small>
                    <p>{place.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="section-block">
            <div className="panel-heading">
              <TicketCheck size={19} aria-hidden="true" />
              <h2>Booking Checklist</h2>
            </div>
            <div className="checklist">
              {selectedDay.reminders.map((reminder) => (
                <label key={reminder.label}>
                  <input type="checkbox" />
                  <span>{reminder.label}</span>
                  <em className={`priority ${reminder.priority}`}>{priorityLabel(reminder.priority)}</em>
                </label>
              ))}
            </div>
          </article>

          <article className="section-block luggage-block">
            <div className="panel-heading">
              <Briefcase size={19} aria-hidden="true" />
              <h2>Luggage Notes</h2>
            </div>
            <div className="note-list">
              {(luggageNotes[selectedDay.id] ?? []).map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </article>
        </section>
      </section>

      <section className="bottom-grid">
        <article className="pass-panel planner-tool-panel calculator-panel">
          <div className="panel-heading">
            <Calculator size={19} aria-hidden="true" />
            <h2>Pass Calculator</h2>
          </div>
          <p className="verify-copy">
            This is a fit-score planner, not a price quote. Use it to decide what to price exactly in SBB/Jungfrau apps.
          </p>
          <div className="pass-calculator-grid">
            <div className="pass-item-list">
              {passItems.map((item) => (
                <label key={item.id}>
                  <input
                    checked={passSelection.has(item.id)}
                    onChange={(event) => {
                      const next = new Set(passSelection);
                      if (event.target.checked) {
                        next.add(item.id);
                      } else {
                        next.delete(item.id);
                      }
                      setPassSelection(next);
                    }}
                    type="checkbox"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div className="score-grid">
              <div>
                <strong>Swiss Travel Pass</strong>
                <span>{scoreLabel(passScores.swiss)}</span>
              </div>
              <div>
                <strong>Half Fare Card</strong>
                <span>{scoreLabel(passScores.half)}</span>
              </div>
              <div>
                <strong>Saver Day Passes</strong>
                <span>{scoreLabel(passScores.saver)}</span>
              </div>
              <div>
                <strong>Point-to-point</strong>
                <span>{scoreLabel(passScores.point)}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="sources-panel planner-tool-panel status-panel">
          <div className="panel-heading">
            <ListChecks size={19} aria-hidden="true" />
            <h2>Booking Status</h2>
          </div>
          <p className="verify-copy">
            Booked {bookingCounts.booked} / Checking {bookingCounts.checking} / To do {bookingCounts.todo}
          </p>
          <div className="booking-status-list">
            {bookingItems.map((item) => (
              <label key={item}>
                <span>{item}</span>
                <select
                  value={bookingStatus[item] ?? "todo"}
                  onChange={(event) =>
                    setBookingStatus((current) => ({
                      ...current,
                      [item]: event.target.value as BookingStatus,
                    }))
                  }
                >
                  <option value="todo">To do</option>
                  <option value="checking">Checking</option>
                  <option value="booked">Booked</option>
                </select>
              </label>
            ))}
          </div>
        </article>

        <article className="pass-panel rail-panel">
          <div className="panel-heading">
            <TicketCheck size={19} aria-hidden="true" />
            <h2>Rail Pass Comparison</h2>
          </div>
          <p className="verify-copy">
            Use this as a shortlist, then verify exact July 2026 prices and discounts before buying.
          </p>
          <div className="pass-grid">
            {passOptions.map((option) => (
              <div key={option.name} className="pass-card">
                <h3>{option.name}</h3>
                <p>{option.fit}</p>
                <strong>{option.goodFor}</strong>
                <span>{option.watchOut}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="pass-panel export-panel">
          <div className="panel-heading">
            <Printer size={19} aria-hidden="true" />
            <h2>Export / Print</h2>
          </div>
          <p className="verify-copy">Compact current-day sheet for saving, printing, or using during the trip.</p>
          <div className="export-card">
            {exportLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <button className="print-button" onClick={() => window.print()} type="button">
            Print current plan
          </button>
        </article>

        <article className="sources-panel source-panel">
          <div className="panel-heading">
            <ExternalLink size={19} aria-hidden="true" />
            <h2>Planning Sources</h2>
          </div>
          <div className="source-list">
            {sourceLinks.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.label}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
