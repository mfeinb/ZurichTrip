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
} from "lucide-react";
import {
  dayPlans,
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

function applyVariants(day: DayPlan, mountainVariant: "schilthorn" | "jungfraujoch", includeHarder: boolean): DayPlan {
  if (day.id === 4 && mountainVariant === "jungfraujoch") {
    return {
      ...day,
      title: "Jungfraujoch weather-window day",
      summary:
        "Use this version only if the webcams and forecast are strong: it is the most iconic glacier day, but also the costliest and most weather-sensitive.",
      jawDrop: "Jungfraujoch gives the glacier and high-Alpine station experience; save it for the clearest day.",
      route: ["lauterbrunnen", "jungfraujoch", "lauterbrunnen"],
      legs: [
        {
          from: "Lauterbrunnen",
          to: "Jungfraujoch",
          mode: "train",
          duration: "Most of the day",
          guidance: "Price this carefully with your pass choice and only commit if visibility is excellent.",
        },
        {
          from: "Jungfraujoch",
          to: "Lauterbrunnen",
          mode: "train",
          duration: "Most of the day",
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
      route: ["lauterbrunnen", "interlaken", "brienz", "interlaken", "harder", "interlaken", "bern"],
      legs: [
        day.legs[0],
        day.legs[1],
        day.legs[2],
        {
          from: "Interlaken Ost",
          to: "Harder Kulm",
          mode: "funicular",
          duration: "~10 min each way",
          guidance: "Use as a quick viewpoint if visibility is good and energy remains.",
        },
        {
          from: "Harder Kulm",
          to: "Interlaken Ost",
          mode: "funicular",
          duration: "~10 min",
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
    ...selectedDay.legs.map((leg) => `${leg.from} -> ${leg.to} (${leg.duration})`),
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
