import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";

export default component$(() => {
  const days = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "7", label: "Sunday" },
  ];

  const selectedDay = useSignal("");
  const selectedAirport = useSignal("");
  const airports = useSignal<Array<{ AirportID: string; AirportName: string }>>([]);
  const result = useSignal<string | null>(null);

  useTask$(async () => {
    const res = await fetch("/airports");

    if (res.ok) {
      airports.value = await res.json();
    }
  });

  const handleClick = $(async () => {
    const params = new URLSearchParams({
      dayOfWeek: selectedDay.value,
      airportId: selectedAirport.value,
    });
    const res = await fetch(`/predict?${params.toString()}`);
    const data = await res.json();
    result.value = JSON.stringify(data);
  });

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 class="text-3xl font-bold mb-8 mt-8 text-blue-700">Predict Flight Delay</h1>
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-6">
        <div>
          <label class="block mb-2 font-medium text-gray-700">Day of Week</label>
          <select
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedDay.value}
            onChange$={(e) => (selectedDay.value = (e.target as HTMLSelectElement).value)}
          >
            <option value="">Select day</option>
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label class="block mb-2 font-medium text-gray-700">Airport</label>
          <select
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedAirport.value}
            onChange$={(e) => (selectedAirport.value = (e.target as HTMLSelectElement).value)}
          >
            <option value="">Select airport</option>
            {airports.value.map((a) => (
              <option key={a.AirportID} value={a.AirportID}>
                {a.AirportName}
              </option>
            ))}
          </select>
        </div>
        <button
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          disabled={!selectedDay.value || !selectedAirport.value}
          onClick$={handleClick}
        >
          Predict
        </button>
        {result.value && (
          <div class="mt-6 p-4 bg-gray-100 rounded text-gray-800 break-all">
            <strong>Prediction Result:</strong>
            <pre>{result.value}</pre>
          </div>
        )}
      </div>
    </div>
  );
});
