const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Get signed URL for a Cloudinary file
// @route   GET /api/files/view?url=<cloudinary_url>
router.get('/view', protect, (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        // Extract public_id and resource_type from the Cloudinary URL
        // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Find the index of 'upload' in the path
        const uploadIdx = pathParts.indexOf('upload');
        if (uploadIdx === -1) {
            return res.status(400).json({ success: false, message: 'Invalid Cloudinary URL' });
        }

        // Resource type is before 'upload' (e.g., 'image', 'raw')
        const resourceType = pathParts[uploadIdx - 1] || 'image';

        // Public ID is everything after the version segment
        // Skip version (starts with 'v' followed by digits)
        let startIdx = uploadIdx + 1;
        if (pathParts[startIdx] && /^v\d+$/.test(pathParts[startIdx])) {
            startIdx++;
        }
        const publicId = pathParts.slice(startIdx).join('/');

        // Remove file extension for image type (Cloudinary stores without extension)
        let cleanPublicId = publicId;
        if (resourceType === 'image') {
            cleanPublicId = publicId.replace(/\.[^/.]+$/, '');
        }

        // Generate signed URL (valid for 1 hour)
        const signedUrl = cloudinary.url(cleanPublicId, {
            resource_type: resourceType,
            type: 'upload',
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
        });

        res.json({ success: true, url: signedUrl });
    } catch (error) {
        console.error('File proxy error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate file URL' });
    }
});

module.exports = router;
