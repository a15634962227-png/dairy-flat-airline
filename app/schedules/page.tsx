"use client";

import { useState } from "react";

type Schedule = {
  _id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  originAirportName: string;
  destinationAirportName: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  capacity: number;
  availableSeats: number;
  canBook: boolean;
  aircraft: {
    code: string;
    model: string;
    capacity: number;
  };
};

const airports = [
  { code: "NZNE", name: "Dairy Flat" },
  { code: "YSSY", name: "Sydney" },
  { code: "NZRO", name: "Rotorua" },
  { code: "NZGB", name: "Great Barrier Island" },
  { code: "NZCI", name: "Chatham Islands" },
  { code: "NZTL", name: "Lake Tekapo" },
];

const airportTimezones: Record<string, string> = {
  NZNE: "Pacific/Auckland",
  YSSY: "Australia/Sydney",
  NZRO: "Pacific/Auckland",
  NZGB: "Pacific/Auckland",
  NZCI: "Pacific/Chatham",
  NZTL: "Pacific/Auckland",
};

function formatDateTime(value: string, airportCode: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: airportTimezones[airportCode] || "Pacific/Auckland",
  }).format(new Date(value));
}

export default function SchedulesPage() {
  const [orig, setOrig] = useState("NZNE");
  const [dest, setDest] = useState("YSSY");
  const [date1, setDate1] = useState("2026-06-10");
  const [date2, setDate2] = useState("2026-06-30");
  const [passengers, setPassengers] = useState(1);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSchedules([]);

    try {
      const params = new URLSearchParams({
        date1,
        date2,
        orig,
        dest,
        passengers: String(passengers),
      });

      const response = await fetch(`/api/schedules?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Search failed.");
        return;
      }

      setSchedules(data.schedules || []);

      if (!data.schedules || data.schedules.length === 0) {
        setMessage(
          "No flights were found for this route and date range. Try a wider date range or another destination."
        );
      }
    } catch {
      setMessage("Something went wrong while searching for flights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <a href="/" className="text-sm font-medium text-blue-700">
              ← Back to home
            </a>
            <h1 className="mt-3 text-3xl font-bold">Search flights</h1>
            <p className="mt-2 text-slate-500">
              Search scheduled flights by real calendar dates, origin and
              destination.
            </p>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 md:grid-cols-6 md:items-end"
          >
            <label className="md:col-span-1">
              <span className="mb-1 block text-sm font-medium">From</span>
              <select
                value={orig}
                onChange={(e) => setOrig(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-1">
              <span className="mb-1 block text-sm font-medium">To</span>
              <select
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">From date</span>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">To date</span>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">
                Passengers
              </span>
              <input
                type="number"
                min="1"
                max="6"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </section>

        {message && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            {message}
          </div>
        )}

        <section className="mt-8 space-y-4">
          {schedules.map((schedule) => (
            <article
              key={schedule._id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {schedule.flightNumber}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      {schedule.aircraft.model}
                    </span>
                  </div>

                  <p className="text-lg font-semibold">
                    {schedule.originAirportName} →{" "}
                    {schedule.destinationAirportName}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Depart: {formatDateTime(schedule.departureTime, schedule.origin)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Arrive: {formatDateTime(schedule.arrivalTime, schedule.destination)}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-2xl font-bold">NZD ${schedule.price}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Available seats: {schedule.availableSeats} /{" "}
                    {schedule.capacity}
                  </p>

                  {schedule.canBook ? (
                    <a
                      href={`/book/${schedule._id}`}
                      className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
                    >
                      Book now
                    </a>
                  ) : (
                    <button
                      disabled
                      className="mt-4 rounded-lg bg-slate-300 px-5 py-2.5 font-semibold text-slate-600"
                    >
                      Not enough seats
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}