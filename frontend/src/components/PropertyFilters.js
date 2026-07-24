import { useState } from "react";
import "./PropertyFilters.css";

const INITIAL_FILTERS = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

function PropertyFilters({ onSearch, onClear, disabled = false }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== ""
      )
    );

    onSearch(cleanedFilters);
  }

  function handleClear() {
    setFilters(INITIAL_FILTERS);
    onClear();
  }

  return (
    <form
      className="property-filters"
      onSubmit={handleSubmit}
    >
      <div className="property-filters__grid">
        <label>
          City
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="Napa"
          />
        </label>

        <label>
          ZIP code
          <input
            type="text"
            name="zipcode"
            value={filters.zipcode}
            onChange={handleChange}
            placeholder="94558"
          />
        </label>

        <label>
          Minimum price
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            min="0"
            placeholder="300000"
          />
        </label>

        <label>
          Maximum price
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            min="0"
            placeholder="800000"
          />
        </label>

        <label>
          Minimum beds
          <select
            name="beds"
            value={filters.beds}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </label>

        <label>
          Minimum baths
          <select
            name="baths"
            value={filters.baths}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </label>
      </div>

      <div className="property-filters__actions">
        <button type="submit" disabled={disabled}>
          {disabled ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;