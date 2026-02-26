import API from '../../api/axios';
import toast from 'react-hot-toast';

// Opens a Cloudinary file using a signed URL from the backend
const openCloudinaryFile = async (url) => {
    if (!url) return;
    try {
        const res = await API.get('/files/view', { params: { url } });
        if (res.data.success && res.data.url) {
            window.open(res.data.url, '_blank');
        } else {
            toast.error('Failed to open file');
        }
    } catch (error) {
        console.error('File open error:', error);
        toast.error('Failed to open file');
    }
};

export default openCloudinaryFile;
