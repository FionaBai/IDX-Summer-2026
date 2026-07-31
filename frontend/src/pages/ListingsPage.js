import {
  useEffect,
  useRef,
  useState,
} from "react";

import { fetchProperties } from "../api/client";
import Pagination from "../components/Pagination";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import "./ListingsPage.css";

const DEFAULT_ITEMS_PER_PAGE = 20;

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);

  const [activeFilters, setActiveFilters] =
    useState({});

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage] = useState(
    DEFAULT_ITEMS_PER_PAGE
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestControllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    // Cancel any older request before starting this one.
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    requestControllerRef.current = controller;

    async function loadProperties() {
      setLoading(true);
      setError("");

      const offset =
        (currentPage - 1) * itemsPerPage;

      try {
        const data = await fetchProperties(
          {
            ...activeFilters,
            limit: itemsPerPage,
            offset,
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
        // An older request must not change the loading
        // state of a newer request.
        if (
          requestControllerRef.current === controller
        ) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      controller.abort();
    };
  }, [
    activeFilters,
    currentPage,
    itemsPerPage,
  ]);

  function handleSearch(filters) {
    // New filters always start from page 1.
    setCurrentPage(1);
    setActiveFilters(filters);
  }

  function handleClear() {
    setCurrentPage(1);
    setActiveFilters({});
  }

  function handlePageChange(page) {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const totalPages = Math.ceil(
    total / itemsPerPage
  );

  const firstResult =
    total === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const lastResult = Math.min(
    currentPage * itemsPerPage,
    total
  );

  return (
    <main className="listings-page">
      <header className="listings-page__header">
        <h1>Property Listings</h1>

        {!loading && !error && total > 0 && (
          <p>
            Showing {firstResult}-{lastResult} of{" "}
            {total} properties
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
          <>
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
    </main>
  );
}

export default ListingsPage;