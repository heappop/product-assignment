const mysql = require('mysql2');
require('dotenv').config(); 

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the MySQL database successfully.');
  }
});

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Query error:', err.message); 
        reject(err); 
      } else {
        resolve(results); 
      }
    });
  });
};

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

const insertProduct = async (productName, originalUrls, compressedUrls = null, requestId = null, status = null) => {
  const joinedOriginalUrls = Array.isArray(originalUrls) ? originalUrls.join(', ') : originalUrls;
  const joinedCompressedUrls = compressedUrls ? (Array.isArray(compressedUrls) ? compressedUrls.join(', ') : compressedUrls) : null;
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

const getStatusByRequestId = async(requestId) =>
{
    const query = 'SELECT status FROM products WHERE request_id = ?';
    try{
        const response = await executeQuery(query, [requestId]);
        console.log( "data fetched", response)
        return response;
    }
    catch(error)
    {
        console.error('Error while fecthing data', error)
        throw error
    }
}

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

module.exports = {
  createProductsTable,
  insertProduct,
  getAllProducts,
  getStatusByRequestId
};
