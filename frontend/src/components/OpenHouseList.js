import "./OpenHouseList.css";

function getRemarks(allData) {
  if (!allData) {
    return "";
  }

  try {
    const parsed =
      typeof allData === "string"
        ? JSON.parse(allData)
        : allData;

    return parsed?.OpenHouseRemarks || "";
  } catch {
    return "";
  }
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const parts = value.split(":");

  let hour = Number(parts[0]);
  const minute = parts[1] || "00";

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  hour %= 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${suffix}`;
}

function OpenHouseList({ openHouses }) {
  if (
    !Array.isArray(openHouses) ||
    openHouses.length === 0
  ) {
    return (
      <section className="open-houses">
        <h2>Open Houses</h2>
        <p>No open houses scheduled</p>
      </section>
    );
  }

  return (
    <section className="open-houses">
      <h2>Open Houses</h2>

      <div className="open-houses__list">
        {openHouses.map((openHouse) => {
          const remarks = getRemarks(
            openHouse.all_data
          );

          return (
            <article
              className="open-house"
              key={openHouse.id}
            >
              <strong>
                {formatDate(
                  openHouse.OpenHouseDate
                )}
              </strong>

              <p>
                {formatTime(
                  openHouse.OH_StartTime
                )}
                {" – "}
                {formatTime(
                  openHouse.OH_EndTime
                )}
              </p>

              {remarks && <p>{remarks}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default OpenHouseList;