"use strict";

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

  dropArea.addEventListener(
    "dragover",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.add("dragging");
    },
    true
  );

  dropArea.addEventListener(
    "dragleave",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.remove("dragging");
    },
    true
  );

  dropArea.addEventListener(
    "drop",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.remove("dragging");
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files, getCurrentImageContainer());
      }
    },
    true
  );

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
