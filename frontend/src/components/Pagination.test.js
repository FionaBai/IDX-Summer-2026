import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import Pagination, {
  generatePageItems,
} from "./Pagination";

test("hides pagination when there is only one page", () => {
  const { container } = render(
    <Pagination
      currentPage={1}
      totalPages={1}
      onPageChange={jest.fn()}
    />
  );

  expect(container).toBeEmptyDOMElement();
});

test("disables Previous on the first page", () => {
  render(
    <Pagination
      currentPage={1}
      totalPages={5}
      onPageChange={jest.fn()}
    />
  );

  expect(
    screen.getByRole("button", {
      name: /previous/i,
    })
  ).toBeDisabled();

  expect(
    screen.getByRole("button", {
      name: /next/i,
    })
  ).not.toBeDisabled();
});

test("disables Next on the last page", () => {
  render(
    <Pagination
      currentPage={5}
      totalPages={5}
      onPageChange={jest.fn()}
    />
  );

  expect(
    screen.getByRole("button", {
      name: /next/i,
    })
  ).toBeDisabled();

  expect(
    screen.getByRole("button", {
      name: /previous/i,
    })
  ).not.toBeDisabled();
});

test("calls onPageChange when a page number is clicked", () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={1}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /go to page 3/i,
    })
  );

  expect(onPageChange).toHaveBeenCalledWith(3);
});

test("Previous navigates to the previous page", () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={3}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /previous/i,
    })
  );

  expect(onPageChange).toHaveBeenCalledWith(2);
});

test("Next navigates to the next page", () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={3}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /next/i,
    })
  );

  expect(onPageChange).toHaveBeenCalledWith(4);
});

test("shows all page numbers for a small page count", () => {
  render(
    <Pagination
      currentPage={3}
      totalPages={5}
      onPageChange={jest.fn()}
    />
  );

  for (let page = 1; page <= 5; page += 1) {
    expect(
      screen.getByRole("button", {
        name: `Go to page ${page}`,
      })
    ).toBeInTheDocument();
  }

  expect(
    screen.queryByText("…")
  ).not.toBeInTheDocument();
});

test("shows ellipsis when current page is in the middle", () => {
  render(
    <Pagination
      currentPage={5}
      totalPages={24}
      onPageChange={jest.fn()}
    />
  );

  expect(
    screen.getByRole("button", {
      name: /go to page 1/i,
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", {
      name: /go to page 4/i,
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", {
      name: /go to page 5/i,
    })
  ).toHaveAttribute("aria-current", "page");

  expect(
    screen.getByRole("button", {
      name: /go to page 6/i,
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", {
      name: /go to page 24/i,
    })
  ).toBeInTheDocument();

  expect(screen.getAllByText("…")).toHaveLength(2);
});

test("shows the correct pages near the beginning", () => {
  expect(generatePageItems(2, 24)).toEqual([
    1,
    2,
    3,
    4,
    5,
    "ellipsis-right",
    24,
  ]);
});

test("shows the correct pages near the end", () => {
  expect(generatePageItems(23, 24)).toEqual([
    1,
    "ellipsis-left",
    20,
    21,
    22,
    23,
    24,
  ]);
});

test("does not duplicate the last page near the end", () => {
  const items = generatePageItems(22, 24);

  const lastPageOccurrences = items.filter(
    (item) => item === 24
  );

  expect(lastPageOccurrences).toHaveLength(1);

  expect(items).toEqual([
    1,
    "ellipsis-left",
    20,
    21,
    22,
    23,
    24,
  ]);
});