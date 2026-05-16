"use client";

import { useEffect, useState } from "react";

type Booking = {
  bookingReference: string;
  passengerName: string;
  email: string;
  seats: number;
  totalPrice: number;
  status: string;
  bookedAt: string;
  cancelledAt?: string | null;
};

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

export default function ManagePage() {
  const [reference, setReference] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function searchBooking(targetReference: string) {
    setLoading(true);
    setMessage("");
    setBooking(null);
    setSchedule(null);

    try {
      const cleanReference = targetReference.trim().toUpperCase();

      const response = await fetch(
        `/api/bookings/${encodeURIComponent(cleanReference)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Booking not found.");
        return;
      }

      setBooking(data.booking);
      setSchedule(data.schedule);
    } catch {
      setMessage("Something went wrong while searching for the booking.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    searchBooking(reference);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referenceFromUrl = params.get("reference");

    if (referenceFromUrl) {
      const cleanReference = referenceFromUrl.trim().toUpperCase();
      setReference(cleanReference);
      searchBooking(cleanReference);
    }
  }, []);

  async function handleCancel() {
    if (!booking) return;

    const ok = window.confirm(
      `Cancel booking ${booking.bookingReference}? This action cannot be undone.`
    );

    if (!ok) return;

    setCancelling(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/bookings/${booking.bookingReference}/cancel`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to cancel booking.");
        return;
      }

      setBooking({
        ...booking,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });

      setMessage("Booking cancelled successfully.");
    } catch {
      setMessage("Something went wrong while cancelling the booking.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-bold text-blue-700">
          ← Back to home
        </a>

        <header className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Manage</p>

          <h1 className="mt-2 text-3xl font-bold">Manage booking</h1>

          <p className="mt-3 text-slate-500">
            Search for a booking by reference number and cancel it if required.
          </p>
        </header>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Find booking records</h2>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Booking reference
              </span>

              <input
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. DF-ZFNTI4"
                className="h-11 w-full rounded-xl bg-slate-50 px-3 text-sm font-semibold uppercase text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-blue-700 px-8 font-bold text-white hover:bg-blue-800 disabled:bg-slate-400 md:min-w-[190px]"
            >
              {loading ? "Searching..." : "Find booking"}
            </button>
          </form>
        </section>

        {message && (
          <div
            className={`mt-6 rounded-xl p-4 text-sm font-semibold ${
              message.toLowerCase().includes("success")
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {message}
          </div>
        )}

        {booking && schedule && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Search results
                </p>
                <h2 className="mt-1 text-2xl font-bold">Booking details</h2>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                {booking.bookingReference}
              </p>
            </div>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Booking {booking.bookingReference}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold">
                      {schedule.flightNumber}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {schedule.aircraft.model}
                    </span>
                  </div>

                  <p className="mt-3 text-lg font-semibold">
                    {schedule.originAirportName} →{" "}
                    {schedule.destinationAirportName}
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-slate-500">
                    <p>
                      <span className="font-semibold text-slate-800">
                        Depart:
                      </span>{" "}
                      {formatDateTime(schedule.departureTime, schedule.origin)}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-800">
                        Arrive:
                      </span>{" "}
                      {formatDateTime(
                        schedule.arrivalTime,
                        schedule.destination
                      )}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-800">
                        Aircraft:
                      </span>{" "}
                      {schedule.aircraft.model}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-[170px] flex-col items-center justify-center rounded-2xl bg-slate-50 p-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-bold capitalize ${
                      booking.status === "confirmed"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {booking.status}
                  </span>

                  <p className="mt-4 text-sm text-slate-500">
                    Seats: {booking.seats}
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    NZD ${booking.totalPrice}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Passenger
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    {booking.passengerName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">Email</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {booking.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">Seats</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {booking.seats}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">Total</p>
                  <p className="mt-1 font-bold text-slate-900">
                    NZD ${booking.totalPrice}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`/invoice/${booking.bookingReference}`}
                  className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  View invoice
                </a>

                {booking.status === "confirmed" ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-red-600 ring-1 ring-slate-200 hover:bg-red-50 disabled:text-slate-500"
                  >
                    {cancelling ? "Cancelling..." : "Cancel booking"}
                  </button>
                ) : (
                  <span className="inline-flex h-11 min-w-[230px] items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-500">
                    This booking has been cancelled
                  </span>
                )}
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}