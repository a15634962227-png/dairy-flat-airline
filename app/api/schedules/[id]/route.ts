import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";

function getConfirmedSeats(bookings: any[] = []) {
  return bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((total, booking) => total + Number(booking.seats || 1), 0);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid schedule id." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const schedule = await db
      .collection("schedules")
      .findOne({ _id: new ObjectId(id) });

    if (!schedule) {
      return NextResponse.json(
        { ok: false, message: "Schedule not found." },
        { status: 404 }
      );
    }

    const confirmedSeats = getConfirmedSeats(schedule.bookings || []);
    const availableSeats = Number(schedule.capacity) - confirmedSeats;

    return NextResponse.json({
      ok: true,
      schedule: {
        ...schedule,
        confirmedSeats,
        availableSeats,
      },
    });
  } catch (error) {
    console.error("Schedule detail API error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch schedule." },
      { status: 500 }
    );
  }
}