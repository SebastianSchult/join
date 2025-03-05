let allImages = [];

document.addEventListener("DOMContentLoaded", () => {
  addFilepickerListener();
  setupDragAndDrop(); 
  renderAddTaskImages(); 
  observeContainer(); 
});

setTimeout(addFilepickerListener, 1000);

function openFilepicker() {
  const filepicker = document.getElementById("filepicker");
  if (filepicker) {
    filepicker.click();
  } else {
    console.error("Filepicker-Element nicht gefunden!");
  }
}

function addFilepickerListener() {
  const filepicker = document.getElementById("filepicker");
  if (!filepicker) return;
  
  filepicker.addEventListener("change", async () => {
    const files = filepicker.files;
    if (files.length > 0) {
      handleFiles(files, getCurrentImageContainer());
      filepicker.value = "";
    }
  });
}

function setupDragAndDrop() {
  const dropArea = document.getElementById("addImageBottom");
  if (!dropArea) {
    console.error("Drop-Bereich 'addImageBottom' nicht gefunden!");
    return;
  }
  document.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  document.addEventListener("drop", (event) => {
    event.preventDefault();
  });
  
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add("dragging");
    console.log("dragover event on addImageBottom");
  }, true);
  
  dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove("dragging");
    console.log("dragleave event on addImageBottom");
  }, true);
  
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove("dragging");
    const files = event.dataTransfer.files;
    console.log("Dropped files:", files);
    if (files.length > 0) {
      handleFiles(files, getCurrentImageContainer());
    }
  }, true);
}

function handleFiles(files, container) {
  Array.from(files).forEach((file) => {
    if (!isImageFile(file)) {
      displayFileError(file);
      return;
    }
    processFile(file, container);
  });
}

function isImageFile(file) {
  return file.type.includes("image/");
}

function displayFileError(file) {
  const errorEl = document.getElementById("error");
  if (errorEl) {
    errorEl.textContent = "The file " + file.name + " is not an image!";
  }
}

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

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

function calculateScaledDimensions(img, maxWidth, maxHeight) {
  const { width, height } = img;
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: width * scale,
    height: height * scale,
  };
}

function drawImageOnCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function createImageElement(src) {
  const img = document.createElement("img");
  img.src = src;
  img.style.width = "100px";
  img.style.height = "100px";
  img.style.objectFit = "cover";
  img.style.margin = "5px";
  return img;
}

function addImageToArray(file, compressedbase64) {
  allImages.push({
    name: file.name,
    type: file.type,
    base64: compressedbase64,
  });
}

function renderAddTaskImages() {
  const container = getCurrentImageContainer();
  if (!container) {
    console.warn("Kein Container vorhanden zum Rendern der Bilder.");
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

function initializeViewer() {
  const container = document.getElementById("subtasksImageContainer");
  if (!container) return;
  
  if (window.addTaskViewer) {
    window.addTaskViewer.destroy();
  }
  
  window.addTaskViewer = new Viewer(container, {
  });
}


function getCurrentImageContainer() {
  let editContainer = document.getElementById("editCardImagesContainer");
  let standardContainer = document.getElementById("subtasksImageContainer");

  if (editContainer) return editContainer;
  if (standardContainer) return standardContainer;

  console.warn("Kein Container gefunden! Erstelle neuen Container 'subtasksImageContainer' innerhalb von 'addImageBottom'.");
  
  const dropArea = document.getElementById("addImageBottom");
  if (dropArea) {
    const newContainer = document.createElement("div");
    newContainer.id = "subtasksImageContainer";
    dropArea.appendChild(newContainer);
    return newContainer;
  } 
}

function observeContainer() {
  const observer = new MutationObserver(() => {
    if (document.getElementById("subtasksImageContainer")) {
      console.log("Container wurde geladen!");
      renderAddTaskImages();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}