const tinify = require('tinify');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
tinify.key = 'Jh0cfjxNbtWb5ZM2bMQ9t6R7s7Jh8rdC';

const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

ensureDirectoryExists(path.join(__dirname, 'images'));

const compressImage = async (imageUrl) => {
    try {
        if (!imageUrl) {
            throw new Error('Image URL is required');
        }
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const source = tinify.fromBuffer(imageBuffer);
        const compressedBuffer = await source.toBuffer();
        const imageName = path.basename(new URL(imageUrl).pathname);
        const compressedImagePath = path.join(__dirname, 'images', imageName);
        fs.writeFileSync(compressedImagePath, compressedBuffer);
        const PORT = process.env.PORT || 3000;
        const compressedImageUrl = `http://localhost:${PORT}/images/${imageName}`;
        return compressedImageUrl;

    } catch (error) {
        console.error(error);
        return 'Error while compressing the image';
    }
};

module.exports = compressImage;
