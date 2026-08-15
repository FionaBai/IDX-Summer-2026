import "./PropertySort.css";

function PropertySort({
  sortBy,
  sortOrder,
  onSortChange,
  disabled = false,
}) {
  function handleSortByChange(event) {
    onSortChange({
      sortBy: event.target.value,
      sortOrder,
    });
  }

  function handleSortOrderChange(event) {
    onSortChange({
      sortBy,
      sortOrder: event.target.value,
    });
  }

  return (
    <div className="property-sort">
      <label>
        Sort by
        <select
          value={sortBy}
          onChange={handleSortByChange}
          disabled={disabled}
        >
          <option value="">Default</option>
          <option value="price">Price</option>
          <option value="dateListed">
            Date Listed
          </option>
          <option value="sqft">
            Square Footage
          </option>
          <option value="beds">
            Bedrooms
          </option>
        </select>
      </label>

      <label>
        Order
        <select
          value={sortOrder}
          onChange={handleSortOrderChange}
          disabled={disabled || !sortBy}
        >
          <option value="ASC">
            Low to High
          </option>

          <option value="DESC">
            High to Low
          </option>
        </select>
      </label>
    </div>
  );
}

export default PropertySort;