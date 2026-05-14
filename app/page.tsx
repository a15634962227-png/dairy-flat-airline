export default function Home() {
  const actions = [
    {
      label: "Search",
      title: "Search flights",
      description:
        "Search scheduled flights by origin, destination, date range, and number of passengers.",
      href: "/schedules",
    },
    {
      label: "Manage",
      title: "Manage booking",
      description:
        "Find an existing booking by reference number and cancel it if required.",
      href: "/manage",
    },
    {
      label: "Passenger",
      title: "Passenger bookings",
      description:
        "Display all scheduled flights on which a given passenger is booked.",
      href: "/passenger",
    },
  ];

  const routes = [
    ["Sydney", "NZNE", "YSSY"],
    ["Rotorua", "NZNE", "NZRO"],
    ["Great Barrier Island", "NZNE", "NZGB"],
    ["Chatham Islands", "NZNE", "NZCI"],
    ["Lake Tekapo", "NZNE", "NZTL"],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                159.352 Assignment 2
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Dairy Flat Airline Booking System
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Search scheduled flights, create bookings, view invoices,
                cancel existing bookings, and check all flights booked by a
                passenger.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Main airport
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">NZNE</p>
              <p className="text-sm text-slate-500">Dairy Flat Airport</p>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Main services
              </p>
              <h2 className="mt-2 text-2xl font-bold">Booking operations</h2>
            </div>

            <p className="text-sm font-semibold text-slate-400">
              Select a service to continue
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="rounded-2xl bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  {action.label}
                </p>

                <h3 className="mt-3 text-2xl font-bold">{action.title}</h3>

                <p className="mt-3 min-h-20 text-sm leading-6 text-slate-500">
                  {action.description}
                </p>

                <span className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-2 text-sm font-bold text-white">
                  Open →
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Booking flow
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Search → Book → Invoice
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The system supports scheduled flight search, booking creation,
              invoice display, booking cancellation, and passenger-based
              booking lookup.
            </p>

            <div className="mt-5 grid gap-3">
              {[
                "Flight search",
                "Booking reference generation",
                "Invoice view",
                "Cancellation status tracking",
                "Passenger booking records",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  Available routes
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  Scheduled destinations
                </h2>
              </div>

              <p className="text-sm font-semibold text-slate-500">From NZNE</p>
            </div>

            <div className="mt-5 grid gap-3">
              {routes.map(([name, from, to]) => (
                <div
                  key={to}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-slate-500">
                      {from} → {to}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}