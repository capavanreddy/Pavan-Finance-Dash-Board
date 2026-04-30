# 🔑 Admin Master Guide

This guide is intended exclusively for **System Administrators**. It covers the advanced configuration, logic, and management tools available in the **Control Center**.

---

## 1. The Control Center Overview
Access the Control Center via the top-right button. This is where the core "Brain" of FinPulse is managed.

### Key Sections:
1.  **User Management**: Approve new registrations, assign departments, and reset passwords.
2.  **Master Data**: Manage the dropdown values used across the site (Entities, Departments, Task Types).
3.  **Matrix Module**: The most powerful section for granular control.
4.  **Bulk Import**: Upload tasks, recurring rules, and payments in bulk via Excel.

---

## 2. Deep Dive: Matrix Modules
FinPulse uses a 4-Layer Matrix system to control everything.

### Matrix A: Module Access
*   **Purpose**: Controls which departments can see which buttons on the sidebar.
*   **Logic**: If "Operations" is not checked for "Payments," no user in the Operations department will even see the Payments button.

### Matrix B: Request Allocation
*   **Purpose**: Defines who the "Gatekeepers" are.
*   **Logic**: When an external request comes in (e.g., for "Accounts Payable"), only the "Authorized Allocators" listed here can assign that request to a team member.

### Matrix C: Entity Controls
*   **Purpose**: Multi-entity security.
*   **Logic**: Controls which users can see data for which legal entities (e.g., "Intellicar-BLR" vs "Intellicar-SNG").
*   **Special**: The "Consolidated (ALL)" column gives a user access to every entity in one click.

### User Module Controls (Matrix D)
*   **Purpose**: Individual overrides.
*   **Logic**: Even if a department has access to a module, you can revoke or grant access to specific users here.
*   **Feature**: Use the "Department Filter" to find all users in a specific team quickly.

---

## 3. Recurring Task Logic
How the system automates work:
1.  **Frequency Engine**: Supports D (Daily), W (Weekly), M (Monthly), Q (Quarterly), H (Half-Yearly), Y (Yearly), 2Y (Bi-Yearly).
2.  **Day Offset**: For monthly tasks, set the "Day Offset" (e.g., Day 7) to automatically set the due date.
3.  **Excluded Dates**: If a specific month is not needed for a rule, use the "Dismiss" button in the Staging area.
4.  **Generation**: The system looks ahead 30 days by default to prepare "Pending Conversions."

---

## 4. Payment Tracker Logic
*   **Status Calculation**:
    *   **Overdue**: Due date is in the past and "Mark Paid" hasn't been clicked.
    *   **Due Today**: Exactly matching the current date.
    *   **On Hold**: Payment is paused for a specific reason.
*   **Edit Requests**: If a user makes a mistake on a payment entry, they must submit an "Edit Request," which appears in the Admin's "Edit Request" tab for approval.

---

## 5. System Maintenance
*   **Master Data Cleanup**: Periodically check the "Master Data" tab to remove obsolete vendors or entities.
*   **Backups**: All data is pushed to two separate GitHub repositories (Main & Backup) for redundancy.

---

*Confidential - Admin Eyes Only*
