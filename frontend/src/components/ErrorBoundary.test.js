import {
  render,
  screen,
} from "@testing-library/react";

import ErrorBoundary from "./ErrorBoundary";

function BrokenComponent() {
  throw new Error(
    "Intentional test error"
  );
}

test(
  "shows recovery UI when a child component crashes",
  () => {
    const originalConsoleError =
      console.error;

    console.error = jest.fn();

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole("heading", {
        name: /something went wrong/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /try again/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /back to listings/i,
      })
    ).toBeInTheDocument();

    console.error =
      originalConsoleError;
  }
);