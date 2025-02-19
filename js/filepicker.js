let allImages = [];


/**
 * Opens the filepicker dialog for selecting files.
 * It does not directly return anything, but triggers the change event on the filepicker element.
 * @throws {Error} If the filepicker element is not found in the DOM.
 */
function openFilepicker() {
  const filepicker = document.getElementById("filepicker");
  if (filepicker) {
    filepicker.click();
  } else {
    console.error("Filepicker-Element nicht gefunden!");
  }
}


/**
 * Adds an event listener to the filepicker element. When files are selected,
 * the `handleFiles` function is called with the selected files and the
 * `subtasksImageContainer` element as arguments.
 */
function addFilepickerListener() {
  const filepicker = document.getElementById("filepicker");
  const subtasksImageContainer = document.getElementById(
    "subtasksImageContainer"
  );
  if (!filepicker) return;
  filepicker.addEventListener("change", async () => {
    const files = filepicker.files;
    if (files.length > 0) {
      handleFiles(files, subtasksImageContainer);
    }
  });
}


/**
 * Processes a list of files, filtering out non-image files and displaying errors for them.
 * Valid image files are processed and added to the specified container.
 *
 * @param {FileList} files - The list of files to be processed.
 * @param {HTMLElement} container - The DOM element where processed images will be displayed.
 * @return {void}
 */

function handleFiles(files, container) {
  Array.from(files).forEach((file) => {
    if (!isImageFile(file)) {
      displayFileError(file);
      return;
    }
    processFile(file, container);
  });
}


/**
 * Checks if a given file is an image based on its MIME type.
 *
 * @param {File} file - The file to be checked.
 * @return {boolean} Returns true if the file is an image, otherwise false.
 */

function isImageFile(file) {
  return file.type.includes("image/");
}

/**
 * Displays an error message for a non-image file.
 * The error message is displayed in the element with ID "error".
 * If the element does not exist, no error message is displayed.
 * @param {File} file - The file that caused the error.
 */
function displayFileError(file) {
  const errorEl = document.getElementById("error");
  if (errorEl) {
    errorEl.textContent = "The file " + file.name + " is not an image!";
  }
}

/**
 * Processes an image file by compressing it and appending the resulting image
 * element to a specified container. The compressed image is also added to an
 * array of all images.
 *
 * @param {File} file - The image file to process.
 * @param {HTMLElement} container - The DOM element where the processed image
 * will be displayed.
 * @return {Promise<void>} A promise that resolves when the file is processed.
 */

async function processFile(file, container) {
  const blob = new Blob([file], { type: file.type });
  const compressedbase64 = await compressImage(file, 800, 800, 0.8);
  const img = createImageElement(compressedbase64);
  container.appendChild(img);
  addImageToArray(file, compressedbase64);
  renderAddTaskImages(); 
}

function isEditMode() {
  const container = document.getElementById('openCardContainer');
  return container && container.hasAttribute('editing');
}


/**
 * Creates a new HTML image element with the given source.
 *
 * @param {string} src - The source of the image.
 * @return {HTMLImageElement} The created image element.
 */
function createImageElement(src) {
  const img = document.createElement("img");
  img.src = src;
  return img;
}


/**
 * Adds the given file to the array of all images after it has been successfully compressed
 * and uploaded.
 *
 * @param {File} file - The file to be added.
 * @param {string} compressedbase64 - The base64 string of the compressed image.
 */
function addImageToArray(file, compressedbase64) {
  allImages.push({
    name: file.name,
    type: file.type,
    base64: compressedbase64,
  });
}


/**
 * Saves the current state of the `allImages` array to the local storage as a JSON string.
 * @return {void}
 */
function saveLocalStorrage() {
  let ArrayasString = JSON.stringify(allImages);
  localStorage.setItem("allImages", ArrayasString);
}


/**
 * Loads the `allImages` array from the local storage and parses it from JSON.
 *
 * If the local storage does not contain the "allImages" key, it is ignored.
 * If it does contain the key, but the value is not a valid JSON string, an
 * error will be thrown.
 *
 * @return {void}
 */
