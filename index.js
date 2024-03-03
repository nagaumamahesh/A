const express = require('express');
const app = express();
const { Pool } = require('pg');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgres://pwgnhols:3L9Kftm49no91g_azMKEq_vs3sVNzOl6@ruby.db.elephantsql.com/pwgnhols',
});

// Function to calculate total pages
async function getTotalPages() {
  const countQuery = 'SELECT COUNT(*) FROM customers';
  const countResult = await pool.query(countQuery);
  const totalCount = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalCount / 20); // Assuming 20 items per page
  return totalPages;
}

// Route to fetch all details of customers with optional sorting and pagination
app.get('/customers', async (req, res) => {
  try {
    let { page, sort } = req.query;
    page = parseInt(page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers';
    
    if (sort && (sort.toLowerCase() === 'asc' || sort.toLowerCase() === 'desc')) {
      query += ` ORDER BY created_at ${sort.toUpperCase()}`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(query);
    
    // Calculate total pages
    const countQuery = 'SELECT COUNT(*) FROM customers';
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: result.rows,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to search by location or customer name with optional sorting and pagination
app.get('/customers/search', async (req, res) => {
  try {
    let { location, name, page, sort } = req.query;
    page = parseInt(page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers WHERE true';
    const queryParams = [];

    if (location) {
      query += ` AND location ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${location}%`);
    }
    if (name) {
      query += ` AND customer_name ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${name}%`);
    }

    if (sort && (sort.toLowerCase() === 'asc' || sort.toLowerCase() === 'desc')) {
      query += ` ORDER BY created_at ${sort.toUpperCase()}`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(query, queryParams);
    
    // Calculate total pages
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE true';
    if (location) {
      countQuery += ` AND location ILIKE '%${location}%'`;
    }
    if (name) {
      countQuery += ` AND customer_name ILIKE '%${name}%'`;
    }
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: result.rows,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
