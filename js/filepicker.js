let allImages = [];
let dropAreaObserver = null;
let imageContainerObserver = null;
let globalDragAndDropListenersBound = false;

document.addEventListener("DOMContentLoaded", () => {
  initializeFilepickerUI();
});

setTimeout(() => {
  initializeFilepickerUI();
}, 1000);

/** Initializes filepicker listeners and drag/drop observers once image UI is present. */
function initializeFilepickerUI() {
  if (!hasRenderedAddTaskImageUi()) {
    observeDropArea();
    observeContainer();
    return;
  }

  addFilepickerListener();
  setupDragAndDrop();
  renderAddTaskImages();
  observeContainer();
}

/** Opens the hidden native file input used for image uploads. */
function openFilepicker() {
  const filepicker = document.getElementById("filepicker");
  if (filepicker) {
    filepicker.click();
  } else {
    console.error("Filepicker-Element nicht gefunden!");
  }
}

/** Attaches the file input change listener exactly once. */
function addFilepickerListener() {
  const filepicker = document.getElementById("filepicker");
  if (!filepicker) return;
  if (filepicker.dataset.listenerAttached === "true") return;

  filepicker.dataset.listenerAttached = "true";
  
  filepicker.addEventListener("change", async () => {
    const files = filepicker.files;
    if (files.length > 0) {
      handleFiles(files, getCurrentImageContainer());
      filepicker.value = "";
    }
  });
}

/** Registers drag/drop handlers on the add-task drop zone when available. */
function setupDragAndDrop() {
  const dropArea = document.getElementById("addImageBottom");
  if (!dropArea) {
    observeDropArea();
    return false;
  }
  if (dropArea.dataset.dragDropAttached === "true") {
    return true;
  }

  dropArea.dataset.dragDropAttached = "true";
  bindGlobalDragAndDropListeners();
  
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add("dragging");
  }, true);
  
  dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove("dragging");
  }, true);
  
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove("dragging");
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files, getCurrentImageContainer());
    }
  }, true);

  return true;
}

/** Binds global drag/drop prevention listeners once per page runtime. */
function bindGlobalDragAndDropListeners() {
  if (globalDragAndDropListenersBound) {
    return;
  }

  document.addEventListener("dragover", preventDefaultDragBehavior);
  document.addEventListener("drop", preventDefaultDragBehavior);
  globalDragAndDropListenersBound = true;
}

/** Prevents browser default drag/drop navigation behavior. */
function preventDefaultDragBehavior(event) {
  event.preventDefault();
}

/** Observes DOM mutations until the add-task drop zone exists, then wires listeners. */
function observeDropArea() {
  if (dropAreaObserver || !document.body) {
    return;
  }

  dropAreaObserver = new MutationObserver(() => {
    if (!document.getElementById("addImageBottom")) {
      return;
    }

    setupDragAndDrop();
    addFilepickerListener();

    dropAreaObserver.disconnect();
    dropAreaObserver = null;
  });

  dropAreaObserver.observe(document.body, { childList: true, subtree: true });
}

/** Processes a FileList and forwards valid image files to async processing. */
function handleFiles(files, container) {
  Array.from(files).forEach((file) => {
    if (!isImageFile(file)) {
      displayFileError(file);
      return;
    }
    processFile(file, container);
  });
}

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

/** Re-renders thumbnail previews and reinitializes the Viewer.js gallery binding. */
function renderAddTaskImages() {
  const container = getCurrentImageContainer();
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (allImages.length > 0) {
    allImages.forEach((imageObj, index) => {
      const thumbWrapper = document.createElement("div");
      thumbWrapper.className = "thumbnailWrapper";
      const img = createImageElement(imageObj.base64);
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "X";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        allImages.splice(index, 1);
        renderAddTaskImages();
      });
      thumbWrapper.appendChild(img);
      thumbWrapper.appendChild(deleteBtn);
      container.appendChild(thumbWrapper);
    });
  } else {
    container.innerHTML = "<p>No images attached.</p>";
  }
  initializeViewer();
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


/** Resolves the active preview container and creates a fallback container when needed. */
function getCurrentImageContainer() {
  let editContainer = document.getElementById("editCardImagesContainer");
  let standardContainer = document.getElementById("subtasksImageContainer");

  if (editContainer) return editContainer;
  if (standardContainer) return standardContainer;
  
  const dropArea = document.getElementById("addImageBottom");
  if (dropArea) {
    const newContainer = document.createElement("div");
    newContainer.id = "subtasksImageContainer";
    dropArea.appendChild(newContainer);
    return newContainer;
  } 

  return null;
}

/** Indicates whether add-task image UI containers are currently mounted in the DOM. */
function hasRenderedAddTaskImageUi() {
  return Boolean(
    document.getElementById("subtasksImageContainer") ||
      document.getElementById("editCardImagesContainer") ||
      document.getElementById("addImageBottom")
  );
}

/** Observes DOM changes to bootstrap image rendering once preview containers appear. */
function observeContainer() {
  if (document.getElementById("subtasksImageContainer")) {
    addFilepickerListener();
    setupDragAndDrop();
    return;
  }

  if (imageContainerObserver || !document.body) {
    return;
  }

  imageContainerObserver = new MutationObserver(() => {
    if (document.getElementById("subtasksImageContainer")) {
      imageContainerObserver.disconnect();
      imageContainerObserver = null;
      renderAddTaskImages();
      addFilepickerListener();
      setupDragAndDrop();
    }
  });

  imageContainerObserver.observe(document.body, { childList: true, subtree: true });
}