function loadLocalStorrage() {
  let ArrayasString = localStorage.getItem("allImages");
  if (ArrayasString == null) {
    allImages = JSON.parse(ArrayasString);
  } else {
    allImages = JSON.parse(ArrayasString);
  }
}


/**
 * Reads a blob as a base64 encoded data URL string.
 *
 * @param {Blob} blob - The blob to read.
 *
 * @return {Promise<string>} A promise that resolves to the base64 encoded string.
 */
function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}


/**
 * Loads an image from a given file and resolves with the loaded image.
 *
 * @param {File} file - The file to load the image from.
 *
 * @return {Promise<Image>} A promise that resolves with the loaded image.
 */
function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
    });
  }
  
  
  /**
   * Calculates the scaled dimensions of an image, given a maximum width and height.
   * The image will be scaled down to fit within the given maximum dimensions,
   * while maintaining its aspect ratio.
   *
   * @param {HTMLImageElement} img - The image to calculate the scaled dimensions for.
   * @param {number} maxWidth - The maximum width of the scaled image.
   * @param {number} maxHeight - The maximum height of the scaled image.
   * @return {Object} An object with the scaled width and height of the image.
   */
  function calculateScaledDimensions(img, maxWidth, maxHeight) {
    const { width, height } = img;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    return {
      width: width * scale,
      height: height * scale,
    };
  }
  
  
  /**
   * Draws an image on a canvas element, given the image and its desired scaled dimensions.
   * The image is drawn on the canvas at position (0, 0) and stretched to fit the given
   * width and height.
   * @param {HTMLImageElement} img - The image to draw on the canvas.
   * @param {number} width - The desired width of the image on the canvas.
   * @param {number} height - The desired height of the image on the canvas.
   * @return {HTMLCanvasElement} The canvas element with the drawn image.
   */
  function drawImageOnCanvas(img, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  }
  
  
/**
 * Converts a canvas element to a data URL string in JPEG format with the specified quality.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to convert.
 * @param {number} quality - The quality of the resulting JPEG image, between 0 and 1.
 * @return {string} The data URL string representing the canvas image.
 */

  function convertCanvasToDataUrl(canvas, quality) {
    return canvas.toDataURL("image/jpeg", quality);
  }
  
  
  /**
   * Compresses an image by scaling it down to a specified maximum width and height
   * while maintaining its aspect ratio, and then converting it to a data URL in JPEG
   * format with the specified quality.
   *
   * @param {File} file - The image file to compress.
   * @param {number} maxWidth - The maximum width of the compressed image.
   * @param {number} maxHeight - The maximum height of the compressed image.
   * @param {number} quality - The quality of the resulting JPEG image, between 0 and 1.
   *
   * @return {Promise<string>} A promise that resolves with the compressed image as a
   * data URL string in JPEG format. If the compression fails, the promise is rejected
   * with the error that occurred.
   */
  async function compressImage(file, maxWidth, maxHeight, quality) {
    try {
      const img = await loadImageFromFile(file);
      const { width, height } = calculateScaledDimensions(img, maxWidth, maxHeight);
      const canvas = drawImageOnCanvas(img, width, height);
      return convertCanvasToDataUrl(canvas, quality);
    } catch (error) {
      throw error;
    }
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

  function renderAddTaskImages() {
    const container = document.getElementById("subtasksImageContainer");
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

  function getCurrentImageContainer() {
    // Prüfe zuerst, ob der Edit-Popup-Container existiert
    const editContainer = document.getElementById("editCardImagesContainer");
    if (editContainer) {
      return editContainer;
    }
    // Andernfalls verwende den Standardcontainer
    const standardContainer = document.getElementById("subtasksImageContainer");
    if (standardContainer) {
      return standardContainer;
    }
    console.error("getCurrentImageContainer: Kein Container gefunden!");
    return null;
  }

document.addEventListener("DOMContentLoaded", addFilepickerListener);

setTimeout(addFilepickerListener, 1000);
