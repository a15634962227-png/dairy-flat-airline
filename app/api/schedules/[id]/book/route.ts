import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../../lib/mongodb";

function getConfirmedSeats(bookings: any[] = []) {
  return bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((total, booking) => total + Number(booking.seats || 1), 0);
}

function generateBookingReference() {
  return `DF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const seats = Number(body.seats || 1);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid schedule id." },
        { status: 400 }
      );
    }

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { ok: false, message: "Passenger name and email are required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(seats) || seats < 1 || seats > 6) {
      return NextResponse.json(
        { ok: false, message: "Seats must be between 1 and 6." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const schedules = db.collection("schedules");
    const passengers = db.collection("passengers");

    const schedule = await schedules.findOne({ _id: new ObjectId(id) });

    if (!schedule) {
      return NextResponse.json(
        { ok: false, message: "Schedule not found." },
        { status: 404 }
      );
    }

    const confirmedSeats = getConfirmedSeats(schedule.bookings || []);
    const availableSeats = Number(schedule.capacity) - confirmedSeats;

    if (seats > availableSeats) {
      return NextResponse.json(
        {
          ok: false,
          message: "This flight does not have enough available seats.",
        },
        { status: 409 }
      );
    }

    const existingBooking = (schedule.bookings || []).find(
      (booking: any) =>
        booking.email === email && booking.status === "confirmed"
    );

    if (existingBooking) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "This passenger already has a confirmed booking on this flight.",
        },
        { status: 409 }
      );
    }

    let passenger = await passengers.findOne({ email });

    if (!passenger) {
      const insertResult = await passengers.insertOne({
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        createdAt: new Date(),
      });

      passenger = {
        _id: insertResult.insertedId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
      };
    }

    const bookingReference = generateBookingReference();

    const booking = {
      bookingReference,
      passengerId: passenger._id,
      passengerName: `${firstName} ${lastName}`,
      email,
      seats,
      totalPrice: seats * Number(schedule.price),
      status: "confirmed",
      bookedAt: new Date(),
      cancelledAt: null,
    };

    await schedules.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          bookings: booking as any,
        },
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Booking confirmed.",
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
      },
    });
  } catch (error) {
    console.error("Booking API error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to create booking." },
      { status: 500 }
    );
  }
}