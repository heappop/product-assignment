const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { insertProduct, getStatusByRequestId } = require('../database/sql');

// Ensure the 'upload' directory exists
const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Directory where CSV files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Keep the original file name
    }
});

const upload = multer({ storage: storage });

// Function to generate a 5-digit random number and prefix with "req"
const generateRequestId = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
    return `req${randomNumber}`; // Prefix with "req"
};

// Function to process CSV file and extract product data
const processCsvFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                // Normalize keys to remove any extra quotes or spaces
                const normalizedData = {};
                Object.keys(data).forEach((key) => {
                    const normalizedKey = key.trim().replace(/^"|"$/g, ''); // Remove any surrounding quotes and trim spaces
                    normalizedData[normalizedKey] = data[key];
                });

                // Extract product name and image URLs from normalized data
                const productName = normalizedData['product_name'];
                const imageUrls = Object.keys(normalizedData)
                    .filter((key) => key.startsWith('image_url__'))
                    .map((key) => normalizedData[key]);

                // Create a new object for each product with extracted fields
                const productData = {
                    product_name: productName,
                    image_urls: imageUrls,
                };

                console.log('Extracted Product Data:', JSON.stringify(productData, null, 2)); // Print each extracted product data in JSON format
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

// Controller to handle CSV file upload and processing
const uploadCsvFile = async (req, res) => {
    // Handle file upload with multer
    upload.single('csvFile')(req, res, async (err) => {
        if (err) {
            return res.status(500).send(`Error uploading file: ${err}`);
        }

        const filePath = path.join(uploadDir, req.file.filename); // Use the correct directory path
        const requestId = generateRequestId(); // Generate the request ID

        try {
            // Read and parse the CSV file
            const results = await processCsvFile(filePath);
            
            // Insert data into the database
            try {
                for (const { product_name, image_urls } of results) {
                    console.log('Inserting Product Name:', product_name); // Debug: log before inserting
                    console.log('Image URLs to Insert:', image_urls); // Debug: log image URLs
                
                    try {
                        const data = await insertProduct(product_name, image_urls, null, requestId, 'Pending'); // Insert each product
                        console.log('Inserted Data Response:', data); // Debug: log response from DB insertion
                    } catch (insertError) {
                        console.error('Error inserting product:', insertError);
                        // Handle individual insertion errors if needed
                    }
                }
                
                console.log('All data inserted successfully.');
                res.status(200).json({ requestId, products: results });
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
    console.log('Request Body:', req.body);
  
    // Extract requestId from request body
    const { requestId } = req.body;
  
    // Check if requestId is provided
    if (!requestId) {
      return res.status(400).send('Request ID is required.');
    }
  
    try {
      const results = await getStatusByRequestId(requestId);
  
      // Check if the results were found
      if (results.length === 0) {
        return res.status(404).send('Product not found.');
      }
  
      // Return the status in the response
      const status = results[0].status;
      res.status(200).json({ status });
    } catch (error) {
      console.error('Error fetching status:', error);
      res.status(500).send('Internal server error');
    }
  };

module.exports = {
    uploadCsvFile,
    getStatus
};
