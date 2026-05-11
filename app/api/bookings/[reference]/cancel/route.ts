import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/mongodb";

export async function PATCH(
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
    const schedules = db.collection("schedules");

    const schedule = await schedules.findOne({
      bookings: {
        $elemMatch: {
          bookingReference,
        },
      },
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

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { ok: false, message: "This booking has already been cancelled." },
        { status: 409 }
      );
    }

    await schedules.updateOne(
      {
        _id: schedule._id,
        "bookings.bookingReference": bookingReference,
      },
      {
        $set: {
          "bookings.$.status": "cancelled",
          "bookings.$.cancelledAt": new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Booking cancelled successfully.",
      bookingReference,
    });
  } catch (error) {
    console.error("Cancel booking API error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to cancel booking." },
      { status: 500 }
    );
  }
}
