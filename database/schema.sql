-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS noc_projects;
DROP TABLE IF EXISTS amc_visits;
DROP TABLE IF EXISTS amc_contracts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS site_visit_photos;
DROP TABLE IF EXISTS site_visits;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS follow_ups;
DROP TABLE IF EXISTS work_order_tasks;
DROP TABLE IF EXISTS work_order_items;
DROP TABLE IF EXISTS work_orders;
DROP TABLE IF EXISTS proforma_invoice_items;
DROP TABLE IF EXISTS proforma_invoices;
DROP TABLE IF EXISTS quotation_items;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sequence_counters;

-- 1. Sequence Counters (for transaction-safe unique document number generation)
CREATE TABLE sequence_counters (
  name VARCHAR(50) PRIMARY KEY,
  val BIGINT NOT NULL
);

-- 2. Users Table
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- Super Admin, Admin, Sales Manager, Sales Executive, Technician
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. Leads Table
CREATE TABLE leads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lead_code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  mobile VARCHAR(20) NOT NULL,
  source VARCHAR(100) NULL,
  score INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED
  assigned_to BIGINT NULL,
  budget DECIMAL(12,2) DEFAULT 0,
  requirement TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_leads_code ON leads(lead_code);
CREATE INDEX idx_leads_mobile ON leads(mobile);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

-- 4. Customers Table
CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_code VARCHAR(30) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  address TEXT NULL,
  lead_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_mobile ON customers(mobile);

-- 5. Products Table
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  stock_qty INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_code ON products(product_code);

-- 6. Quotations Table
CREATE TABLE quotations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quotation_no VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT NULL,
  lead_id BIGINT NULL,
  quotation_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_quotations_no ON quotations(quotation_no);
CREATE INDEX idx_quotations_status ON quotations(status);

-- 7. Quotation Items Table
CREATE TABLE quotation_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quotation_id BIGINT NOT NULL,
  product_id BIGINT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
CREATE INDEX idx_qitems_quotation ON quotation_items(quotation_id);

-- 8. Proforma Invoices Table
CREATE TABLE proforma_invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  pi_no VARCHAR(50) UNIQUE NOT NULL,
  quotation_id BIGINT NULL,
  customer_id BIGINT NULL,
  pi_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SENT, PAID, PARTIALLY_PAID, CANCELLED
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_pi_no ON proforma_invoices(pi_no);

-- 9. Proforma Invoice Items Table
CREATE TABLE proforma_invoice_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  pi_id BIGINT NOT NULL,
  product_id BIGINT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (pi_id) REFERENCES proforma_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
CREATE INDEX idx_piitems_pi ON proforma_invoice_items(pi_id);

-- 10. Work Orders Table
CREATE TABLE work_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  work_order_no VARCHAR(50) UNIQUE NOT NULL,
  quotation_id BIGINT NULL,
  customer_id BIGINT NULL,
  work_order_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, COMPLETED, CANCELLED
  assigned_to BIGINT NULL, -- Technician or Sales Exec
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_wo_no ON work_orders(work_order_no);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_assigned ON work_orders(assigned_to);

-- 11. Work Order Items Table
CREATE TABLE work_order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  work_order_id BIGINT NOT NULL,
  product_id BIGINT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  description TEXT NULL,
  FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 12. Work Order Tasks Table (Checklist)
CREATE TABLE work_order_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  work_order_id BIGINT NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  completed_by BIGINT NULL,
  FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. Follow Ups Table
CREATE TABLE follow_ups (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT NULL,
  customer_id BIGINT NULL,
  follow_up_date DATETIME NOT NULL,
  notes TEXT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, MISSED
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_followups_date ON follow_ups(follow_up_date);
CREATE INDEX idx_followups_status ON follow_ups(status);

-- 14. Activities Table (Lead/Customer Timeline)
CREATE TABLE activities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT NULL,
  customer_id BIGINT NULL,
  user_id BIGINT NULL,
  activity_type VARCHAR(100) NOT NULL, -- LEAD_CREATED, LEAD_ASSIGNED, STAGE_CHANGE, NOTE_ADDED, etc.
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_customer ON activities(customer_id);

-- 15. Site Visits Table
CREATE TABLE site_visits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT NULL,
  customer_id BIGINT NULL,
  visit_date DATETIME NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
  assigned_to BIGINT NULL,
  gps_latitude DECIMAL(10,8) NULL,
  gps_longitude DECIMAL(11,8) NULL,
  notes TEXT NULL,
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_visits_date ON site_visits(visit_date);
CREATE INDEX idx_visits_assigned ON site_visits(assigned_to);

-- 16. Site Visit Photos Table
CREATE TABLE site_visit_photos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  site_visit_id BIGINT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_visit_id) REFERENCES site_visits(id) ON DELETE CASCADE
);

-- 17. Audit Logs Table
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  module_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  record_id BIGINT NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 18. Notifications Table
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- 19. Settings Table
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 20. AMC Contracts Table
CREATE TABLE amc_contracts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_no VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  visit_frequency VARCHAR(50) NOT NULL, -- MONTHLY, QUARTERLY, BI-ANNUALLY, ANNUALLY
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_amc_no ON amc_contracts(contract_no);

-- 21. AMC Visits Table
CREATE TABLE amc_visits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  amc_contract_id BIGINT NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_date DATE NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, MISSED
  assigned_to BIGINT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (amc_contract_id) REFERENCES amc_contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- 22. NOC Projects Table (Fire NOC Tracking)
CREATE TABLE noc_projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_no VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT NOT NULL,
  building_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'APPLICATION', -- APPLICATION, INSPECTION, DEVIATION_REMEDY, NOC_OBTAINED, REJECTED
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  completed_date DATE NULL,
  assigned_to BIGINT NULL,
  current_stage VARCHAR(100) DEFAULT 'Documents Collection', -- Documents Collection, Liaisoning, Site Correction, Final Inspection
  notes TEXT NULL,
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_noc_no ON noc_projects(project_no);

-- 23. Inventory Transactions Table
CREATE TABLE inventory_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- IN, OUT, ADJUSTMENT
  qty INT NOT NULL,
  remarks TEXT NULL,
  reference_no VARCHAR(100) NULL, -- Work Order no, PO no, etc.
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_inv_product ON inventory_transactions(product_id);
