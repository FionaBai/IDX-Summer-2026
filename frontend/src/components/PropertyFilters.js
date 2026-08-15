import "./PropertyFilters.css";

const EMPTY_FILTERS = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

function PropertyFilters({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  disabled = false,
}) {
  const displayedFilters = {
    ...EMPTY_FILTERS,
    ...filters,
  };

  function handleChange(event) {
    const { name, value } = event.target;

    onFiltersChange({
      ...displayedFilters,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedFilters = Object.fromEntries(
      Object.entries(displayedFilters).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );

    onSearch(cleanedFilters);
  }

  function handleClear() {
    onFiltersChange(EMPTY_FILTERS);
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
            value={displayedFilters.city}
            onChange={handleChange}
            placeholder="Napa"
          />
        </label>

        <label>
          ZIP code
          <input
            type="text"
            name="zipcode"
            value={displayedFilters.zipcode}
            onChange={handleChange}
            placeholder="94558"
          />
        </label>

        <label>
          Minimum price
          <input
            type="number"
            name="minPrice"
            value={displayedFilters.minPrice}
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
            value={displayedFilters.maxPrice}
            onChange={handleChange}
            min="0"
            placeholder="800000"
          />
        </label>

        <label>
          Minimum beds
          <select
            name="beds"
            value={displayedFilters.beds}
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
            value={displayedFilters.baths}
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
        <button
          type="submit"
          disabled={disabled}
        >
          {disabled
            ? "Searching..."
            : "Search"}
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