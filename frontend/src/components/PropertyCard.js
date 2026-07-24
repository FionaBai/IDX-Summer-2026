import { useState } from "react";
import "./PropertyCard.css";

const FALLBACK_IMAGE =
  "https://placehold.co/600x400?text=No+Property+Photo";

function extractPhotoUrl(photo) {
  if (typeof photo === "string") {
    return photo.trim() || null;
  }

  if (!photo || typeof photo !== "object") {
    return null;
  }

  // These cover common shapes used by listing feeds.
  return (
    photo.url ||
    photo.Url ||
    photo.URL ||
    photo.uri ||
    photo.href ||
    photo.MediaURL ||
    photo.MediaUrl ||
    photo.MediaURLLarge ||
    null
  );
}

function getFirstPhotoUrl(rawPhotos) {
  if (!rawPhotos) {
    return null;
  }

  let photos = rawPhotos;

  if (typeof rawPhotos === "string") {
    const trimmed = rawPhotos.trim();

    if (!trimmed || trimmed === "null") {
      return null;
    }

    try {
      photos = JSON.parse(trimmed);
    } catch {
      // Some rows may contain a plain URL rather than JSON.
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }

      return null;
    }
  }

  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  return extractPhotoUrl(photos[0]);
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US").format(numericValue);
}

function PropertyCard({ property }) {
  const [imageFailed, setImageFailed] = useState(false);

  const parsedPhotoUrl = getFirstPhotoUrl(property.L_Photos);
  const imageUrl =
    imageFailed || !parsedPhotoUrl
      ? FALLBACK_IMAGE
      : parsedPhotoUrl;

  const address =
    property.L_Address ||
    property.L_AddressStreet ||
    "Address unavailable";

  return (
    <article className="property-card">
      <img
        className="property-card__image"
        src={imageUrl}
        alt={address}
        onError={() => setImageFailed(true)}
      />

      <div className="property-card__body">
        <h2 className="property-card__price">
          {formatPrice(property.L_SystemPrice)}
        </h2>

        <p className="property-card__address">
          {address}
        </p>

        <p className="property-card__location">
          {[property.L_City, property.L_State]
            .filter(Boolean)
            .join(", ") || "Location unavailable"}
        </p>

        <div className="property-card__details">
          <span>
            <strong>{formatNumber(property.L_Keyword2)}</strong>{" "}
            beds
          </span>

          <span>
            <strong>{formatNumber(property.LM_Dec_3)}</strong>{" "}
            baths
          </span>

          <span>
            <strong>{formatNumber(property.LM_Int2_3)}</strong>{" "}
            sqft
          </span>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;