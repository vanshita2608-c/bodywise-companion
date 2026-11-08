/** Progress photos stay on the device (localStorage), resized to keep them small. */
const KEY = "bw_photos_v1";

export type Photo = { week: number; image: string; takenAt: number };

export function loadPhotos(): Photo[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Photo[];
  } catch {
    return [];
  }
}

export function savePhotos(photos: Photo[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(photos));
    return true;
  } catch {
    return false; // storage full or blocked
  }
}

export function clearPhotos() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Resize to max 768px and re-encode as JPEG (~80–150 KB). */
export function resizeImage(file: File, max = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}
