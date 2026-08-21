import { useState } from "react";

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import PropertyFilters from "./PropertyFilters";

function TestPropertyFilters({
  onSearch = jest.fn(),
  onClear = jest.fn(),
}) {
  const [filters, setFilters] = useState({
    city: "",
    zipcode: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
  });

  return (
    <PropertyFilters
      filters={filters}
      onFiltersChange={setFilters}
      onSearch={onSearch}
      onClear={onClear}
    />
  );
}

test("renders all six filter inputs", () => {
  render(<TestPropertyFilters />);

  expect(
    screen.getByLabelText(/city/i)
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText(/zip code/i)
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText(/minimum price/i)
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText(/maximum price/i)
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText(/minimum beds/i)
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText(/minimum baths/i)
  ).toBeInTheDocument();
});

test("submits entered filters", () => {
  const onSearch = jest.fn();

  render(
    <TestPropertyFilters
      onSearch={onSearch}
    />
  );

  fireEvent.change(
    screen.getByLabelText(/city/i),
    {
      target: {
        value: "Napa",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/minimum beds/i),
    {
      target: {
        value: "3",
      },
    }
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /^search$/i,
    })
  );

  expect(onSearch).toHaveBeenCalledWith({
    city: "Napa",
    beds: "3",
  });
});

test("does not submit empty filter values", () => {
  const onSearch = jest.fn();

  render(
    <TestPropertyFilters
      onSearch={onSearch}
    />
  );

  fireEvent.change(
    screen.getByLabelText(/zip code/i),
    {
      target: {
        value: "94558",
      },
    }
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /^search$/i,
    })
  );

  expect(onSearch).toHaveBeenCalledWith({
    zipcode: "94558",
  });
});

test("clear resets all inputs and calls onClear", () => {
  const onClear = jest.fn();

  render(
    <TestPropertyFilters
      onClear={onClear}
    />
  );

  const cityInput =
    screen.getByLabelText(/city/i);

  const bedsSelect =
    screen.getByLabelText(/minimum beds/i);

  fireEvent.change(cityInput, {
    target: {
      value: "Napa",
    },
  });

  fireEvent.change(bedsSelect, {
    target: {
      value: "3",
    },
  });

  expect(cityInput).toHaveValue("Napa");
  expect(bedsSelect).toHaveValue("3");

  fireEvent.click(
    screen.getByRole("button", {
      name: /clear filters/i,
    })
  );

  expect(cityInput).toHaveValue("");
  expect(bedsSelect).toHaveValue("");

  expect(onClear).toHaveBeenCalledTimes(1);
});