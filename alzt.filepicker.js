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
  
  filepicker.addEventListener("change", async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      await handleFiles(files, getCurrentImageContainer());
      // Input zurücksetzen, damit auch dieselbe Datei erneut erkannt wird
      filepicker.value = "";
    }
  });
}

function setupDragAndDrop() {
    const dropArea = document.getElementById('subtasksImageContainer');
    if (!dropArea) {
        console.error("Drop-Bereich 'subtasksImageContainer' nicht gefunden!");
        return;
    }
    
    // Highlight-Klasse für visuelles Feedback
    dropArea.classList.add('drop-zone');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('drag-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('drag-active');
        }, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

async function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files, getCurrentImageContainer());
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
  // Prevent opening in new tab
  img.onclick = (e) => e.preventDefault();
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
  if (!container) return;
  container.innerHTML = "";
  if (allImages.length > 0) {
    allImages.forEach((imageObj, index) => {
      const thumbWrapper = document.createElement("div");
      thumbWrapper.className = "thumbnailWrapper";
      
      const img = document.createElement("img");
      img.src = imageObj.base64;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.margin = "5px";
      // Prevent opening in new tab
      img.onclick = (e) => {
        e.preventDefault();
        return false;
      };
      
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
}

function getCurrentImageContainer() {
  let editContainer = document.getElementById("editCardImagesContainer");
  let standardContainer = document.getElementById("subtasksImageContainer");

  if (editContainer) return editContainer;
  if (standardContainer) return standardContainer;

  console.warn("Kein Container gefunden! Warte auf spätere Erstellung...");
  return null;
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