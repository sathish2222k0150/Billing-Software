CREATE TABLE parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(50),
    part_no VARCHAR(50),
    hsn_sac VARCHAR(50),
    vehicle VARCHAR(100),
    part_description TEXT,
    qty INT,
    mrp DECIMAL(10,2),
    rate DECIMAL(10,2),
    value DECIMAL(10,2),
    cgst DECIMAL(5,2),
    sgst DECIMAL(5,2)
);
