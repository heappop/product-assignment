const mysql = require('mysql2');
require('dotenv').config();  // Load environment variables from .env file

// Create a MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the MySQL database successfully.');
  }
});

// Function to execute an SQL query with optional parameters and return a Promise
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Query error:', err.message); // Log query errors with a message
        reject(err); // Reject the promise if there is an error
      } else {
        resolve(results); // Resolve the promise with the results
      }
    });
  });
};

// Function to create the 'products' table
const createProductsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(255),
      original_urls TEXT,
      compressed_urls TEXT,
      request_id VARCHAR(100),
      status VARCHAR(50)
    );
  `;

  try {
    const result = await executeQuery(query);
    console.log('Table created or already exists.');
    return result;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Function to insert a new product
const insertProduct = async (productName, originalUrls, compressedUrls = null, requestId = null, status = null) => {
  const joinedOriginalUrls = Array.isArray(originalUrls) ? originalUrls.join(', ') : originalUrls;
  const joinedCompressedUrls = compressedUrls ? (Array.isArray(compressedUrls) ? compressedUrls.join(', ') : compressedUrls) : null;

  console.log('Inserting Product:');
  console.log('Product Name:', productName);
  console.log('Original URLs:', joinedOriginalUrls);
  console.log('Compressed URLs:', joinedCompressedUrls);
  console.log('Request ID:', requestId);
  console.log('Status:', status);

  const query = `
    INSERT INTO products (product_name, original_urls, compressed_urls, request_id, status)
    VALUES (?, ?, ?, ?, ?);
  `;

  try {
    const response = await executeQuery(query, [productName, joinedOriginalUrls, joinedCompressedUrls, requestId, status]);
    console.log('Data inserted successfully.');
    return response;
  } catch (error) {
    console.error('Error inserting data:', error.message);
    throw error;
  }
};

// Function to get all products
const getAllProducts = async () => {
  const query = `
    SELECT * FROM products;
  `;

  try {
    const response = await executeQuery(query);
    console.log('Products retrieved successfully.');
    return response;
  } catch (error) {
    console.error('Error retrieving products:', error);
    throw error;
  }
};

// Export the SQL queries and functions
module.exports = {
  createProductsTable,
  insertProduct,
  getAllProducts,
};
