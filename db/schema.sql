-- Carbon Credit Trading and Tracking System Schema
-- Ensure InnoDB for foreign keys

CREATE TABLE Company (
  company_id INT PRIMARY KEY,
  name VARCHAR(100),
  industry_type VARCHAR(50),
  emission_limit DECIMAL(10,2),
  current_emission DECIMAL(10,2)
) ENGINE=InnoDB;


CREATE TABLE CarbonCredit (
  credit_id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT,
  credit_amount DECIMAL(10,2),
  expiry_date DATE,
  FOREIGN KEY (company_id) REFERENCES Company(company_id)
) ENGINE=InnoDB;

CREATE TABLE `Transaction` (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT,
  buyer_id INT,
  credits_sold DECIMAL(10,2),
  price DECIMAL(10,2),
  date DATE,
  FOREIGN KEY (seller_id) REFERENCES Company(company_id),
  FOREIGN KEY (buyer_id) REFERENCES Company(company_id)
) ENGINE=InnoDB;

CREATE TABLE Penalty (
  penalty_id INT PRIMARY KEY,
  company_id INT,
  reason VARCHAR(255),
  amount DECIMAL(10,2),
  date DATE,
  FOREIGN KEY (company_id) REFERENCES Company(company_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ManualReport (
  report_id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  remaining_credits DECIMAL(10,2) NOT NULL,
  credits_bought DECIMAL(10,2) NOT NULL,
  penalty_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES Company(company_id)
) ENGINE=InnoDB;

-- Basic user accounts for login/signup
