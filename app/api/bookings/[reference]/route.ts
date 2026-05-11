import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await context.params;
    const bookingReference = String(reference || "").trim().toUpperCase();

    if (!bookingReference) {
      return NextResponse.json(
        { ok: false, message: "Booking reference is required." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const schedule = await db.collection("schedules").findOne({
      "bookings.bookingReference": bookingReference,
    });

    if (!schedule) {
      return NextResponse.json(
        { ok: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const booking = (schedule.bookings || []).find(
      (item: any) => item.bookingReference === bookingReference
    );

    if (!booking) {
      return NextResponse.json(
        { ok: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
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
  } catch (error) {
    console.error("Booking lookup API error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch booking." },
      { status: 500 }
    );
  }
}