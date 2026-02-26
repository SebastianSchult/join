/**
 * Renders card preview images on board cards.
 *
 * @param {Object} task - Task entity.
 */
function renderTaskImages(task) {
    const container = document.getElementById(`cardImagesContainer${task.id}`);
    if (!container) {
        return;
    }

    container.innerHTML = "";
    if (task.images && task.images.length > 0) {
        task.images.forEach((base64) => {
            const img = document.createElement("img");
            img.src = base64;
            img.style.width = "100px";
            img.style.height = "100px";
            img.style.objectFit = "cover";
            img.style.margin = "5px";
            container.appendChild(img);
        });
    }
}

/**
 * Renders images in open-card dialog and initializes viewer controls.
 *
 * @param {Object} task - Task entity.
 */
function renderOpenCardImages(task) {
    const container = document.getElementById("openCardImagesContainer");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    if (task.images && task.images.length > 0) {
        task.images.forEach((base64) => {
            const img = document.createElement("img");
            img.src = base64;
            img.style.width = "100px";
            img.style.height = "100px";
            img.style.objectFit = "cover";
            img.style.margin = "5px";
            container.appendChild(img);
        });
    }

    if (window.openCardViewer) {
        window.openCardViewer.destroy();
    }
    if (typeof Viewer !== "function") {
        return;
    }

    window.openCardViewer = new Viewer(container, {
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
    });
}

/**
 * Resolves/creates edit image container.
 *
 * @returns {HTMLElement} Container element.
 */
function getEditCardImagesContainer() {
    let container = document.getElementById("editCardImagesContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "editCardImagesContainer";
        container.className = "editCardImagesContainer";
        const openCard = document.getElementById("openCardContainer");
        if (openCard) {
            openCard.appendChild(container);
        }
    }
    return container;
}

/**
 * Creates one deleteable thumbnail element.
 *
 * @param {string} base64 - Base64 image content.
 * @param {number} index - Image index.
 * @param {Object} task - Task entity.
 * @returns {HTMLElement} Thumbnail wrapper.
 */
function createThumbnailElement(base64, index, task) {
    const thumb = document.createElement("div");
    thumb.className = "editThumbnailWrapper";

    const img = document.createElement("img");
    img.src = base64;
    img.style.cssText = "width:100px;height:100px;object-fit:cover;margin:5px;";

    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.className = "delete-edit-thumbnail";
    btn.setAttribute("aria-label", "Delete attachment");
    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        task.images.splice(index, 1);
        renderEditCardImages(task);
    });

    thumb.appendChild(img);
    thumb.appendChild(btn);
    return thumb;
}

/**
 * Renders all edit-mode thumbnails.
 *
 * @param {Object} task - Task entity.
 */
function renderEditCardImages(task) {
    const container = getEditCardImagesContainer();
    if (!container) {
        return;
    }

    container.innerHTML = "";
    if (task.images && task.images.length > 0) {
        task.images.forEach((base64, index) => {
            container.appendChild(createThumbnailElement(base64, index, task));
        });
    } else {
        container.innerHTML = "<p>No images attached.</p>";
    }
}
