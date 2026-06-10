// =============================================
// CAMERA.JS — Camera Capture & Image Upload
// =============================================

let currentStream = null;

// ── File Upload ───────────────────────────────
function openFilePicker(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = undefined; // allow gallery
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await processImageFile(file);
    callback(result);
  };
  input.click();
}

function openCamera(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment'; // rear camera
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await processImageFile(file);
    callback(result);
  };
  input.click();
}

// ── Process Image File ────────────────────────
async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target.result;
      try {
        const compressed = await compressImage(originalDataUrl, 1024, 0.85);
        const thumbnail  = await compressImage(originalDataUrl, 200, 0.7);
        const base64     = compressed.split(',')[1];
        const mimeType   = file.type || 'image/jpeg';
        resolve({
          originalUrl: originalDataUrl,
          compressedUrl: compressed,
          thumbnailUrl: thumbnail,
          base64,
          mimeType,
          fileName: file.name,
          fileSize: file.size
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Compress Image ────────────────────────────
function compressImage(dataUrl, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ── Paste from Clipboard ──────────────────────
async function pasteFromClipboard() {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const file = new File([blob], 'pasted.jpg', { type });
          return processImageFile(file);
        }
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

// ── Drop Zone Handler ─────────────────────────
function initDropZone(element, callback) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    element.classList.add('drag-over');
  });

  element.addEventListener('dragleave', () => {
    element.classList.remove('drag-over');
  });

  element.addEventListener('drop', async (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const result = await processImageFile(file);
      callback(result);
    }
  });
}

window.CameraUtil = {
  openFilePicker,
  openCamera,
  processImageFile,
  compressImage,
  pasteFromClipboard,
  initDropZone
};
