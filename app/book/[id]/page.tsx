"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  aircraft: {
    code: string;
    model: string;
    capacity: number;
  };
};

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

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [firstName, setFirstName] = useState("Ella");
  const [lastName, setLastName] = useState("Lee");
  const [email, setEmail] = useState("ella.lee@blobmail.com");
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await fetch(`/api/schedules/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load schedule.");
          return;
        }

        setSchedule(data.schedule);
      } catch {
        setMessage("Something went wrong while loading the schedule.");
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!schedule) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/schedules/${id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          seats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Booking failed.");
        return;
      }

      router.push(`/invoice/${data.booking.bookingReference}`);
    } catch {
      setMessage("Something went wrong while creating the booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">Loading schedule...</div>
      </main>
    );
  }

  if (!schedule) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">
          <a href="/schedules" className="text-sm font-medium text-blue-700">
            ← Back to search
          </a>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {message || "Schedule not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a href="/schedules" className="text-sm font-medium text-blue-700">
          ← Back to search
        </a>

        <header className="mt-3 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold">Make a booking</h1>
          <p className="mt-2 text-slate-500">
            Confirm the flight details and enter passenger information.
          </p>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold">{schedule.flightNumber}</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {schedule.aircraft.model}
                </span>
              </div>

              <p className="text-lg font-semibold">
                {schedule.originAirportName} → {schedule.destinationAirportName}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Depart: {formatDateTime(schedule.departureTime, schedule.origin)}
              </p>
              <p className="text-sm text-slate-500">
                Arrive: {formatDateTime(schedule.arrivalTime, schedule.destination)}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Available seats: {schedule.availableSeats} / {schedule.capacity}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-3xl font-bold">NZD ${schedule.price}</p>
              <p className="mt-1 text-sm text-slate-500">per passenger</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-xl font-bold">Passenger details</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="mb-1 block text-sm font-medium">First name</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Last name</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Seats</span>
              <input
                type="number"
                min="1"
                max={schedule.availableSeats}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </label>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span>Price per seat</span>
                <span>NZD ${schedule.price}</span>
              </div>
              <div className="mt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>NZD ${schedule.price * seats}</span>
              </div>
            </div>

            {message && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || schedule.availableSeats <= 0}
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
            >
              {submitting ? "Confirming booking..." : "Confirm booking"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}