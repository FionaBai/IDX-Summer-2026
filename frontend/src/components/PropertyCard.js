import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import PropertyImageCarousel from "./PropertyImageCarousel";
import "./PropertyCard.css";

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
  const navigate = useNavigate();

  const address =
    property.L_Address ||
    property.L_AddressStreet ||
    "Address unavailable";

  function handleCardClick() {
    if (!property.L_ListingID) {
      return;
    }

    navigate(
      `/property/${encodeURIComponent(property.L_ListingID)}`
    );
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  }

  return (
    <article
      className="property-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <PropertyImageCarousel
        rawPhotos={property.L_Photos}
        address={address}
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
            <strong>
              {formatNumber(property.L_Keyword2)}
            </strong>{" "}
            beds
          </span>

          <span>
            <strong>
              {formatNumber(property.LM_Dec_3)}
            </strong>{" "}
            baths
          </span>

          <span>
            <strong>
              {formatNumber(property.LM_Int2_3)}
            </strong>{" "}
            sqft
          </span>
        </div>
      </div>
    </article>
  );
}

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    L_ListingID: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    L_Photos: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),

    L_SystemPrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    L_Address: PropTypes.string,
    L_AddressStreet: PropTypes.string,
    L_City: PropTypes.string,
    L_State: PropTypes.string,

    L_Keyword2: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    LM_Dec_3: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    LM_Int2_3: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  }).isRequired,
};

export default PropertyCard;