export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            159.352 Assignment 2
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight">
            Online booking system for a fictitious airline
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Search scheduled flights, make bookings, view invoices, cancel
            existing bookings, and check all flights booked by a passenger.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <a
            href="/schedules"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Search
            </p>
            <h2 className="mt-3 text-2xl font-bold">Search flights</h2>
            <p className="mt-3 text-slate-500">
              Search by origin, destination, date range, and number of
              passengers.
            </p>
          </a>

          <a
            href="/manage"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Manage
            </p>
            <h2 className="mt-3 text-2xl font-bold">Manage booking</h2>
            <p className="mt-3 text-slate-500">
              Find an existing booking by reference number and cancel it if
              required.
            </p>
          </a>

          <a
            href="/passenger"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Passenger
            </p>
            <h2 className="mt-3 text-2xl font-bold">Passenger bookings</h2>
            <p className="mt-3 text-slate-500">
              Display all scheduled flights on which a given passenger is
              booked.
            </p>
          </a>
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold">Available routes</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["NZNE", "YSSY", "Sydney"],
              ["NZNE", "NZRO", "Rotorua"],
              ["NZNE", "NZGB", "Great Barrier Island"],
              ["NZNE", "NZCI", "Chatham Islands"],
              ["NZNE", "NZTL", "Lake Tekapo"],
            ].map(([from, to, name]) => (
              <div
                key={to}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-slate-500">
                    {from} → {to}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}