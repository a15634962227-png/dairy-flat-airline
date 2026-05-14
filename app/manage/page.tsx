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
            <div className="mx-auto max-w-5xl">
                <a href="/" className="text-sm font-medium text-blue-700">
                    ← Back to home
                </a>

                <header className="mt-3 border-b border-slate-200 pb-6">
                    <h1 className="text-3xl font-bold">Manage booking</h1>
                    <p className="mt-2 text-slate-500">
                        Search for a booking by reference number and cancel it if required.
                    </p>
                </header>

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-4 md:flex-row md:items-end"
                    >
                        <label className="flex-1">
                            <span className="mb-1 block text-sm font-medium">
                                Booking reference
                            </span>
                            <input
                                value={reference}
                                onChange={(e) => setReference(e.target.value.toUpperCase())}
                                placeholder="e.g. DF-ZFNTI4"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 uppercase"
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
                            {loading ? "Searching..." : "Find booking"}
                        </button>
                    </form>
                </section>

                {message && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                        {message}
                    </div>
                )}

                {booking && schedule && (
                    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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

                            <span
                                className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold ${booking.status === "confirmed"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {booking.status}
                            </span>
                        </div>

                        <div className="mt-8 grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">Passenger</p>
                                <p className="font-semibold">{booking.passengerName}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-semibold">{booking.email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Seats</p>
                                <p className="font-semibold">{booking.seats}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Total</p>
                                <p className="font-semibold">NZD ${booking.totalPrice}</p>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: "24px",
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <a
                                href={`/invoice/${booking.bookingReference}`}
                                style={{
                                    display: "inline-flex",
                                    height: "48px",
                                    minWidth: "150px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff",
                                    color: "#1e293b",
                                    paddingLeft: "20px",
                                    paddingRight: "20px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                View invoice
                            </a>

                            {booking.status === "confirmed" ? (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    style={{
                                        display: "inline-flex",
                                        height: "48px",
                                        minWidth: "170px",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        backgroundColor: "#ffffff",
                                        color: cancelling ? "#64748b" : "#dc2626",
                                        paddingLeft: "20px",
                                        paddingRight: "20px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        cursor: cancelling ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {cancelling ? "Cancelling..." : "Cancel booking"}
                                </button>
                            ) : (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        height: "48px",
                                        minWidth: "240px",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "8px",
                                        backgroundColor: "#f1f5f9",
                                        color: "#64748b",
                                        paddingLeft: "20px",
                                        paddingRight: "20px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                    }}
                                >
                                    This booking has been cancelled
                                </span>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}