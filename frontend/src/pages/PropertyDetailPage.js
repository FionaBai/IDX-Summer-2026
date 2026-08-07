import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchPropertyDetail,
  fetchPropertyOpenHouses,
} from "../api/client";

import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import OpenHouseList from "../components/OpenHouseList";

import "./PropertyDetailPage.css";

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}

function displayValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  return value;
}

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] =
    useState(null);

  const [openHouses, setOpenHouses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const propertyData =
          await fetchPropertyDetail(id, {
            signal: controller.signal,
          });

        setProperty(propertyData);

        try {
          const openHouseData =
            await fetchPropertyOpenHouses(id, {
              signal: controller.signal,
            });

          setOpenHouses(
            Array.isArray(openHouseData)
              ? openHouseData
              : []
          );
        } catch (openHouseError) {
          if (
            openHouseError.name === "AbortError"
          ) {
            return;
          }

          console.error(
            "Unable to load open houses:",
            openHouseError
          );

          setOpenHouses([]);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        setProperty(null);

        setError(
          requestError.message ||
            "Unable to load this property."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <main className="property-detail-page">
        <p role="status">
          Loading property...
        </p>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="property-detail-page">
        <button
          type="button"
          onClick={() => navigate("/")}
        >
          ← Back to listings
        </button>

        <div role="alert">
          <h1>Could not load property</h1>
          <p>
            {error ||
              "The requested property was not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="property-detail-page">
      <button
        type="button"
        className="property-detail-page__back"
        onClick={() => navigate(-1)}
      >
        ← Back to listings
      </button>

      <PropertyImageGallery
        rawPhotos={property.L_Photos}
      />

      <section className="property-detail-page__header">
        <h1>
          {formatPrice(property.L_SystemPrice)}
        </h1>

        <p>
          {displayValue(property.L_Address)}
        </p>

        <p>
          {displayValue(property.L_City)},{" "}
          {displayValue(property.L_State)}{" "}
          {displayValue(property.L_Zip)}
        </p>
      </section>

      <section className="property-stats">
        <div>
          <strong>
            {displayValue(property.L_Keyword2)}
          </strong>
          <span>Beds</span>
        </div>

        <div>
          <strong>
            {displayValue(property.LM_Dec_3)}
          </strong>
          <span>Baths</span>
        </div>

        <div>
          <strong>
            {displayValue(property.LM_Int2_3)}
          </strong>
          <span>Sq Ft</span>
        </div>

        <div>
          <strong>
            {displayValue(property.YearBuilt)}
          </strong>
          <span>Year Built</span>
        </div>
      </section>

      <section className="property-description">
        <h2>Description</h2>

        <p>
          {property.L_Remarks ||
            "No description available."}
        </p>
      </section>

      <section className="property-details">
        <h2>Property Details</h2>

        <dl>
          <div>
            <dt>Property Type</dt>
            <dd>
              {displayValue(property.L_Type_)}
            </dd>
          </div>

          <div>
            <dt>Status</dt>
            <dd>
              {displayValue(property.L_Status)}
            </dd>
          </div>

          <div>
            <dt>Garage</dt>
            <dd>
              {displayValue(
                property.L_Keyword5
              )}
            </dd>
          </div>

          <div>
            <dt>Days on Market</dt>
            <dd>
              {displayValue(
                property.DaysOnMarket
              )}
            </dd>
          </div>

          <div>
            <dt>Subdivision</dt>
            <dd>
              {displayValue(
                property.SubdivisionName ||
                  property.LM_char10_70
              )}
            </dd>
          </div>

          <div>
            <dt>MLS ID</dt>
            <dd>
              {displayValue(
                property.L_DisplayId
              )}
            </dd>
          </div>
        </dl>
      </section>

      <OpenHouseList
        openHouses={openHouses}
      />

      <PropertyMap
        latitude={property.LMD_MP_Latitude}
        longitude={
          property.LMD_MP_Longitude
        }
      />
    </main>
  );
}

export default PropertyDetailPage;