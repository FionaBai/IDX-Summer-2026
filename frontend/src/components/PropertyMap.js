import "./PropertyMap.css";

function PropertyMap({
  latitude,
  longitude,
}) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined ||
    latitude === "" ||
    longitude === ""
  ) {
    return null;
  }

  const apiKey =
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <p>
        Map unavailable: Google Maps API key is
        not configured.
      </p>
    );
  }

  const location = `${latitude},${longitude}`;

  const embedUrl =
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(location)}` +
    `&zoom=15`;

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(location)}`;

  return (
    <section className="property-map">
      <h2>Location</h2>

      <iframe
        title="Property location"
        src={embedUrl}
        width="100%"
        height="400"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="property-map__directions"
      >
        Get Directions
      </a>
    </section>
  );
}

export default PropertyMap;