USE utech_crm;

-- Seed Sequence Counters
INSERT INTO sequence_counters (name, val) VALUES
('LEAD', 2),
('CUST', 2),
('QUOT', 2),
('PI', 2),
('WO', 2),
('AMC', 2),
('NOC', 2);

-- Seed Users with bcrypt hash of 'utech@123': $2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e
INSERT INTO users (name, email, password_hash, role, status) VALUES
('CRM Admin', 'admin@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Admin', 'ACTIVE'),
('Sales Manager', 'manager@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Sales Manager', 'ACTIVE'),
('Sales Exec One', 'exec1@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Sales Executive', 'ACTIVE'),
('Sales Exec Two', 'exec2@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Sales Executive', 'ACTIVE'),
('Sales Exec Three', 'exec3@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Sales Executive', 'ACTIVE'),
('Technician One', 'tech1@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Technician', 'ACTIVE'),
('Technician Two', 'tech2@utech.com', '$2a$10$tZ2R86.F2w793T90fHw7a.Z3n6mN3Rpx8z5V0P4V.v/jXkX9jD9.e', 'Technician', 'ACTIVE');

-- Seed Products
INSERT INTO products (product_code, name, description, price, gst_percent, stock_qty) VALUES
('PRD-FIRE-001', 'Co2 Fire Extinguisher 4.5kg', 'Carbon Dioxide fire extinguisher for electrical fires', 4500.00, 18.00, 50),
('PRD-FIRE-002', 'ABC Dry Powder Extinguisher 6kg', 'Multi-purpose dry chemical powder extinguisher', 2800.00, 18.00, 100),
('PRD-SMK-003', 'Photoelectric Smoke Detector', 'Ceiling mounted wireless smoke alarm sensor', 1200.00, 18.00, 200),
('PRD-SPR-004', 'Automatic Fire Sprinkler Head', '68°C glass bulb standard response sprinkler', 350.00, 18.00, 500);

-- Seed Leads
INSERT INTO leads (lead_code, name, email, mobile, source, score, status, assigned_to, budget, requirement) VALUES
('LEAD-000001', 'John Doe - Hotel Plaza', 'johndoe@plaza.com', '9876543210', 'Meta Ads', 75, 'CONTACTED', 3, 50000.00, 'Requires full fire safety audit and new Co2 extinguishers installed.'),
('LEAD-000002', 'Alice Smith - Tech Park', 'alice@techpark.com', '9876543211', 'Google Ads', 90, 'QUALIFIED', 4, 150000.00, 'Requires fire alarm system design and NOC certification consultation.');

-- Seed Customers
INSERT INTO customers (customer_code, company_name, contact_person, mobile, email, address, lead_id) VALUES
('CUST-000001', 'Acme Corp', 'Robert Downey', '9812345678', 'robert@acmecorp.com', 'Plot 45, Sector 18, Gurugram, HR', 1),
('CUST-000002', 'Global Tech Solutions', 'Jane Watson', '9812345679', 'jane@globaltech.com', 'Tower B, Cyber City, Gurugram, HR', 2);

-- Seed Quotations
INSERT INTO quotations (quotation_no, customer_id, lead_id, quotation_date, subtotal, gst_amount, total_amount, status, created_by) VALUES
('QUOT-000001', 1, 1, '2026-06-15', 7300.00, 1314.00, 8614.00, 'ACCEPTED', 3),
('QUOT-000002', 2, 2, '2026-06-18', 11800.00, 2124.00, 13924.00, 'SENT', 4);

-- Seed Quotation Items
INSERT INTO quotation_items (quotation_id, product_id, product_name, qty, unit_price, gst_percent, total) VALUES
(1, 1, 'Co2 Fire Extinguisher 4.5kg', 1, 4500.00, 18.00, 5310.00),
(1, 2, 'ABC Dry Powder Extinguisher 6kg', 1, 2800.00, 18.00, 3304.00),
(2, 3, 'Photoelectric Smoke Detector', 5, 1200.00, 18.00, 7080.00),
(2, 4, 'Automatic Fire Sprinkler Head', 16, 300.00, 18.00, 5664.00);

-- Seed Proforma Invoices
INSERT INTO proforma_invoices (pi_no, quotation_id, customer_id, pi_date, subtotal, gst_amount, total_amount, status, created_by) VALUES
('PI-000001', 1, 1, '2026-06-16', 7300.00, 1314.00, 8614.00, 'PAID', 3);

