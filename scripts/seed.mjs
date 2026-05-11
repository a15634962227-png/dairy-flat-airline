import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });


import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "dairy_flat_airline";

if (!uri) {
  throw new Error("MONGODB_URI is missing. Check your .env.local file.");
}

const client = new MongoClient(uri);

const airports = [
  {
    code: "NZNE",
    name: "Dairy Flat Airport",
    city: "Dairy Flat",
    country: "New Zealand",
    timezone: "Pacific/Auckland",
  },
  {
    code: "YSSY",
    name: "Sydney Airport",
    city: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
  },
  {
    code: "NZRO",
    name: "Rotorua Airport",
    city: "Rotorua",
    country: "New Zealand",
    timezone: "Pacific/Auckland",
  },
  {
    code: "NZGB",
    name: "Claris Airport",
    city: "Great Barrier Island",
    country: "New Zealand",
    timezone: "Pacific/Auckland",
  },
  {
    code: "NZCI",
    name: "Tuuta Airport",
    city: "Chatham Islands",
    country: "New Zealand",
    timezone: "Pacific/Chatham",
  },
  {
    code: "NZTL",
    name: "Lake Tekapo Airport",
    city: "Lake Tekapo",
    country: "New Zealand",
    timezone: "Pacific/Auckland",
  },
];

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function makeDate(date, time, offset = "+12:00") {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return new Date(`${yyyy}-${mm}-${dd}T${time}:00${offset}`);
}

function createSchedule({
  flightNumber,
  origin,
  destination,
  aircraftCode,
  aircraftModel,
  capacity,
  departureTime,
  arrivalTime,
  price,
}) {
  const originAirport = airports.find((a) => a.code === origin);
  const destinationAirport = airports.find((a) => a.code === destination);

  return {
    flightNumber,
    origin,
    destination,
    originAirportName: originAirport?.name || origin,
    destinationAirportName: destinationAirport?.name || destination,
    aircraft: {
      code: aircraftCode,
      model: aircraftModel,
      capacity,
    },
    departureTime,
    arrivalTime,
    price,
    capacity,
    bookings: [],
    status: "scheduled",
    createdAt: new Date(),
  };
}

