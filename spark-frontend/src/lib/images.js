import { api } from './api';

// Must match the backend's upload checks (magic bytes: jpeg/png/gif/webp, max 5 MB).
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Returns an error message, or '' when the file can be uploaded.
export const imageFileError = (file) => {
  if (!IMAGE_TYPES.includes(file?.type)) return 'Only JPEG, PNG, GIF or WebP images are allowed.';
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be under 5 MB.';
  return '';
};

// Uploads an image and resolves to its relative "/api/images/<id>" url.
export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/upload/image', fd);
  return data.url;
};
