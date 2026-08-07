export function parsePhotos(rawPhotos) {
  if (!rawPhotos) {
    return [];
  }

  try {
    const parsed =
      typeof rawPhotos === "string"
        ? JSON.parse(rawPhotos)
        : rawPhotos;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (photo) =>
        typeof photo === "string" &&
        photo.trim() !== ""
    );
  } catch {
    return [];
  }
}