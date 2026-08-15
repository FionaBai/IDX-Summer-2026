import {
  useEffect,
  useState,
} from "react";

import { parsePhotos } from "../utils/photos";
import "./PropertyImageGallery.css";

function PropertyImageGallery({ rawPhotos }) {
  const photos = parsePhotos(rawPhotos);

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [lightboxOpen, setLightboxOpen] =
    useState(false);

  function previousPhoto() {
    setSelectedIndex((current) =>
      current === 0
        ? photos.length - 1
        : current - 1
    );
  }

  function nextPhoto() {
    setSelectedIndex((current) =>
      current === photos.length - 1
        ? 0
        : current + 1
    );
  }

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current === 0
            ? photos.length - 1
            : current - 1
        );
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current === photos.length - 1
            ? 0
            : current + 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="gallery__empty">
        No photos available
      </div>
    );
  }

  return (
    <>
      <div className="gallery">
        <button
          type="button"
          className="gallery__main-button"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            className="gallery__main-image"
            src={photos[selectedIndex]}
            alt={`Property ${selectedIndex + 1}`}
          />
        </button>

        {photos.length > 1 && (
          <div className="gallery__thumbnails">
            {photos.map((photo, index) => (
              <button
                type="button"
                key={`${photo}-${index}`}
                className={
                  index === selectedIndex
                    ? "gallery__thumbnail gallery__thumbnail--selected"
                    : "gallery__thumbnail"
                }
                onClick={() =>
                  setSelectedIndex(index)
                }
              >
                <img
                  src={photo}
                  alt={`Property thumbnail ${
                    index + 1
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() =>
            setLightboxOpen(false)
          }
        >
          <button
            type="button"
            className="lightbox__close"
            aria-label="Close gallery"
            onClick={() =>
              setLightboxOpen(false)
            }
          >
            ×
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              className="lightbox__arrow lightbox__arrow--left"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                previousPhoto();
              }}
            >
              ‹
            </button>
          )}

          <img
            className="lightbox__image"
            src={photos[selectedIndex]}
            alt={`Property ${selectedIndex + 1}`}
            onClick={(event) =>
              event.stopPropagation()
            }
          />

          {photos.length > 1 && (
            <button
              type="button"
              className="lightbox__arrow lightbox__arrow--right"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                nextPhoto();
              }}
            >
              ›
            </button>
          )}

          <div className="lightbox__counter">
            {selectedIndex + 1} /{" "}
            {photos.length}
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyImageGallery;