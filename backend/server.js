require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const router = express.Router();
const statsRouter = express.Router();


const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "", // Handle empty password
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 100, // Allow up to 10 concurrent connections
  queueLimit: 0,
});

// ✅ No need for `db.connect()` with a pool

// Test Database Connection
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// User Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Database error", error: err });

          res.status(201).json({ message: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({ message: "Login successful", token, user });
  });
});
// Get All Parts
app.get('/parts', (req, res) => {
  db.query('SELECT * FROM parts', (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Get a Single Part by ID
app.get('/parts/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM parts WHERE id = ?', [id], (err, result) => {
      if (err) throw err;
      res.json(result[0]);
  });
});

// Add a Part
app.post('/parts', (req, res) => {
  const { serial_number, part_no, hsn_sac, vehicle, part_description, qty, mrp, rate, value, cgst, sgst } = req.body;
  const sql = 'INSERT INTO parts (serial_number, part_no, hsn_sac, vehicle, part_description, qty, mrp, rate, value, cgst, sgst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [serial_number, part_no, hsn_sac, vehicle, part_description, qty, mrp, rate, value, cgst, sgst], (err, result) => {
      if (err) throw err;
      res.json({ message: 'Part added successfully', id: result.insertId });
  });
});

// Update a Part
app.put('/parts/:id', (req, res) => {
  const { id } = req.params;
  const { serial_number, part_no, hsn_sac, vehicle, part_description, qty, mrp, rate, value, cgst, sgst } = req.body;
  const sql = 'UPDATE parts SET serial_number = ?, part_no = ?, hsn_sac = ?, vehicle = ?, part_description = ?, qty = ?, mrp = ?, rate = ?, value = ?, cgst = ?, sgst = ? WHERE id = ?';
  db.query(sql, [serial_number, part_no, hsn_sac, vehicle, part_description, qty, mrp, rate, value, cgst, sgst, id], (err, result) => {
      if (err) throw err;
      res.json({ message: 'Part updated successfully' });
  });
});

// Delete a Part
app.delete('/parts/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM parts WHERE id = ?', [id], (err, result) => {
      if (err) throw err;
      res.json({ message: 'Part deleted successfully' });
  });
});

// Get vehicle models
app.get("/models", (req, res) => {
  db.query("SELECT DISTINCT vehicle FROM parts", (err, results) => {
    if (err) throw err;
    res.json(results.map((row) => row.vehicle));
  });
});

// Get parts by model
app.get("/parts/:model", (req, res) => {
  db.query("SELECT * FROM parts WHERE vehicle = ?", [req.params.model], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});




// Fetch parts by part_no dynamically
app.get("/parts", (req, res) => {
  const { part_no } = req.query;
  let query = "SELECT * FROM parts";
  let values = [];

  if (part_no) {
    query += " WHERE part_no LIKE ?";
    values.push(`%${part_no}%`);
  }

  pool.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Save invoice details
app.post("/save-invoice", async (req, res) => {
  const { customerDetails, selectedParts } = req.body;

  try {
    // Start a transaction to ensure both operations succeed or fail together
    const connection = await db.promise().getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insert invoice
      const invoiceQuery = `
        INSERT INTO invoices 
        (name, address, contact, email, model, reg_no, invoice_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const invoiceValues = [
        customerDetails.name,
        customerDetails.address,
        customerDetails.contact,
        customerDetails.email,
        customerDetails.model,
        customerDetails.regNo,
        customerDetails.invoiceDate
      ];

      const [invoiceResult] = await connection.query(invoiceQuery, invoiceValues);
      const invoiceId = invoiceResult.insertId;

      // 2. Insert each part into invoice_parts AND update stock in parts table
      for (const part of selectedParts) {
        // Insert into invoice_parts
        const partQuery = `
          INSERT INTO invoice_parts 
          (invoice_id, part_no, part_description, qty, rate, sgst, cgst) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const partValues = [
          invoiceId,
          part.part_no || '',
          part.part_description || '',
          part.quantity || 1,
          part.rate || 0,
          part.sgst || 0,
          part.cgst || 0,
          part.hsn_sac || ''
        ];

        await connection.query(partQuery, partValues);

        // Update the parts table to reduce quantity
        const updateStockQuery = `
          UPDATE parts 
          SET qty = qty - ? 
          WHERE part_no = ? AND qty >= ?
        `;
        
        const updateValues = [
          part.quantity || 1,
          part.part_no,
          part.quantity || 1
        ];

        const [updateResult] = await connection.query(updateStockQuery, updateValues);

        // Check if any rows were affected (part exists and had sufficient quantity)
        if (updateResult.affectedRows === 0) {
          throw new Error(`Insufficient stock or part not found: ${part.part_no}`);
        }
      }

      // Commit the transaction if all operations succeeded
      await connection.commit();
      connection.release();

      res.status(200).json({ 
        message: "Invoice saved successfully",
        invoiceId: invoiceId
      });

    } catch (error) {
      // Rollback the transaction if any error occurred
      await connection.rollback();
      connection.release();
      throw error; // This will be caught by the outer catch
    }

  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).json({ 
      message: "Error saving invoice",
      error: error.message 
    });
  }
});



