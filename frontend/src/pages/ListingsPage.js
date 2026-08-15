import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import { fetchProperties } from "../api/client";
import Pagination from "../components/Pagination";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import PropertySort from "../components/PropertySort";
import "./ListingsPage.css";

const DEFAULT_ITEMS_PER_PAGE = 20;

function ListingsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [properties, setProperties] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [currentPage, setCurrentPage] =
    useState(
      Number(searchParams.get("page")) || 1
    );

  const [sortBy, setSortBy] =
    useState(
      searchParams.get("sortBy") || ""
    );

  const [sortOrder, setSortOrder] =
    useState(
      searchParams.get("sortOrder") || "ASC"
    );

  const [activeFilters, setActiveFilters] =
    useState(() => ({
      ...(searchParams.get("city") && {
        city: searchParams.get("city"),
      }),

      ...(searchParams.get("zipcode") && {
        zipcode: searchParams.get("zipcode"),
      }),

      ...(searchParams.get("minPrice") && {
        minPrice: searchParams.get("minPrice"),
      }),

      ...(searchParams.get("maxPrice") && {
        maxPrice: searchParams.get("maxPrice"),
      }),

      ...(searchParams.get("beds") && {
        beds: searchParams.get("beds"),
      }),

      ...(searchParams.get("baths") && {
        baths: searchParams.get("baths"),
      }),
    }));
  
  const [filterForm, setFilterForm] =
    useState(() => ({
      city: searchParams.get("city") || "",
      zipcode: searchParams.get("zipcode") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      beds: searchParams.get("beds") || "",
      baths: searchParams.get("baths") || "",
    }));

  const [itemsPerPage] =
    useState(DEFAULT_ITEMS_PER_PAGE);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const requestControllerRef =
    useRef(null);

  // Keep URL synchronized with page/filter/sort state.
  useEffect(() => {
    const params = {};

    if (currentPage > 1) {
      params.page =
        String(currentPage);
    }

    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    Object.entries(activeFilters).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          params[key] = String(value);
        }
      }
    );

    setSearchParams(params, {
      replace: true,
    });
  }, [
    currentPage,
    sortBy,
    sortOrder,
    activeFilters,
    setSearchParams,
  ]);

  // Load properties whenever page, filters, or sort change.
  useEffect(() => {
    const controller =
      new AbortController();

    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    requestControllerRef.current =
      controller;

    async function loadProperties() {
      setLoading(true);
      setError("");

      const offset =
        (currentPage - 1) *
        itemsPerPage;

      try {
        const params = {
          ...activeFilters,
          limit: itemsPerPage,
          offset,
        };

        if (sortBy) {
          params.sortBy = sortBy;
          params.sortOrder =
            sortOrder;
        }

        const data =
          await fetchProperties(
            params,
            {
              signal:
                controller.signal,
            }
          );

        setProperties(
          Array.isArray(data.results)
            ? data.results
            : []
        );

        setTotal(
          Number(data.total) || 0
        );
      } catch (requestError) {
        if (
          requestError.name ===
          "AbortError"
        ) {
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
          requestControllerRef.current ===
          controller
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
    sortBy,
    sortOrder,
  ]);

  function handleSearch(filters) {
    setCurrentPage(1);

    setSortBy("");
    setSortOrder("ASC");

    setActiveFilters(filters);
  }

  function handleClear() {
    const emptyFilters = {
      city: "",
      zipcode: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
    };

    setFilterForm(emptyFilters);

    setCurrentPage(1);
    setSortBy("");
    setSortOrder("ASC");
    setActiveFilters({});
  }

  function handlePageChange(page) {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSortChange({
    sortBy: newSortBy,
    sortOrder: newSortOrder,
  }) {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);

    // Changing sort starts at page 1.
    setCurrentPage(1);
  }

  const totalPages =
    Math.ceil(
      total / itemsPerPage
    );

  const firstResult =
    total === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const lastResult =
    Math.min(
      currentPage *
        itemsPerPage,
      total
    );

  return (
    <main className="listings-page">
      <header className="listings-page__header">
        <h1>Property Listings</h1>

        {!loading &&
          !error &&
          total > 0 && (
            <p>
              Showing{" "}
              {firstResult}-
              {lastResult} of{" "}
              {total} properties
            </p>
          )}
      </header>

      <PropertyFilters
        filters={filterForm}
        onFiltersChange={setFilterForm}
        onSearch={handleSearch}
        onClear={handleClear}
        disabled={loading}
      />

      <PropertySort
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={
          handleSortChange
        }
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
          <h2>
            Could not load properties
          </h2>
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        properties.length === 0 && (
          <div className="status-message">
            <h2>
              No properties found
            </h2>

            <p>
              Try changing or
              clearing some of your
              filters.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        properties.length > 0 && (
          <>
            <section className="property-grid">
              {properties.map(
                (property) => (
                  <PropertyCard
                    key={
                      property.L_ListingID ||
                      property.id
                    }
                    property={
                      property
                    }
                  />
                )
              )}
            </section>

            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={
                handlePageChange
              }
            />
          </>
        )}
    </main>
  );
}

export default ListingsPage;