CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO expenses (description, category, amount, expense_date) VALUES
('Lunch at canteen', 'Food', 85.00, CURDATE()),
('Jeepney fare', 'Transport', 24.00, CURDATE()),
('Printing activity sheets', 'School', 60.00, CURDATE()),
('Internet load', 'Bills', 150.00, CURDATE());
