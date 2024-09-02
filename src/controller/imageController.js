const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { insertProduct, getStatusByRequestId } = require('../database/sql');
const compressImage = require('../imageServices/imageService');

const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
const generateRequestId = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `req${randomNumber}`;
};

const processCsvFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                const normalizedData = {};
                Object.keys(data).forEach((key) => {
                    const normalizedKey = key.trim().replace(/^"|"$/g, '');
                    normalizedData[normalizedKey] = data[key];
                });
                const productName = normalizedData['product_name'];
                const imageUrls = Object.keys(normalizedData)
                    .filter((key) => key.startsWith('image_url__'))
                    .map((key) => normalizedData[key]);
                const productData = {
                    product_name: productName,
                    image_urls: imageUrls,
                };
                results.push(productData);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const uploadCsvFile = async (req, res) => {
    upload.single('csvFile')(req, res, async (err) => {
        if (err) {
            return res.status(500).send(`Error uploading file: ${err}`);
        }
        const filePath = path.join(uploadDir, req.file.filename);
        const requestId = generateRequestId();
        try {
            const results = await processCsvFile(filePath);
            try {
                for (const { product_name, image_urls } of results) {
                    const compressedUrls = [];
                    for (const url of image_urls) {
                        const compressed_url = await compressImage(url);
                        compressedUrls.push(compressed_url);
                    }

                    try {
                        const data = await insertProduct(product_name, image_urls, compressedUrls, requestId, 'successfull'); // Insert each product

                    } catch (insertError) {
                        console.error('Error inserting product:', insertError);
                    }
                }
                res.status(200).json({ message: 'Data inserted successfully.', requestId });
            } catch (dbError) {
                console.error('Error inserting data:', dbError);
                res.status(500).send('Error inserting data into the database.');
            }
        } catch (fileError) {
            console.error('Error during file processing:', fileError);
            res.status(500).send('Internal server error.');
        }
    });
};

const getStatus = async (req, res) => {
    const { requestId } = req.body;
    if (!requestId) {
        return res.status(400).send('Request ID is required.');
    }
    try {
        const results = await getStatusByRequestId(requestId);
        if (results.length === 0) {
            return res.status(404).send('Product not found.');
        }
        const status = results[0].status;
        res.status(200).json({ status });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = {
    uploadCsvFile,
    getStatus,

};



