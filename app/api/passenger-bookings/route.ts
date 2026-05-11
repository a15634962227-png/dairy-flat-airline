import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = String(searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Passenger email is required." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const schedules = await db
      .collection("schedules")
      .find({
        bookings: {
          $elemMatch: {
            email,
          },
        },
      })
      .sort({ departureTime: 1 })
      .toArray();

    const bookings = [];

    for (const schedule of schedules) {
      const matchedBookings = (schedule.bookings || []).filter(
        (booking: any) => String(booking.email || "").toLowerCase() === email
      );

      for (const booking of matchedBookings) {
        bookings.push({
          booking,
          schedule: {
            _id: schedule._id,
            flightNumber: schedule.flightNumber,
            origin: schedule.origin,
            destination: schedule.destination,
            originAirportName: schedule.originAirportName,
            destinationAirportName: schedule.destinationAirportName,
            departureTime: schedule.departureTime,
            arrivalTime: schedule.arrivalTime,
            aircraft: schedule.aircraft,
            price: schedule.price,
            capacity: schedule.capacity,
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Passenger bookings API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch passenger bookings.",
      },
      { status: 500 }
    );
  }
}