import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    await db.collection("healthchecks").insertOne({
      message: "MongoDB connection successful",
      createdAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      message: "Connected to MongoDB",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "MongoDB connection failed",
      },
      { status: 500 }
    );
  }
}