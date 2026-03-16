const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base storage directory
const MEMORY_DIR = path.join(__dirname, '..', '..', 'memory');

// Ensure memory directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Multer memory storage (buffer first, then save with proper name)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    },
});

// Save buffer to local memory folder
// folder:     category subfolder like 'publications', 'patents', etc.
// empId:      optional employee ID prefix (e.g. 'RCEE001')
// department: optional department name — creates memory/folder/YEAR/DEPT/ subfolder
// Returns: { url, filePath, fileName }
const saveToMemory = (buffer, folder, originalname, empId = '', department = '') => {
    // Current upload year
    const year = new Date().getFullYear().toString();

    // Sanitise dept name
    const safeDept = department
        ? department.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
        : '';

    // Build path: memory/folder/year/dept  (or memory/folder/year if no dept)
    const dir = safeDept
        ? path.join(MEMORY_DIR, folder, year, safeDept)
        : path.join(MEMORY_DIR, folder, year);
    ensureDir(dir);

    // Sanitise the original filename
    const ext = path.extname(originalname) || '.pdf';
    const baseName = path.basename(originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 50);

    // Prefix with empId: EMPID_timestamp_random_basename.ext
    const safeEmpId = empId ? `${empId.replace(/[^a-zA-Z0-9_-]/g, '_')}_` : '';
    const uniqueName = `${safeEmpId}${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${baseName}${ext}`;
    const filePath = path.join(dir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    // URL: /uploads/folder/year/dept/filename  (or /uploads/folder/year/filename)
    const urlPath = safeDept
        ? `/uploads/${folder}/${year}/${safeDept}/${uniqueName}`
        : `/uploads/${folder}/${year}/${uniqueName}`;

    return {
        url: urlPath,
        filePath,
        fileName: uniqueName,
    };
};



// Delete file from memory
const deleteFromMemory = (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Convert URL path to file path
        // URL: /uploads/publications/filename.pdf
        // Path: memory/publications/filename.pdf
        const urlPath = fileUrl.replace('/uploads/', '');
        const filePath = path.join(MEMORY_DIR, urlPath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('File delete error:', error);
    }
};

module.exports = { upload, saveToMemory, deleteFromMemory };