-- Seed Proforma Invoice Items
INSERT INTO proforma_invoice_items (pi_id, product_id, product_name, qty, unit_price, gst_percent, total) VALUES
(1, 1, 'Co2 Fire Extinguisher 4.5kg', 1, 4500.00, 18.00, 5310.00),
(1, 2, 'ABC Dry Powder Extinguisher 6kg', 1, 2800.00, 18.00, 3304.00);

-- Seed Work Orders
INSERT INTO work_orders (work_order_no, quotation_id, customer_id, work_order_date, total_amount, status, assigned_to, created_by) VALUES
('WO-000001', 1, 1, '2026-06-17', 8614.00, 'IN_PROGRESS', 6, 3);

-- Seed Work Order Items
INSERT INTO work_order_items (work_order_id, product_id, product_name, qty, description) VALUES
(1, 1, 'Co2 Fire Extinguisher 4.5kg', 1, 'Install in server room'),
(1, 2, 'ABC Dry Powder Extinguisher 6kg', 1, 'Install near main entrance');

-- Seed Work Order Tasks
INSERT INTO work_order_tasks (work_order_id, task_name, is_completed) VALUES
(1, 'Mount CO2 extinguisher in server room', 1),
(1, 'Mount ABC powder extinguisher at reception', 0),
(1, 'Conduct demo/training for office staff', 0);

-- Seed Follow-ups
INSERT INTO follow_ups (lead_id, customer_id, follow_up_date, notes, status, created_by) VALUES
(1, NULL, '2026-06-25 11:00:00', 'Follow up on remaining installation items', 'PENDING', 3),
(2, NULL, '2026-06-20 15:30:00', 'Discuss quotation pricing with Alice', 'PENDING', 4);

-- Seed Activities
INSERT INTO activities (lead_id, customer_id, user_id, activity_type, notes) VALUES
(1, NULL, 3, 'LEAD_CREATED', 'Lead registered from Meta Ads.'),
(1, NULL, 3, 'LEAD_ASSIGNED', 'Lead assigned to Sales Exec One.'),
(2, NULL, 4, 'LEAD_CREATED', 'Lead registered from Google Ads.'),
(2, NULL, 4, 'LEAD_ASSIGNED', 'Lead assigned to Sales Exec Two.');

-- Seed Site Visits
INSERT INTO site_visits (lead_id, customer_id, visit_date, purpose, status, assigned_to, gps_latitude, gps_longitude, notes, created_by) VALUES
(1, NULL, '2026-06-14 10:00:00', 'Initial measurement & risk assessment', 'COMPLETED', 3, 28.459497, 77.026638, 'Requires 2 extinguishers in total.', 3);

-- Seed Site Visit Photos
INSERT INTO site_visit_photos (site_visit_id, photo_url) VALUES
(1, '/uploads/site_visit_1_a.jpg');

-- Seed Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('company_name', 'U TECH FIRE & SAFETY SYSTEMS'),
('company_address', 'Office 102, Ground Floor, Sector 4, Gurugram, Haryana, 122001'),
('company_email', 'info@utech.com'),
('company_phone', '+91 98765 43210'),
('gst_no', '07AAAAA1111A1Z1'),
('whatsapp_bot_enabled', 'true'),
('lead_escalation_days', '3');

-- Seed AMC Contracts
INSERT INTO amc_contracts (contract_no, customer_id, start_date, end_date, amount, visit_frequency, status, created_by) VALUES
('AMC-000001', 1, '2026-06-01', '2027-05-31', 12000.00, 'QUARTERLY', 'ACTIVE', 1);

-- Seed AMC Visits
INSERT INTO amc_visits (amc_contract_id, scheduled_date, status, assigned_to) VALUES
(1, '2026-09-01', 'SCHEDULED', 6),
(1, '2026-12-01', 'SCHEDULED', 6),
(1, '2027-03-01', 'SCHEDULED', 6),
(1, '2027-05-25', 'SCHEDULED', 6);

-- Seed NOC Projects
INSERT INTO noc_projects (project_no, customer_id, building_name, status, start_date, target_date, assigned_to, current_stage, notes, created_by) VALUES
('NOC-000001', 2, 'Tower A Tech Park', 'APPLICATION', '2026-06-19', '2026-09-19', 4, 'Documents Collection', 'Collecting architectural maps and fire safety layout plan.', 1);

-- Seed Inventory Transactions
INSERT INTO inventory_transactions (product_id, transaction_type, qty, remarks, reference_no, created_by) VALUES
(1, 'IN', 50, 'Initial procurement stock', 'PO-0001', 1),
(2, 'IN', 100, 'Initial procurement stock', 'PO-0001', 1),
(3, 'IN', 200, 'Initial procurement stock', 'PO-0002', 1),
(4, 'IN', 500, 'Initial procurement stock', 'PO-0002', 1);
