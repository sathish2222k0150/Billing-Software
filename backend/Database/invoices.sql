CREATE TABLE service_invoice_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    part_no VARCHAR(50) NOT NULL,
    hsn_sac VARCHAR(50) NOT NULL,
    vehicle VARCHAR(100) NOT NULL,
    part_description TEXT NOT NULL,
    qty INT NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    cgst DECIMAL(5,2) NOT NULL,
    sgst DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES service_invoices(id) ON DELETE CASCADE
);