function generateSchedules() {
  const schedules = [];

  // Monday 1 June 2026
  const startMonday = new Date("2026-06-01T00:00:00+12:00");

  for (let week = 0; week < 8; week++) {
    const monday = addDays(startMonday, week * 7);

    // Sydney: Friday outbound, Sunday return
    const friday = addDays(monday, 4);
    const sunday = addDays(monday, 6);

    schedules.push(
      createSchedule({
        flightNumber: "DF101",
        origin: "NZNE",
        destination: "YSSY",
        aircraftCode: "SJ30-1",
        aircraftModel: "SyberJet SJ30",
        capacity: 6,
        departureTime: makeDate(friday, "10:00", "+12:00"),
        arrivalTime: makeDate(friday, "12:30", "+10:00"),
        price: 780,
      })
    );

    schedules.push(
      createSchedule({
        flightNumber: "DF102",
        origin: "YSSY",
        destination: "NZNE",
        aircraftCode: "SJ30-1",
        aircraftModel: "SyberJet SJ30",
        capacity: 6,
        departureTime: makeDate(sunday, "15:00", "+10:00"),
        arrivalTime: makeDate(sunday, "21:30", "+12:00"),
        price: 780,
      })
    );

    // Rotorua: Mon-Fri, two return trips daily
    for (let day = 0; day <= 4; day++) {
      const date = addDays(monday, day);

      schedules.push(
        createSchedule({
          flightNumber: "DF201",
          origin: "NZNE",
          destination: "NZRO",
          aircraftCode: "SF50-1",
          aircraftModel: "Cirrus SF50",
          capacity: 4,
          departureTime: makeDate(date, "07:30"),
          arrivalTime: makeDate(date, "08:10"),
          price: 180,
        }),
        createSchedule({
          flightNumber: "DF202",
          origin: "NZRO",
          destination: "NZNE",
          aircraftCode: "SF50-1",
          aircraftModel: "Cirrus SF50",
          capacity: 4,
          departureTime: makeDate(date, "08:45"),
          arrivalTime: makeDate(date, "09:25"),
          price: 180,
        }),
        createSchedule({
          flightNumber: "DF203",
          origin: "NZNE",
          destination: "NZRO",
          aircraftCode: "SF50-1",
          aircraftModel: "Cirrus SF50",
          capacity: 4,
          departureTime: makeDate(date, "16:30"),
          arrivalTime: makeDate(date, "17:10"),
          price: 180,
        }),
        createSchedule({
          flightNumber: "DF204",
          origin: "NZRO",
          destination: "NZNE",
          aircraftCode: "SF50-1",
          aircraftModel: "Cirrus SF50",
          capacity: 4,
          departureTime: makeDate(date, "17:45"),
          arrivalTime: makeDate(date, "18:25"),
          price: 180,
        })
      );
    }

    // Great Barrier: Mon/Wed/Fri outbound, Tue/Thu/Sat return
    for (const day of [0, 2, 4]) {
      const date = addDays(monday, day);
      schedules.push(
        createSchedule({
          flightNumber: "DF301",
          origin: "NZNE",
          destination: "NZGB",
          aircraftCode: "SF50-2",
          aircraftModel: "Cirrus SF50",
          capacity: 4,
          departureTime: makeDate(date, "09:00"),
          arrivalTime: makeDate(date, "09:35"),
          price: 150,
        })
      );
    }

    for (const day of [1, 3, 5]) {
      const date = addDays(monday, day);
      schedules.push(
        createSchedule({
          flightNumber: "DF302",
          origin: "NZGB",
          destination: "NZNE",
          aircraftCode: "SF50-2",
          aircraftModel: "Cirrus SF50",
          capacity: 4,
          departureTime: makeDate(date, "09:00"),
          arrivalTime: makeDate(date, "09:35"),
          price: 150,
        })
      );
    }

    // Chatham Islands: Tue/Fri outbound, Wed/Sat return
    for (const day of [1, 4]) {
      const date = addDays(monday, day);
      schedules.push(
        createSchedule({
          flightNumber: "DF401",
          origin: "NZNE",
          destination: "NZCI",
          aircraftCode: "HJET-1",
          aircraftModel: "HondaJet Elite",
          capacity: 5,
          departureTime: makeDate(date, "10:00", "+12:00"),
          arrivalTime: makeDate(date, "13:30", "+12:45"),
          price: 520,
        })
      );
    }

    for (const day of [2, 5]) {
      const date = addDays(monday, day);
      schedules.push(
        createSchedule({
          flightNumber: "DF402",
          origin: "NZCI",
          destination: "NZNE",
          aircraftCode: "HJET-1",
          aircraftModel: "HondaJet Elite",
          capacity: 5,
          departureTime: makeDate(date, "10:00", "+12:45"),
          arrivalTime: makeDate(date, "11:30", "+12:00"),
          price: 520,
        })
      );
    }

    // Lake Tekapo: Monday outbound, Tuesday return
    const tuesday = addDays(monday, 1);

    schedules.push(
      createSchedule({
        flightNumber: "DF501",
        origin: "NZNE",
        destination: "NZTL",
        aircraftCode: "HJET-2",
        aircraftModel: "HondaJet Elite",
        capacity: 5,
        departureTime: makeDate(monday, "11:00"),
        arrivalTime: makeDate(monday, "12:45"),
        price: 390,
      }),
      createSchedule({
        flightNumber: "DF502",
        origin: "NZTL",
        destination: "NZNE",
        aircraftCode: "HJET-2",
        aircraftModel: "HondaJet Elite",
        capacity: 5,
        departureTime: makeDate(tuesday, "13:30"),
        arrivalTime: makeDate(tuesday, "15:15"),
        price: 390,
      })
    );
  }

  return schedules;
}

function loadPassengersFromCsv() {
  const csvPath = path.join(process.cwd(), "data", "randomnames.csv");

  if (!fs.existsSync(csvPath)) {
    throw new Error("data/randomnames.csv not found.");
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const seenEmails = new Set();

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sourceId, title, firstName, lastName, gender, email] = line
        .split(",")
        .map((value) => value.trim());

      return {
        sourceId: Number(sourceId),
        title,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        gender,
        email: email?.toLowerCase(),
        createdAt: new Date(),
      };
    })
    .filter((p) => {
      if (!p.email) return false;
      if (seenEmails.has(p.email)) return false;

      seenEmails.add(p.email);
      return true;
    });
}

async function main() {
  try {
    await client.connect();

    const db = client.db(dbName);

    console.log(`Connected to database: ${dbName}`);

    await db.collection("airports").deleteMany({});
    await db.collection("passengers").deleteMany({});
    await db.collection("schedules").deleteMany({});

    const passengers = loadPassengersFromCsv();
    const schedules = generateSchedules();

    await db.collection("airports").insertMany(airports);
    await db.collection("passengers").insertMany(passengers);
    await db.collection("schedules").insertMany(schedules);

    await db.collection("passengers").createIndex({ email: 1 }, { unique: true });
    await db.collection("schedules").createIndex({
      origin: 1,
      destination: 1,
      departureTime: 1,
    });
    await db.collection("schedules").createIndex({
      "bookings.bookingReference": 1,
    });
    await db.collection("schedules").createIndex({
      "bookings.email": 1,
    });

    console.log(`Inserted airports: ${airports.length}`);
    console.log(`Inserted passengers: ${passengers.length}`);
    console.log(`Inserted schedules: ${schedules.length}`);
    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();