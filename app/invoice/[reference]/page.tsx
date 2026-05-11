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
        <div className="mx-auto max-w-4xl">Loading invoice...</div>
      </main>
    );
  }

  if (!booking || !schedule) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">
          <a href="/schedules" className="text-sm font-medium text-blue-700">
            ← Back to search
          </a>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {message || "Booking not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a href="/schedules" className="text-sm font-medium text-blue-700">
          ← Search another flight
        </a>

        <header className="mt-3 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Booking invoice
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Booking {booking.bookingReference}
          </h1>
          <p className="mt-2 text-slate-500">
            This page summarises the confirmed booking and flight details.
          </p>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{schedule.flightNumber}</h2>
              <p className="mt-2 text-lg font-semibold">
                {schedule.originAirportName} → {schedule.destinationAirportName}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Depart: {formatDateTime(schedule.departureTime, schedule.origin)}
              </p>
              <p className="text-sm text-slate-500">
                Arrive: {formatDateTime(schedule.arrivalTime, schedule.destination)}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Aircraft: {schedule.aircraft.model}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                booking.status === "confirmed"
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-xl font-bold">Passenger and payment</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Passenger</span>
              <span className="font-medium">{booking.passengerName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Email</span>
              <span className="font-medium">{booking.email}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Seats</span>
              <span className="font-medium">{booking.seats}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Price per seat</span>
              <span className="font-medium">NZD ${schedule.price}</span>
            </div>

            <div className="flex justify-between pt-3 text-xl font-bold">
              <span>Total</span>
              <span>NZD ${booking.totalPrice}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/manage"
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
            >
              Manage booking
            </a>

            <a
              href="/schedules"
              className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-white"
            >
              Search flights
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}