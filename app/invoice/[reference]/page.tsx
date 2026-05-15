"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function InvoicePage() {
  const params = useParams();
  const reference = String(params.reference);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${reference}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Booking not found.");
          return;
        }

        setBooking(data.booking);
        setSchedule(data.schedule);
      } catch {
        setMessage("Something went wrong while loading the booking.");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [reference]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          Loading invoice...
        </div>
      </main>
    );
  }

  if (!booking || !schedule) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <a href="/schedules" className="text-sm font-bold text-blue-700">
            ← Back to search
          </a>

          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">
            {message || "Booking not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <a href="/schedules" className="text-sm font-bold text-blue-700">
          ← Search another flight
        </a>

        <header className="mt-4 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Booking invoice
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Booking {booking.bookingReference}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                This page summarises the confirmed booking, flight details, and
                passenger payment information.
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-bold capitalize ${
                booking.status === "confirmed"
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{schedule.flightNumber}</h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {schedule.aircraft.model}
                </span>
              </div>

              <p className="mt-3 text-lg font-semibold">
                {schedule.originAirportName} → {schedule.destinationAirportName}
              </p>

              <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p>
                  <span className="font-semibold text-slate-800">Depart:</span>{" "}
                  {formatDateTime(schedule.departureTime, schedule.origin)}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Arrive:</span>{" "}
                  {formatDateTime(schedule.arrivalTime, schedule.destination)}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Aircraft:</span>{" "}
                  {schedule.aircraft.model}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-6 py-5 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Booking reference
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {booking.bookingReference}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">Passenger and payment</h2>

          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Passenger</span>
                <span className="font-semibold text-slate-900">
                  {booking.passengerName}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900">
                  {booking.email}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Seats</span>
                <span className="font-semibold text-slate-900">
                  {booking.seats}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Price per seat</span>
                <span className="font-semibold text-slate-900">
                  NZD ${schedule.price}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-slate-200 pt-5 text-2xl font-bold">
              <span>Total</span>
              <span>NZD ${booking.totalPrice}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/manage?reference=${booking.bookingReference}`}
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              Manage booking
            </a>

            <a
              href="/schedules"
              className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 hover:bg-slate-200"
            >
              Search flights
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}