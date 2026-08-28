import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import PropertyCard from "./PropertyCard";

const mockNavigate = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    ...jest.requireActual(
      "react-router-dom"
    ),

    useNavigate: () =>
      mockNavigate,
  })
);

jest.mock(
  "./PropertyImageCarousel",
  () => {
    return function MockCarousel() {
      return (
        <div data-testid="image-carousel">
          Property photos
        </div>
      );
    };
  }
);

const PROPERTY = {
  id: 1,
  L_ListingID: "ABC123",
  L_SystemPrice: 750000,
  L_Address: "123 Main Street",
  L_City: "Napa",
  L_State: "CA",
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1800,
  L_Photos: "[]",
};

beforeEach(() => {
  mockNavigate.mockClear();
});

test("renders property data", () => {
  render(
    <PropertyCard
      property={PROPERTY}
    />
  );

  expect(
    screen.getByText("$750,000")
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "123 Main Street"
    )
  ).toBeInTheDocument();

  expect(
    screen.getByText("Napa, CA")
  ).toBeInTheDocument();

  expect(
    screen.getByText((content, element) => {
        return (
        element?.tagName.toLowerCase() === "span" &&
        element.textContent.trim().replace(/\s+/g, " ") === "3 beds"
        );
    })
  ).toBeInTheDocument();

  expect(
    screen.getByText((content, element) => {
        return (
        element?.tagName.toLowerCase() === "span" &&
        element.textContent.trim().replace(/\s+/g, " ") === "2 baths"
        );
    })
  ).toBeInTheDocument();

  expect(
    screen.getByText((content, element) => {
        return (
        element?.tagName.toLowerCase() === "span" &&
        element.textContent.trim().replace(/\s+/g, " ") === "1,800 sqft"
        );
    })
  ).toBeInTheDocument();
});

test("renders image carousel", () => {
  render(
    <PropertyCard
      property={PROPERTY}
    />
  );

  expect(
    screen.getByTestId(
      "image-carousel"
    )
  ).toBeInTheDocument();
});

test("clicking property navigates to detail page", () => {
  render(
    <PropertyCard
      property={PROPERTY}
    />
  );

  const card =
    screen.getByRole("link");

  fireEvent.click(card);

  expect(mockNavigate).toHaveBeenCalledWith(
    "/property/ABC123"
  );
});

test("pressing Enter navigates to property detail", () => {
  render(
    <PropertyCard
      property={PROPERTY}
    />
  );

  fireEvent.keyDown(
    screen.getByRole("link"),
    {
      key: "Enter",
    }
  );

  expect(mockNavigate).toHaveBeenCalledWith(
    "/property/ABC123"
  );
});