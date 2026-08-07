function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

async function handleResponse(response) {
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.error ||
      body?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return body;
}

export async function fetchProperties(
  params = {},
  options = {}
) {
  const queryString = buildQueryString(params);

  let response;

  try {
    response = await fetch(
      `/api/properties${queryString}`,
      {
        signal: options.signal,
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to reach the backend server. Make sure the Express server is running."
    );
  }

  return handleResponse(response);
}

export async function fetchPropertyDetail(
  id,
  options = {}
) {
  if (!id) {
    throw new Error(
      "A property listing ID is required."
    );
  }

  let response;

  try {
    response = await fetch(
      `/api/properties/${encodeURIComponent(id)}`,
      {
        signal: options.signal,
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to reach the backend server. Make sure the Express server is running."
    );
  }

  return handleResponse(response);
}

export async function fetchPropertyOpenHouses(
  id,
  options = {}
) {
  if (!id) {
    throw new Error(
      "A property listing ID is required."
    );
  }

  let response;

  try {
    response = await fetch(
      `/api/properties/${encodeURIComponent(id)}/openhouses`,
      {
        signal: options.signal,
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to reach the backend server."
    );
  }

  return handleResponse(response);
}