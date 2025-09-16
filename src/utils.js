// Additional utility functions for audio handling

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file exists
 */
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

/**
 * Get file size in MB
 * @param {string} filePath - Path to the file
 * @returns {number} - File size in MB
 */
function getFileSizeMB(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size / (1024 * 1024);
    } catch (error) {
        return 0;
    }
}

/**
 * Delete a file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if deletion was successful
 */
function deleteFile(filePath) {
    try {
        if (fileExists(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}
