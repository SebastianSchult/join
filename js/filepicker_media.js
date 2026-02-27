"use strict";

/** Checks whether a file has an image MIME type. */
function isImageFile(file) {
  return file.type.includes("image/");
}

/** Renders a user-facing validation error for unsupported files. */
function displayFileError(file) {
  const errorEl = document.getElementById("error");
  if (errorEl) {
    errorEl.textContent = "The file " + file.name + " is not an image!";
  }
}

/** Compresses and appends one image preview, then refreshes preview rendering state. */
async function processFile(file, container) {
  if (!container) {
    console.error("Kein Container gefunden zum Anhängen des Bildes.");
    return;
  }
  const compressedbase64 = await compressImage(file, 800, 800, 0.8);
  const img = createImageElement(compressedbase64);
  container.appendChild(img);
  addImageToArray(file, compressedbase64);
  renderAddTaskImages();
}

/** Compresses an image file to a bounded JPEG data URL for storage and preview. */
async function compressImage(file, maxWidth, maxHeight, quality) {
  try {
    const img = await loadImageFromFile(file);
    const { width, height } = calculateScaledDimensions(img, maxWidth, maxHeight);
    const canvas = drawImageOnCanvas(img, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } catch (error) {
    console.error("Fehler beim Komprimieren des Bildes:", error);
    throw error;
  }
}

/** Loads an image element from a File object URL. */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

/** Calculates scaled dimensions that fit inside the configured bounds. */
function calculateScaledDimensions(img, maxWidth, maxHeight) {
  const { width, height } = img;
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: width * scale,
    height: height * scale,
  };
}

/** Draws an image into a temporary canvas used for compression output. */
function drawImageOnCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/** Creates a standardized 100x100 preview image element for thumbnail lists. */
function createImageElement(src) {
  const img = document.createElement("img");
  img.src = src;
  img.style.width = "100px";
  img.style.height = "100px";
  img.style.objectFit = "cover";
  img.style.margin = "5px";
  return img;
}

/** Persists uploaded image metadata in the in-memory image collection. */
function addImageToArray(file, compressedbase64) {
  allImages.push({
    name: file.name,
    type: file.type,
    base64: compressedbase64,
  });
}

/** Creates or refreshes the global Viewer.js instance for task image previews. */
function initializeViewer() {
  const container = document.getElementById("subtasksImageContainer");
  if (!container) return;

  if (window.addTaskViewer) {
    window.addTaskViewer.destroy();
  }

  window.addTaskViewer = new Viewer(container, getDefaultViewerOptions());
}

/** Returns default Viewer.js toolbar/options used across add-task image previews. */
function getDefaultViewerOptions() {
  return {
    navbar: false,
    title: false,
    tooltip: false,
    toolbar: {
      zoomIn: 1,
      zoomOut: 1,
      oneToOne: 0,
      reset: 1,
      prev: 1,
      play: 0,
      next: 1,
      rotateLeft: 1,
      rotateRight: 1,
      flipHorizontal: 0,
      flipVertical: 0,
    },
  };
}
