CREATE TABLE invoice_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  invoice_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  cgst DECIMAL(10,2) NOT NULL,
  sgst DECIMAL(10,2) NOT NULL,
  total_due DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
