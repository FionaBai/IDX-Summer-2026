import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      total: 0,
      limit: 20,
      offset: 0,
      results: [],
    }),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders the property listings page", async () => {
  render(<App />);

  expect(
    screen.getByRole("heading", {
      name: /property listings/i,
    })
  ).toBeInTheDocument();

  expect(
    await screen.findByText(/no properties found/i)
  ).toBeInTheDocument();
});