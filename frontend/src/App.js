import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={<ListingsPage />}
          />

          <Route
            path="/property/:id"
            element={<PropertyDetailPage />}
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;