# U TECH CRM Backend — Product Overview

## Purpose
REST API backend for the U TECH CRM system — a customer relationship management platform designed to manage leads, customers, quotations, work orders, and multi-channel communication (WhatsApp, SMS, Email).

## Key Features
- **Authentication & Authorization**: JWT-based login with role-based access control (RBAC)
- **Lead Management**: Create, track, and convert leads through the sales pipeline
- **Customer Management**: Full customer lifecycle management with contact masking for privacy
- **Quotation Engine**: Generate PDF quotations with line items, pricing, and delivery details
- **Work Order Management**: Track work orders from creation to completion
- **AI Engine**: OpenAI-powered assistant for CRM insights and automation
- **Multi-channel Notifications**: WhatsApp (webhook), SMS (Twilio), Email (Nodemailer)
- **File Uploads**: Multer-based file handling for attachments
- **Audit Logging**: Tracks user actions across entities
- **Payment Integration**: Razorpay payment gateway support
- **Health & Diagnostics**: DB health checks and diagnostic scripts

## Target Users
- Sales teams managing leads and customers
- Operations teams handling work orders
- Admins overseeing the full CRM workflow

## Core API Endpoints
| Endpoint | Purpose |
|---|---|
| `/api/auth` | Login, register, token management |
| `/api/leads` | Lead CRUD and pipeline management |
| `/api/customers` | Customer CRUD |
| `/api/quotations` | Quotation creation and PDF generation |
| `/api/work-orders` | Work order lifecycle |
| `/api/webhooks/whatsapp` | Inbound WhatsApp message handling |
| `/api/health` | System and DB health status |
| `/health` | Simple liveness probe |