app.get("/invoice/:invoice_id", (req, res) => {
  const { invoice_id } = req.params;
  const query = `SELECT name, address, contact, email FROM invoices WHERE invoice_id = ?`;

  db.query(query, [invoice_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      res.json(results[0]); // Return first record
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  });
});

app.post("/service-invoice", (req, res) => {
  const { customerDetails, selectedParts, subtotal, tax, totalDue } = req.body;

  const sql = `
    INSERT INTO service_invoices 
    (invoice_number, customer_name, customer_address, customer_contact, customer_email, vehicle_model, registration_number, invoice_date, subtotal, total_due) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    `INV-${Date.now()}`,
    customerDetails.name,
    customerDetails.address,
    customerDetails.contact,
    customerDetails.email,
    customerDetails.model,
    customerDetails.regNo,
    customerDetails.invoiceDate,
    subtotal,
    totalDue,
  ];

  // ✅ Use db.query() instead of db.getConnection()
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting invoice:", err);
      return res.status(500).json({ error: "Failed to save invoice" });
    }

    const invoiceId = result.insertId;

    if (!invoiceId) {
      return res.status(500).json({ error: "Failed to retrieve invoice ID" });
    }

    // ✅ Use batch insert for parts
    const partValues = selectedParts.map((part) => [
      invoiceId,
      part.part_no,
      part.hsn_sac,
      part.vehicle,
      part.part_description,
      part.qty,
      part.mrp,
      part.rate,
      part.value,
      part.cgst,
      part.sgst,
    ]);

    const partSql = `
      INSERT INTO service_invoice_parts 
      (invoice_id, part_no, hsn_sac, vehicle, part_description, qty, mrp, rate, value, cgst, sgst) 
      VALUES ?`;

    db.query(partSql, [partValues], (err) => {
      if (err) {
        console.error("Error inserting parts:", err);
        return res.status(500).json({ error: "Failed to save parts" });
      }

      res.json({ message: "Invoice and parts saved successfully!" });
    });
  });
});


app.post("/invoice-summary", async (req, res) => {
  const { customerName, invoiceDate, subtotal, cgst, sgst, totalDue } = req.body;

  if (!customerName || !invoiceDate || subtotal === undefined || cgst === undefined || sgst === undefined || totalDue === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO invoice_summary (customer_name, invoice_date, subtotal, cgst, sgst, total_due)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Store exactly as provided (subtotal & grand total)
    const values = [customerName, invoiceDate, subtotal, cgst, sgst, totalDue];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting invoice summary:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "Invoice summary saved successfully!" });
    });
  } catch (error) {
    console.error("Error saving invoice summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/invoice-summary", async (req, res) => {
  try {
    const query = `SELECT * FROM invoice_summary ORDER BY invoice_date DESC`; // Modify as needed
    const [results] = await db.promise().query(query);

    res.json(results);
  } catch (error) {
    console.error("Error fetching invoice summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/customers", async (req, res) => {
  try {
    const { type } = req.query;
    
    if (type === 'tax') {
      const [rows] = await db.promise().query(`
        SELECT 
          i.invoice_id,
          i.name AS customer_name,
          i.address,
          i.contact,
          i.email,
          i.model,
          i.reg_no,
          i.invoice_date,
          i.status,
          COALESCE(s.total_due, 0) AS total_due,
          'tax' AS invoice_type
        FROM invoices i
        LEFT JOIN invoice_summary s ON 
          i.name = s.customer_name AND
          DATE(i.invoice_date) = DATE(s.invoice_date)
        GROUP BY i.invoice_id
        ORDER BY i.invoice_date DESC
      `);
      
      res.json(rows);
    } else if (type === 'labour') {
      const [rows] = await db.promise().query(`
        SELECT 
          invoice_number as invoice_id,
          customer_name AS name,
          customer_address AS address,
          customer_contact AS contact,
          customer_email AS email,
          invoice_date,
          status,
          grand_total AS total_due,
          'labour' AS invoice_type
        FROM labour_invoices
        ORDER BY invoice_date DESC
      `);
      
      res.json(rows);
    } else if (type === 'invoice') {
      const [rows] = await db.promise().query(`
        SELECT 
          id AS invoice_id,
          customer_name AS name,
          customer_contact AS contact,
          customer_email AS email,
          vehicle_model AS model,
          estimate_date AS invoice_date,
          total_amount AS total_due,
          status,
          'invoice' AS document_type
        FROM estimates
        WHERE document_Type = 'invoice'
        ORDER BY estimate_date DESC
      `);
      
      res.json(rows);
    } else {
      res.status(400).json({ error: "Invalid invoice type specified" });
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});


app.put("/update-status/:id", async (req, res) => {
  const { id } = req.params;
  const { status, invoice_type } = req.body;

  try {
    // Validate input
    if (!status || !invoice_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if ID is valid (not 'N/A')
    if (id === 'N/A') {
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    let query, params;
    
    if (invoice_type === 'tax') {
      query = "UPDATE invoices SET status = ? WHERE invoice_id = ?";
      params = [status, id];
    } else if (invoice_type === 'labour') {
      query = "UPDATE labour_invoices SET status = ? WHERE invoice_number = ?";
      params = [status, id];
    } else if (invoice_type === 'invoice') {
      query = "UPDATE estimates SET status = ? WHERE id = ? AND document_type = 'invoice'";
      params = [status, id];
    } else {
      return res.status(400).json({ error: "Invalid invoice type" });
    }

    const [result] = await db.promise().query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: "Invoice not found",
        details: `No ${invoice_type} invoice found with ID: ${id}`
      });
    }

    res.json({ 
      success: true, 
      message: "Status updated successfully",
      invoice_id: id,
      invoice_type: invoice_type,
      new_status: status
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.delete("/delete-invoice/:id", async (req, res) => {
  const { id } = req.params;
  const { invoice_type } = req.body;

  // Validate input
  if (!id || !invoice_type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    let deleteQuery, deleteParams;

    if (invoice_type === 'tax') {
      // First delete from invoice_summary (child table)
      await db.promise().query(
        "DELETE FROM invoice_summary WHERE customer_name = ?", 
        [id]
      );
      
      // Then delete from invoices (parent table)
      deleteQuery = "DELETE FROM invoices WHERE invoice_id = ?";
      deleteParams = [id];
    } else if (invoice_type === 'labour') {
      deleteQuery = "DELETE FROM labour_invoices WHERE invoice_number = ?";
      deleteParams = [id];
    } else if (invoice_type === 'invoice') {
      deleteQuery = "DELETE FROM estimates WHERE id = ? AND document_type = 'invoice'";
      deleteParams = [id];
    } else {
      return res.status(400).json({ error: "Invalid invoice type" });
    }

    // Delete the main invoice record
    const [result] = await db.promise().query(deleteQuery, deleteParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ 
      success: true, 
      message: "Invoice deleted successfully",
      deletedId: id
    });
    
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ 
      error: "Failed to delete invoice",
      details: error.message
    });
  }
});












app.get("/latest-invoice-id", async (req, res) => {
  try {
    const [rows] = await db.promise().execute("SELECT MAX(invoice_id) AS latestId FROM invoices");

    const latestId = rows[0].latestId !== null ? rows[0].latestId + 0 : 0; // Ensure it starts from 1

    return res.json({ invoiceId: latestId });
  } catch (error) {
    console.error("Error fetching latest invoice ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/customer-total/:customerName", async (req, res) => {
  const { customerName } = req.params;

  try {
    const query = "SELECT total_due FROM invoice_summary WHERE customer_name = ?";
    const [rows] = await db.promise().query(query, [customerName]);

    if (rows.length > 0) {
      return res.json({ totalAmount: rows[0].total_due });
    } else {
      return res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    console.error("Error fetching total amount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/invoices-details', (req, res) => {
  const query = `
    (SELECT 
      name AS customer_name,
      address AS customer_address,
      contact AS customer_contact,
      email AS customer_email,
      invoice_date,
      status,
      'tax' AS invoice_type
    FROM invoices)
    UNION ALL
    (SELECT 
      customer_name,
      customer_address,
      customer_contact,
      customer_email,
      invoice_date,
      status,
      'labour' AS invoice_type
    FROM labour_invoices)
    UNION ALL
    (SELECT 
      customer_name,
      customer_address,
      customer_contact,
      customer_email,
      estimate_date AS invoice_date,
      status,
      'invoice' AS document_type
    FROM estimates
    WHERE document_type = 'invoice')
    ORDER BY invoice_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching invoice details:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }
    
    // Format dates to more readable format
    const formattedResults = results.map(invoice => ({
      ...invoice,
      invoice_date: new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

    res.json(formattedResults);
  });
});


