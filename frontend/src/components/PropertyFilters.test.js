import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import PropertyFilters from "./PropertyFilters";

test("renders all six filter inputs", () => {
  render(
    <PropertyFilters
      onSearch={jest.fn()}
      onClear={jest.fn()}
    />
  );

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
    <PropertyFilters
      onSearch={onSearch}
      onClear={jest.fn()}
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
    <PropertyFilters
      onSearch={onSearch}
      onClear={jest.fn()}
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
    <PropertyFilters
      onSearch={jest.fn()}
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

  fireEvent.click(
    screen.getByRole("button", {
      name: /clear filters/i,
    })
  );

  expect(cityInput).toHaveValue("");
  expect(bedsSelect).toHaveValue("");
  expect(onClear).toHaveBeenCalledTimes(1);
});