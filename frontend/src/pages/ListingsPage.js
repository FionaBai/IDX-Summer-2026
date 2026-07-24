import { useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import "./ListingsPage.css";

const DEFAULT_LIMIT = 20;

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] =
    useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestControllerRef = useRef(null);

  async function loadProperties(filters = {}) {
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await fetchProperties(
        {
          ...filters,
          limit: DEFAULT_LIMIT,
          offset: 0,
        },
        {
          signal: controller.signal,
        }
      );

      setProperties(
        Array.isArray(data.results)
          ? data.results
          : []
      );

      setTotal(Number(data.total) || 0);
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        return;
      }

      setProperties([]);
      setTotal(0);

      setError(
        requestError.message ||
          "Unable to load properties."
      );
    } finally {
      if (
        requestControllerRef.current === controller
      ) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadProperties({});

    return () => {
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
  }, []);

  function handleSearch(filters) {
    setActiveFilters(filters);
    loadProperties(filters);
  }

  function handleClear() {
    setActiveFilters({});
    loadProperties({});
  }

  return (
    <main className="listings-page">
      <header className="listings-page__header">
        <h1>Property Listings</h1>

        {!loading && !error && (
          <p>
            Showing {properties.length} of {total}{" "}
            properties
          </p>
        )}
      </header>

      <PropertyFilters
        onSearch={handleSearch}
        onClear={handleClear}
        disabled={loading}
      />

      {loading && (
        <div
          className="status-message"
          role="status"
        >
          Loading properties...
        </div>
      )}

      {!loading && error && (
        <div
          className="status-message status-message--error"
          role="alert"
        >
          <h2>Could not load properties</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        properties.length === 0 && (
          <div className="status-message">
            <h2>No properties found</h2>
            <p>
              Try changing or clearing some of your
              filters.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        properties.length > 0 && (
          <section className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={
                  property.L_ListingID ||
                  property.id
                }
                property={property}
              />
            ))}
          </section>
        )}
    </main>
  );
}

export default ListingsPage;