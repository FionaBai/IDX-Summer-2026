import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "React render error:",
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <div className="error-boundary__card">
            <h1>Something went wrong</h1>

            <p>
              The page could not be displayed.
              You can try again or return to the
              property listings.
            </p>

            <div className="error-boundary__actions">
              <button
                type="button"
                onClick={this.handleRetry}
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
              >
                Back to Listings
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;