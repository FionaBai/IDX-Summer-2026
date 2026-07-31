import "./Pagination.css";

export function generatePageItems(currentPage, totalPages) {
  if (totalPages <= 1) {
    return [];
  }

  // Show every page when the total is small.
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  // Near the beginning:
  // 1 2 3 4 5 ... 24
  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis-right",
      totalPages,
    ];
  }

  // Near the end:
  // 1 ... 20 21 22 23 24
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // In the middle:
  // 1 ... 4 5 6 ... 24
  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = generatePageItems(
    currentPage,
    totalPages
  );

  function goToPage(page) {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    onPageChange(page);
  }

  return (
    <nav
      className="pagination"
      aria-label="Property pagination"
    >
      <button
        type="button"
        className="pagination__button"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </button>

      <div className="pagination__pages">
        {pageItems.map((item) => {
          if (typeof item === "string") {
            return (
              <span
                key={item}
                className="pagination__ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          return (
            <button
              key={item}
              type="button"
              className={
                item === currentPage
                  ? "pagination__page pagination__page--active"
                  : "pagination__page"
              }
              aria-current={
                item === currentPage ? "page" : undefined
              }
              aria-label={`Go to page ${item}`}
              onClick={() => goToPage(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="pagination__button"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;