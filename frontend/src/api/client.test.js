import {
  fetchProperties,
  fetchPropertyDetail,
} from "./client";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("fetchProperties returns property data", async () => {
  const mockData = {
    total: 1,
    limit: 20,
    offset: 0,
    results: [
      {
        L_ListingID: "ABC123",
        L_City: "Napa",
      },
    ],
  };

  global.fetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(mockData),
  });

  const result = await fetchProperties({
    city: "Napa",
    beds: 3,
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/properties?city=Napa&beds=3",
    {
      signal: undefined,
    }
  );

  expect(result).toEqual(mockData);
});

test("fetchProperties does not send empty values", async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      total: 0,
      results: [],
    }),
  });

  await fetchProperties({
    city: "",
    zipcode: "",
    beds: 2,
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/properties?beds=2",
    {
      signal: undefined,
    }
  );
});

test("fetchProperties throws backend error message", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 400,
    json: jest.fn().mockResolvedValue({
      error:
        "minPrice cannot be greater than maxPrice",
    }),
  });

  await expect(
    fetchProperties({
      minPrice: 900000,
      maxPrice: 200000,
    })
  ).rejects.toThrow(
    "minPrice cannot be greater than maxPrice"
  );
});

test("fetchProperties throws a network error", async () => {
  global.fetch.mockRejectedValue(
    new TypeError("Failed to fetch")
  );

  await expect(fetchProperties()).rejects.toThrow(
    "Unable to reach the backend server"
  );
});

test("fetchPropertyDetail requires an ID", async () => {
  await expect(
    fetchPropertyDetail("")
  ).rejects.toThrow(
    "A property listing ID is required"
  );

  expect(global.fetch).not.toHaveBeenCalled();
});