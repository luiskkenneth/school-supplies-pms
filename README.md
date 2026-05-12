# Hope, Inc. Product Management System (HopePMS)
> **A Security-First Inventory & Price Tracking Solution for Hope, Inc.**

---

## 🌐 Live Prototype
Access the deployed application here:
**(https://hopedb-pms.vercel.app)**

---

## 📝 Project Overview
The **Hope, Inc. Product Management System (HopePMS)** is a specialized web-based solution designed to centralize and automate the lifecycle management of retail products and historical price tracking. It replaces traditional inventory methods with a robust framework that utilizes **Row-Level Security (RLS)** and a strict **"soft-delete"** policy to ensure data integrity and auditability.

---

## ✨ Key Features

### 🛡️ For Superadmins
* **Dynamic Rights Management:** Real-time toggling of user permissions (Grant/Revoke access) via the Admin Dashboard.
* **System Audit:** Visibility into all active and inactive records across the platform.
* **User Monitoring:** Automated tracking of all accounts that have accessed the system.

### 📦 For Staff & Inventory Managers
* **Product Inventory:** Real-time management of school supplies with detailed categorization.
* **Historical Price Tracking:** Automatic logging of price changes in the `pricehist` table to monitor market trends.
* **Soft-Delete Architecture:** Records are flagged as inactive instead of being permanently removed to preserve audit trails.
* **Secure Authentication:** Integrated with Supabase Auth for protected access.

---

## 💻 Technical Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Lucide Icons |
| **Backend/Auth** | Supabase Auth (OAuth 2.0 / Email-Pass) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Deployment** | Vercel |
| **Database Logic** | SQL Triggers, Functions, and Soft-delete Policies |

---

## ⚙️ System Workflow
1. **Authentication:** Users log in via protected routes; credentials are validated against Supabase Auth.
2. **Authorization:** The system checks the `user_rights` table to determine if the user is a Staff or Superadmin.
3. **Data Management:** Users can add or edit products; any price change automatically triggers a new record in the `pricehist` table.
4. **Soft-Delete:** Deleting a record updates the `record_status` to 'DELETED' instead of a physical row removal.
5. **Real-time Sync:** The dashboard reflects inventory and user permission changes instantly using PostgreSQL Listeners.

---

## 👥 Development Team
* **DIAZ, Kay Elaine**
* **FAJARDO, Luis Kenneth**
* **FETALVO, Romeo Felipe**
* **PEREZ, Cassandra Jade Aliyah**

**Course:** 2 BSIT-5 | Group 5  
**School:** New Era University - College of Informatics and Computing Studies  
**Professor:** Prof. Jeremias C. Esperanza  
**Status:** Information Management Project (2026)

---
