import { AttachedFile } from '../types';

export const MAX_SINGLE_FILE_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB
export const MAX_TOTAL_FILES_SIZE_BYTES = 4.0 * 1024 * 1024; // 4.0 MB

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileCategoryIcon(filenameOrType: string): string {
  const ext = (filenameOrType.split('.').pop() || filenameOrType).toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
  return 'file';
}

/**
 * Validates a file before reading and attaching it to localStorage.
 * LocalStorage typically has a ~5MB quota across the domain.
 */
export function validateFileUpload(
  file: File,
  existingFiles: AttachedFile[] = []
): { valid: boolean; warning?: string; error?: string } {
  // Reject files over 3.5MB to prevent quota crashes
  if (file.size > 3.5 * 1024 * 1024) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds browser local storage limit. Please paste a cloud link (Google Drive, Notion, Slides) instead ♡`,
    };
  }

  const existingTotal = existingFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  if (existingTotal + file.size > 4.2 * 1024 * 1024) {
    return {
      valid: false,
      error: `Attaching "${file.name}" would exceed browser local storage capacity (~4.5MB). Consider removing older files or attaching a link ♡`,
    };
  }

  if (file.size > MAX_SINGLE_FILE_SIZE_BYTES) {
    return {
      valid: true,
      warning: `"${file.name}" is ${formatFileSize(file.size)}. For large textbooks or slides, pasting a Google Drive or Notion link is recommended ♡`,
    };
  }

  return { valid: true };
}

/**
 * Opens an attached local file in the browser:
 * - For PDF / Images: opens in a new tab or triggers view
 * - For Word / PowerPoint: triggers a clean download for viewing in local desktop apps
 */
export function openAttachedFile(file: AttachedFile): void {
  if (!file.dataUrl) {
    console.warn(`File "${file.name}" content is unavailable.`);
    return;
  }

  try {
    const parts = file.dataUrl.split(',');
    if (parts.length < 2) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.rel = 'noopener noreferrer';

    // If PDF or image, attempt to open in new tab or download
    if (mime.includes('pdf') || mime.includes('image')) {
      a.target = '_blank';
      // In iframes, setting download or opening
      a.download = file.name;
    } else {
      a.download = file.name;
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke object URL after brief delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);
  } catch (err) {
    console.error('Error opening file:', err);
    // Fallback: anchor download using data URL
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
