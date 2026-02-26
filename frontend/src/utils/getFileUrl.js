// Base URL for the backend server (without /api)
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

// Convert a local file URL (like /uploads/publications/file.pdf) to a full URL
const getFileUrl = (url) => {
    if (!url) return '';
    // If already a full URL (http/https), return as-is (legacy Cloudinary URLs)
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Local file — prepend backend base URL
    return `${BACKEND_URL}${url}`;
};

export default getFileUrl;
