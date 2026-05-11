import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

function getConfirmedSeats(bookings: any[] = []) {
  return bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((total, booking) => total + Number(booking.seats || 1), 0);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date1 = searchParams.get("date1");
    const date2 = searchParams.get("date2");
    const orig = searchParams.get("orig");
    const dest = searchParams.get("dest");
    const passengers = Number(searchParams.get("passengers") || "1");

    if (!date1 || !date2 || !orig || !dest) {
      return NextResponse.json(
        {
          ok: false,
          message: "date1, date2, orig and dest are required.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const schedules = await db
      .collection("schedules")
      .find({
        origin: orig,
        destination: dest,
        departureTime: {
          $gte: new Date(`${date1}T00:00:00`),
          $lte: new Date(`${date2}T23:59:59`),
        },
        status: "scheduled",
      })
      .sort({ departureTime: 1 })
      .toArray();

    const results = schedules.map((schedule) => {
      const confirmedSeats = getConfirmedSeats(schedule.bookings || []);
      const availableSeats = Number(schedule.capacity) - confirmedSeats;

      return {
        ...schedule,
        confirmedSeats,
        availableSeats,
        canBook: availableSeats >= passengers,
      };
    });

    return NextResponse.json({
      ok: true,
      count: results.length,
      schedules: results,
    });
  } catch (error) {
    console.error("Schedules search API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch schedules.",
      },
      { status: 500 }
    );
  }
}