// Dashboard statistics endpoint
/// Dashboard statistics endpoint
statsRouter.get('/', async (req, res) => {
  try {
    const dbPromise = db.promise();
    const [invoices, parts, pending, revenue] = await Promise.all([
      dbPromise.query('SELECT COUNT(invoice_id) as count FROM invoices'),
      dbPromise.query('SELECT COUNT(serial_number) as count FROM parts'),
      dbPromise.query("SELECT COUNT(*) as count FROM invoices WHERE status = 'Pending'"),
      dbPromise.query('SELECT SUM(total_due) as sum FROM invoice_summary')
    ]);

    res.json({
      totalInvoices: invoices[0][0].count,
      totalParts: parts[0][0].count,
      pendingOrders: pending[0][0].count,
      totalRevenue: revenue[0][0].sum || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Mount the router with the base path
app.use('/api/dashboard-stats', statsRouter);

app.get('/parts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parts');
    
    const products = rows.map(part => ({
      id: part.id,
      serial_number: part.serial_number,
      part_no: part.part_no,
      name: part.part_description || 'Unnamed Part',
      brand: part.hsn_sac || 'Unknown Brand',
      size: '',
      availability: part.qty > 0,
      price: part.mrp,
      suitableFor: [
        {
          model: part.vehicle || 'Multiple Vehicles',
          price: part.rate
        }
      ],
      qty: part.qty,
      mrp: part.mrp,
      rate: part.rate,
      value: part.value,
      cgst: part.cgst,
      sgst: part.sgst
    }));
    
    res.json(products);
  } catch (err) {
    console.error('Error fetching parts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/parts/:id', async (req, res) => {
  try {
    const partId = req.params.id;
    
    if (!partId || isNaN(partId)) {
      return res.status(400).json({ error: 'Invalid part ID' });
    }
    
    const [rows] = await pool.query('SELECT * FROM parts WHERE id = ?', [partId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    const part = rows[0];
    const product = {
      id: part.id,
      serial_number: part.serial_number,
      part_no: part.part_no,
      name: part.part_description || 'Unnamed Part',
      brand: part.hsn_sac || 'Unknown Brand',
      size: '',
      availability: part.qty > 0,
      price: part.mrp,
      suitableFor: [
        {
          model: part.vehicle || 'Multiple Vehicles',
          price: part.rate
        }
      ],
      qty: part.qty,
      mrp: part.mrp,
      rate: part.rate,
      value: part.value,
      cgst: part.cgst,
      sgst: part.sgst
    };
    
    res.json(product);
  } catch (err) {
    console.error('Error fetching part:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add this to your server.js or routes file
function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Search Invoices Endpoint
app.get('/search-invoices', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    // Get invoices with their summary data
    const invoices = await queryAsync(
      `SELECT i.*, s.subtotal, s.cgst, s.sgst, s.total_due as total_amount
       FROM invoices i
       JOIN invoice_summary s ON i.name = s.customer_name AND i.invoice_date = s.invoice_date
       WHERE i.name LIKE ? 
       ORDER BY i.invoice_date DESC`,
      [`%${name}%`]
    );

    // Get parts for each invoice
    const invoicesWithParts = await Promise.all(
      invoices.map(async (invoice) => {
        const parts = await queryAsync(
          `SELECT * FROM invoice_parts WHERE invoice_id = ?`,
          [invoice.invoice_id]
        );
        return { 
          ...invoice,
          parts,
          // These values now come from invoice_summary
          subtotal: Number(invoice.subtotal).toFixed(2),
          cgst: Number(invoice.cgst).toFixed(2),
          sgst: Number(invoice.sgst).toFixed(2),
          total_amount: Number(invoice.total_amount).toFixed(2)
        };
      })
    );

    res.json(invoicesWithParts);
  } catch (error) {
    console.error('Error searching invoices:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});



app.post('/service-estimate', async (req, res) => {
  let connection;
  try {
    const { customerDetails, selectedParts, totalDue, documentType } = req.body;
    
    // Validate required fields including totalDue
    if (!customerDetails?.name || !selectedParts || !Array.isArray(selectedParts) || 
        totalDue === undefined || totalDue === null|| !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields or invalid total amount'
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    
    // Calculate total on server side for double verification
    const calculatedTotal = selectedParts.reduce((sum, part) => {
      return sum + (Number(part.rate || 0) * (Number(part.quantity || 1)));
    }, 0);

    // Use the calculated total (or the provided totalDue if you prefer)
    const finalTotal = calculatedTotal;

    const [estimateResult] = await connection.query(
      `INSERT INTO estimates 
      (customer_name, customer_address, customer_contact, customer_email, 
       vehicle_model, vehicle_reg_no, estimate_date, total_amount, document_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerDetails.name,
        customerDetails.address || null,
        customerDetails.contact || null,
        customerDetails.email || null,
        customerDetails.model || null,
        customerDetails.regNo || null,
        customerDetails.estimateDate || new Date().toISOString().split('T')[0],
        finalTotal,
        documentType  // Using the calculated total
      ]
    );
    
    const estimateId = estimateResult.insertId;
    const partsValues = selectedParts.map(part => [
      estimateId,
      part.part_no,
      part.part_description || null,
      part.hsn_sac || null,
      part.rate || 0,
      part.quantity || 1,
      (part.rate || 0) * (part.quantity || 1)
    ]);

    if (partsValues.length > 0) {
      await connection.query(
        `INSERT INTO estimate_parts 
        (estimate_id, part_no, part_description, hsn_sac, rate, quantity, amount) 
        VALUES ?`,
        [partsValues]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Estimate saved successfully',
      estimateId
    });
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error saving estimate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save estimate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * @route POST /estimate-summary
 * @desc Save estimate summary data
 */
app.post('/estimate-summary', async (req, res) => {
  try {
    const { customerName, estimateDate, totalDue } = req.body;

    if (!customerName || !estimateDate || totalDue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await db.promise().query(
      `INSERT INTO estimate_summary 
      (customer_name, estimate_date, total_amount) 
      VALUES (?, ?, ?)`,
      [customerName, estimateDate, totalDue]
    );
    
    res.json({ 
      success: true, 
      message: 'Estimate summary saved',
      id: result.insertId 
    });
    
  } catch (error) {
    console.error('Error saving estimate summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /latest-estimate-id
 * @desc Get the latest estimate ID
 */
app.get('/latest-estimate-id', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id AS estimateId FROM estimates ORDER BY id DESC LIMIT 1'
    );
    
    res.json({ 
      success: true,
      estimateId: rows.length > 0 ? rows[0].estimateId : 1000
    });
  } catch (error) {
    console.error('Error fetching latest estimate ID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch estimate ID',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



app.get('/search-estimates', async (req, res) => {
  try {
    const { name, documentType } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // Base query
    let query = `
      SELECT 
        e.id,
        e.customer_name as name,
        e.customer_address as address,
        e.customer_contact as contact,
        e.customer_email as email,
        e.vehicle_model as model,
        e.vehicle_reg_no as reg_no,
        e.estimate_date,
        e.total_amount,
        e.document_type
      FROM estimates e 
      WHERE e.customer_name LIKE ? 
    `;
    
    const queryParams = [`%${name}%`];

    // Add document type filter if specified
    if (documentType) {
      query += ' AND e.document_type = ?';
      queryParams.push(documentType);
    }

    query += ' ORDER BY e.estimate_date DESC';

    // Execute the query
    const [documents] = await db.promise().query(query, queryParams);

    if (documents.length === 0) {
      return res.json([]);
    }

    // Get estimate IDs for parts lookup
    const estimateIds = documents.map(d => d.id);

    // Get all parts for the found estimates
    const [parts] = await db.promise().query(
      `SELECT 
        id,
        estimate_id,
        part_no,
        part_description,
        rate,
        quantity,
        (rate * quantity) as amount
      FROM estimate_parts 
      WHERE estimate_id IN (?)`,
      [estimateIds]
    );

    // Group parts by estimate ID
    const partsByDocument = parts.reduce((acc, part) => {
      if (!acc[part.estimate_id]) {
        acc[part.estimate_id] = [];
      }
      acc[part.estimate_id].push(part);
      return acc;
    }, {});

    // Combine documents with their parts
    const results = documents.map(document => ({
      estimate_id: document.id,  // Changed from document.estimate_id to document.id
      name: document.name,
      address: document.address,
      contact: document.contact,
      email: document.email,
      model: document.model,
      reg_no: document.reg_no,
      estimate_date: document.estimate_date,
      total_amount: document.total_amount,
      document_type: document.document_type || 'estimate',
      parts: partsByDocument[document.id] || []
    }));

    res.json(results);
    
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search documents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


/**
 * @route GET /estimate/:id
 * @desc Get estimate details by ID
 * @access Public
 */
app.get('/estimate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get estimate details
    const [estimates] = await db.promise().query(
      `SELECT * FROM estimates WHERE id = ?`,
      [id]
    );

    if (estimates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    const estimate = estimates[0];

    // Get estimate parts
    const [parts] = await db.promise().query(
      `SELECT * FROM estimate_parts WHERE estimate_id = ?`,
      [id]
    );

    res.json({
      ...estimate,
      parts
    });
    
  } catch (error) {
    console.error('Error fetching estimate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch estimate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



function generateLabourInvoiceNumber() {
  const prefix = 'LAB';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${month}${random}`;
}

// Save labour invoice (callback version)
app.post('/save-labour-invoice', (req, res) => {
  const { customerDetails, labourItems } = req.body;
  const formattedDate = new Date(customerDetails.invoiceDate).toISOString().split('T')[0];
  // Calculate totals
  const subtotal = labourItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCGST = labourItems.reduce((sum, item) => sum + (item.subtotal * item.cgst / 100), 0);
  const totalSGST = labourItems.reduce((sum, item) => sum + (item.subtotal * item.sgst / 100), 0);
  const grandTotal = subtotal + totalCGST + totalSGST;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Transaction error' });
      }
      
      // Insert invoice header
      const headerQuery = `
        INSERT INTO labour_invoices (
          invoice_number, customer_name, customer_address, customer_contact, 
          customer_email, vehicle_model, vehicle_reg_no, invoice_date, 
          subtotal, cgst, sgst, grand_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const headerValues = [
        generateLabourInvoiceNumber(),
        customerDetails.name,
        customerDetails.address,
        customerDetails.contact,
        customerDetails.email,
        customerDetails.model,
        customerDetails.regNo,
        formattedDate,
        subtotal,
        totalCGST,
        totalSGST,
        grandTotal
      ];

      connection.query(headerQuery, headerValues, (err, invoiceResult) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error('Error saving invoice header:', err);
            res.status(500).json({ error: 'Failed to save invoice header' });
          });
        }
        
        const invoiceId = invoiceResult.insertId;
        
        if (labourItems.length === 0) {
          return connection.commit(err => {
            connection.release();
            if (err) {
              console.error('Error committing transaction:', err);
              return res.status(500).json({ error: 'Transaction commit error' });
            }
            res.status(200).json({
              message: 'Labour invoice saved successfully',
              invoiceId: invoiceId
            });
          });
        }
        
        // Prepare line items
        const itemQueries = labourItems.map(item => {
          return new Promise((resolve, reject) => {
            const itemQuery = `
              INSERT INTO labour_invoice_items (
                invoice_id, sno, description, tinkering, painting, 
                electrician, mechanical, cgst, sgst, subtotal, total
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const itemValues = [
              invoiceId,
              item.sno,
              item.description,
              item.tinkering,
              item.painting,
              item.electrician,
              item.mechanical,
              item.cgst,
              item.sgst,
              item.subtotal,
              item.total
            ];
            
            connection.query(itemQuery, itemValues, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
        
        Promise.all(itemQueries)
          .then(() => {
            connection.commit(err => {
              connection.release();
              if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ error: 'Transaction commit error' });
              }
              res.status(200).json({
                message: 'Labour invoice saved successfully',
                invoiceId: invoiceId
              });
            });
          })
          .catch(err => {
            connection.rollback(() => {
              connection.release();
              console.error('Error saving invoice items:', err);
              res.status(500).json({ error: 'Failed to save invoice items' });
            });
          });
      });
    });
  });
});

// Get labour invoice by ID (callback version)
// Get the latest labour invoice ID
app.get('/latest-labour-invoice-id', (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    connection.query(
      'SELECT MAX(id) AS latestId FROM labour_invoices',
      (err, results) => {
        connection.release();
        
        if (err) {
          console.error('Error fetching latest invoice ID:', err);
          return res.status(500).json({ error: 'Failed to fetch latest invoice ID' });
        }
        
        // If no invoices exist yet, start with 1 or your preferred starting number
        const latestId = results[0].latestId || 0;
        res.status(200).json({ invoiceId: latestId + 1 });
      }
    );
  });
});

app.post('/labour-invoice-summary', (req, res) => {
  const { customerName, invoiceDate, subtotal, cgst, sgst, totalDue, labourItems, invoiceId } = req.body;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Generate reference number (LAB + YYMM + random 4 digits)
    const referenceNumber = 'LAB' + 
      new Date().getFullYear().toString().slice(-2) + 
      (new Date().getMonth() + 1).toString().padStart(2, '0') + 
      Math.floor(1000 + Math.random() * 9000);

    // Insert into labour_invoice_summaries only
    connection.query(
      `INSERT INTO labour_invoice_summaries (
        reference_number, invoice_id, customer_name, invoice_date, 
        subtotal, cgst, sgst, total_due, labour_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        referenceNumber,
        invoiceId || null, // Use null if invoiceId is not provided
        customerName,
        invoiceDate,
        subtotal,
        cgst,
        sgst,
        totalDue,
        JSON.stringify(labourItems) // Store line items as JSON
      ],
      (err, result) => {
        connection.release(); // Always release connection
        
        if (err) {
          console.error('Error saving labour invoice summary:', err);
          return res.status(500).json({ error: 'Failed to save labour invoice summary' });
        }

        res.status(200).json({ 
          message: 'Labour invoice summary saved successfully',
          referenceNumber: referenceNumber,
          invoiceId: invoiceId || null // Return invoiceId if it exists
        });
      }
    );
  });
});

app.get('/search-labour-invoices', (req, res) => {
  const customerName = req.query.name || '';
  
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // First get the invoice headers
    connection.query(
      `SELECT 
        li.id,
        li.invoice_number,
        li.customer_name,
        li.customer_address,
        li.customer_contact,
        li.customer_email,
        li.vehicle_model,
        li.vehicle_reg_no,
        li.invoice_date,
        li.subtotal,
        li.cgst,
        li.sgst,
        li.grand_total AS total_due
      FROM labour_invoices li
      WHERE li.customer_name LIKE ?
      ORDER BY li.invoice_date DESC`,
      [`%${customerName}%`],
      (err, invoices) => {
        if (err) {
          connection.release();
          console.error('Error fetching labour invoices:', err);
          return res.status(500).json({ error: 'Failed to fetch invoices' });
        }

        if (invoices.length === 0) {
          connection.release();
          return res.json([]);
        }

        // Get items for each invoice
        const invoiceIds = invoices.map(inv => inv.id);
        connection.query(
          `SELECT 
            invoice_id,
            sno,
            description,
            tinkering,
            painting,
            electrician,
            mechanical,
            cgst,
            sgst,
            total
          FROM labour_invoice_items
          WHERE invoice_id IN (?)
          ORDER BY invoice_id, sno`,
          [invoiceIds],
          (err, items) => {
            connection.release();
            
            if (err) {
              console.error('Error fetching invoice items:', err);
              return res.status(500).json({ error: 'Failed to fetch invoice items' });
            }

            // Combine invoices with their items
            const invoicesWithItems = invoices.map(invoice => ({
              ...invoice,
              items: items.filter(item => item.invoice_id === invoice.id)
            }));

            res.json(invoicesWithItems);
          }
        );
      }
    );
  });
});



// Add this to your existing backend routes
app.get('/invoice-stats', (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Execute all stats queries in parallel
    connection.query(
      `SELECT 
        (SELECT COUNT(*) FROM invoice_summary) AS taxInvoiceCount,
        (SELECT COALESCE(SUM(total_due), 0) FROM invoice_summary) AS taxInvoiceRevenue,
        (SELECT COUNT(*) FROM estimate_summary) AS estimateInvoiceCount,
        (SELECT COALESCE(SUM(total_amount), 0) FROM estimate_summary) AS estimateInvoiceRevenue,
        (SELECT COUNT(*) FROM labour_invoice_summaries) AS labourInvoiceCount,
        (SELECT COALESCE(SUM(total_due), 0) FROM labour_invoice_summaries) AS labourInvoiceRevenue`,
      (err, results) => {
        connection.release();
        
        if (err) {
          console.error('Error fetching invoice stats:', err);
          return res.status(500).json({ error: 'Failed to fetch invoice stats' });
        }

        if (results.length === 0) {
          return res.json({
            taxInvoices: { count: 0, revenue: 0 },
            estimateInvoices: { count: 0, revenue: 0 },
            labourInvoices: { count: 0, revenue: 0 }
          });
        }

        res.json({
          taxInvoices: {
            count: results[0].taxInvoiceCount,
            revenue: parseFloat(results[0].taxInvoiceRevenue) || 0
          },
          estimateInvoices: {
            count: results[0].estimateInvoiceCount,
            revenue: parseFloat(results[0].estimateInvoiceRevenue) || 0
          },
          labourInvoices: {
            count: results[0].labourInvoiceCount,
            revenue: parseFloat(results[0].labourInvoiceRevenue) || 0
          }
        });
      }
    );
  });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
