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
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl bg-white p-8 shadow-sm">
          <a href="/" className="text-sm font-bold text-blue-700">
            ← Back to home
          </a>

          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Flight search
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Search scheduled flights
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Choose an origin, destination, date range, and passenger count
                to find available scheduled flights.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Search mode
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                Schedule
              </p>
              <p className="text-sm text-slate-500">Calendar based</p>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Search criteria
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Find available flights
              </h2>
            </div>

            <p className="mb-4 text-sm font-medium text-slate-400 md:mb-0 md:-translate-y-2">
              Seats are checked against current bookings
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-5">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 180px",
                gap: "20px",
              }}
            >
              <label>
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  From
                </span>
                <select
                  value={orig}
                  onChange={(e) => setOrig(e.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  To
                </span>
                <select
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Passengers
                </span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="h-12 w-full rounded-xl bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 180px",
                gap: "20px",
                alignItems: "end",
              }}
            >
              <label>
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  From date
                </span>
                <input
                  type="date"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  To date
                </span>
                <input
                  type="date"
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl bg-blue-700 px-8 text-base font-bold text-white shadow-sm hover:bg-blue-800 disabled:bg-slate-400"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm font-semibold text-amber-800 shadow-sm">
            {message}
          </div>
        )}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Search results
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Available scheduled flights
              </h2>
            </div>

            <p className="text-sm font-semibold text-slate-400">
              {schedules.length} result{schedules.length === 1 ? "" : "s"}
            </p>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="text-lg font-bold text-slate-800">
                No flight results displayed yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Use the search form above to display scheduled flights.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <article
                  key={schedule._id}
                  className="rounded-2xl bg-slate-50 p-6 transition hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold">
                          {schedule.flightNumber}
                        </h3>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          {schedule.aircraft.model}
                        </span>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        {schedule.originAirportName} →{" "}
                        {schedule.destinationAirportName}
                      </p>

                      <div className="mt-3 grid gap-1 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-900">
                            Depart:
                          </span>{" "}
                          {formatDateTime(
                            schedule.departureTime,
                            schedule.origin
                          )}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-900">
                            Arrive:
                          </span>{" "}
                          {formatDateTime(
                            schedule.arrivalTime,
                            schedule.destination
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-[180px] flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold">
                        NZD ${schedule.price}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Seats: {schedule.availableSeats} / {schedule.capacity}
                      </p>

                      {schedule.canBook ? (
                        <a
                          href={`/book/${schedule._id}`}
                          className="mt-3 inline-flex h-10 min-w-[120px] items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
                        >
                          Book now
                        </a>
                      ) : (
                        <button
                          disabled
                          className="mt-3 inline-flex h-10 min-w-[150px] items-center justify-center rounded-lg bg-slate-300 px-5 text-sm font-bold text-slate-600"
                        >
                          Not enough seats
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}