import { useState } from "react";
import { parsePhotos } from "../utils/photos";
import "./PropertyImageCarousel.css";

function PropertyImageCarousel({ rawPhotos }) {
  const photos = parsePhotos(rawPhotos);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  if (photos.length === 0) {
    return (
      <div className="carousel carousel--empty">
        No photo available
      </div>
    );
  }

  function previousPhoto(event) {
    event.stopPropagation();

    setCurrentIndex((current) =>
      current === 0
        ? photos.length - 1
        : current - 1
    );
  }

  function nextPhoto(event) {
    event.stopPropagation();

    setCurrentIndex((current) =>
      current === photos.length - 1
        ? 0
        : current + 1
    );
  }

  return (
    <div className="carousel">
      <img
        src={photos[currentIndex]}
        alt={`Property ${currentIndex + 1}`}
        className="carousel__image"
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="carousel__arrow carousel__arrow--left"
            onClick={previousPhoto}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <button
            type="button"
            className="carousel__arrow carousel__arrow--right"
            onClick={nextPhoto}
            aria-label="Next photo"
          >
            ›
          </button>

          <div className="carousel__counter">
            {currentIndex + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

export default PropertyImageCarousel;