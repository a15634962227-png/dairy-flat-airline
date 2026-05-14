"use client";

import { useState } from "react";

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

type PassengerBookingResult = {
    booking: Booking;
    schedule: Schedule;
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

export default function PassengerPage() {
    const [email, setEmail] = useState("ella.lee2@blobmail.com");
    const [results, setResults] = useState<PassengerBookingResult[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSearch(event: React.FormEvent) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setResults([]);

        try {
            const cleanEmail = email.trim().toLowerCase();

            const response = await fetch(
                `/api/passenger-bookings?email=${encodeURIComponent(cleanEmail)}`
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to search passenger bookings.");
                return;
            }

            setResults(data.bookings || []);

            if (!data.bookings || data.bookings.length === 0) {
                setMessage("No bookings were found for this passenger.");
            }
        } catch {
            setMessage("Something went wrong while searching passenger bookings.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
            <div className="mx-auto max-w-5xl">
                <a href="/" className="text-sm font-medium text-blue-700">
                    ← Back to home
                </a>

                <header className="mt-3 border-b border-slate-200 pb-6">
                    <h1 className="text-3xl font-bold">Passenger bookings</h1>
                    <p className="mt-2 text-slate-500">
                        Display all scheduled flights on which a passenger is booked.
                    </p>
                </header>

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-4 md:flex-row md:items-end"
                    >
                        <label className="flex-1">
                            <span className="mb-1 block text-sm font-medium">
                                Passenger email
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. ella.lee2@blobmail.com"
                                className="h-11 w-full rounded-lg border border-slate-300 px-3"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: "inline-flex",
                                height: "43px",
                                minWidth: "220px",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "12px",
                                border: "none",
                                backgroundColor: "#1d4ed8",
                                color: "#ffffff",
                                paddingLeft: "32px",
                                paddingRight: "32px",
                                fontSize: "18px",
                                fontWeight: 700,
                                boxShadow: "0 2px 4px rgba(15, 23, 42, 0.12)",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? "Searching..." : "Find bookings"}
                        </button>
                    </form>
                </section>

                {message && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                        {message}
                    </div>
                )}

                <section className="mt-8 space-y-4">
                    {results.map(({ booking, schedule }) => (
                        <article
                            key={booking.bookingReference}
                            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                                        Booking {booking.bookingReference}
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold">
                                        {schedule.flightNumber}
                                    </h2>

                                    <p className="mt-2 text-lg font-semibold">
                                        {schedule.originAirportName} →{" "}
                                        {schedule.destinationAirportName}
                                    </p>

                                    <p className="mt-3 text-sm text-slate-500">
                                        Depart:{" "}
                                        {formatDateTime(schedule.departureTime, schedule.origin)}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Arrive:{" "}
                                        {formatDateTime(schedule.arrivalTime, schedule.destination)}
                                    </p>

                                    <p className="mt-3 text-sm text-slate-500">
                                        Aircraft: {schedule.aircraft.model}
                                    </p>
                                </div>

                                <div className="text-left md:text-right">
                                    <span
                                        className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold ${booking.status === "confirmed"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {booking.status}
                                    </span>

                                    <p className="mt-4 text-sm text-slate-500">
                                        Seats: {booking.seats}
                                    </p>

                                    <p className="text-lg font-bold">
                                        NZD ${booking.totalPrice}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <a
                                    href={`/invoice/${booking.bookingReference}`}
                                    className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-base font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    View invoice
                                </a>

                                <a
                                    href={`/manage?reference=${booking.bookingReference}`}
                                    className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-lg bg-blue-700 px-5 text-base font-semibold text-white hover:bg-blue-800"
                                >
                                    Manage
                                </a>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}
