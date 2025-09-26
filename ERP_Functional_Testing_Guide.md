# ERP System - Functional Testing Guide

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Test Environment Setup](#test-environment-setup)
4. [User Roles and Access](#user-roles-and-access)
5. [Test Scenarios](#test-scenarios)
6. [Detailed Test Cases](#detailed-test-cases)

---

## Introduction

This document provides comprehensive functional testing procedures for the ERP (Enterprise Resource Planning) system. It is designed for non-technical testers to validate all implemented features and ensure the system functions correctly.

### Purpose
- Verify all system functionalities work as expected
- Ensure proper user access control
- Validate business workflows
- Confirm data integrity across modules

### Scope
This guide covers testing for:
- User Authentication & Authorization
- Employee Management
- Project Management
- Material Request Forms (MRF)
- Inventory Management
- Purchase Order Management
- Reporting & Analytics
- Notifications & Approvals

---

## System Overview

The ERP system is a web-based application that integrates various business processes including:
- **Employee Management**: Track employee information, assignments, and working hours
- **Project Management**: Manage projects, budgets, and resource allocation
- **Procurement**: Handle material requests, inventory, and purchase orders
- **Financial Reporting**: Generate various financial and operational reports

### Key Features
- Role-based access control
- Multi-level approval workflows
- Real-time notifications
- Comprehensive reporting

---

## Test Environment Setup

### Prerequisites
1. Web browser (Chrome, Firefox, Edge, or Safari)
2. Test URL: `http://localhost:8080` (or provided test server URL)
3. Test credentials (provided separately)

### Initial Setup
1. Open web browser
2. Navigate to the test URL
3. Verify login page loads correctly

### Test Data
**Default Admin Account:**
- Username: `admin`
- Password: `password`

**Note**: Additional test accounts will be created during testing.

---

## User Roles and Access

The system has four distinct user roles, each with specific permissions:

### 1. SUPER ADMIN
- Full system access
- User management
- Approve all Material Request Forms
- View all pending approvals

### 2. ADMIN
- Approve Material Request Forms under 2,000 AED
- Access all financial reports
- View MRF approval dashboard

### 3. PROJECT MANAGER
- Create and manage projects
- Manage inventory
- Create purchase orders
- Submit material requests
- Assign employees to projects
- Track timesheets

### 4. HR MANAGER
- Manage employee records
- View employee assignments
- Access employee reports

---

## Test Scenarios

### Critical Business Flows

1. **Employee Onboarding Flow**
   - HR Manager creates new employee
   - Project Manager assigns employee to project
   - Employee time tracking begins

2. **Material Procurement Flow**
   - Project Manager creates Material Request Form
   - Admin/Super Admin approves MRF
   - Project Manager creates Purchase Order
   - Inventory updated upon delivery

3. **Project Lifecycle Flow**
   - Project Manager creates project
   - Assigns employees and inventory
   - Tracks time and expenses
   - Generates project reports

---

## Detailed Test Cases

### TC001: User Authentication

#### Test Case: Login with Valid Credentials
**Pre-conditions**: User has valid credentials
**Test Steps**:
1. Navigate to login page
2. Enter username: `admin`
3. Enter password: `password`
4. Click "Login" button

**Expected Results**:
- User successfully logs in
- Dashboard displays with appropriate role-based features
- Welcome message shows username

#### Test Case: Login with Invalid Credentials
**Pre-conditions**: Login page is accessible
**Test Steps**:
1. Navigate to login page
2. Enter username: `invalid`
3. Enter password: `wrong`
4. Click "Login" button

**Expected Results**:
- Login fails
- Error message displays: "Invalid username or password"
- User remains on login page

#### Test Case: Logout
**Pre-conditions**: User is logged in
**Test Steps**:
1. Click "Logout" button in navigation
2. Confirm logout action if prompted

**Expected Results**:
- User is logged out
- Redirected to login page
- Cannot access protected pages without logging in again

---

### TC002: User Management (Super Admin Only)

#### Test Case: Create New User
**Pre-conditions**: Logged in as Super Admin
**Test Steps**:
1. Navigate to Dashboard
2. Click "User Management" in Users section
3. Click "Create User" button
4. Fill in the form:
   - Username: `testuser1`
   - Password: `Test@1234`
   - Confirm Password: `Test@1234`
   - Role: Select "PROJECT MANAGER"
5. Click "Create User" button

**Expected Results**:
- Success message displays
- New user appears in user list
- Can login with new credentials

#### Test Case: Edit User
**Pre-conditions**: Test user exists
**Test Steps**:
1. In User Management page, find `testuser1`
2. Click "Edit" button
3. Change role to "HR MANAGER"
4. Click "Update User" button

**Expected Results**:
- Success message displays
- User role updated in list
- User has new permissions when logged in

#### Test Case: Delete User
**Pre-conditions**: Test user exists
**Test Steps**:
1. In User Management page, find `testuser1`
2. Click "Delete" button
3. Confirm deletion

**Expected Results**:
- Success message displays
- User removed from list
- Cannot login with deleted credentials

---

### TC003: Employee Management (HR Manager)

#### Test Case: Create Employee
**Pre-conditions**: Logged in as HR Manager
**Test Steps**:
1. Navigate to Dashboard
2. Click "Employee Management"
3. Click "Create Employee" button
4. Fill in the form:
   - Name: `John Doe`
   - Employee ID: `EMP001`
   - Passport ID: `P123456`
   - Emirates ID: `784-1234-5678901-2`
   - Phone Number: `+971501234567`
   - Joining Date: Select today's date
   - Salary: `5000`
   - Comments: `Test employee`
5. Click "Create" button

**Expected Results**:
- Success message displays
- Employee appears in list
- All details saved correctly

#### Test Case: Edit Employee
**Pre-conditions**: Employee EMP001 exists
**Test Steps**:
1. In Employee list, find employee EMP001
2. Click "Edit" button
3. Update:
   - Salary: `6000`
   - Comments: `Salary updated`
4. Click "Update" button

**Expected Results**:
- Success message displays
- Employee details updated
- Changes reflected in list

#### Test Case: Validate Unique Constraints
**Pre-conditions**: Employee EMP001 exists
**Test Steps**:
1. Try to create new employee with:
   - Different name but same Employee ID: `EMP001`
2. Click "Create" button

**Expected Results**:
- Error message displays
- Employee not created
- Indicates Employee ID must be unique

---

### TC004: Project Management (Project Manager)

#### Test Case: Create Project
**Pre-conditions**: Logged in as Project Manager
**Test Steps**:
1. Navigate to Dashboard
2. Click "Project Management"
3. Click "Create Project" button
4. Fill in the form:
   - Project Name: `Office Building A`
   - Description: `Construction of new office building`
   - Start Date: Today's date
   - End Date: 6 months from today
   - Budget: `100000`
   - Location: `Dubai`
   - Client: `ABC Corporation`
   - Stage: `PLANNING`
   - Type: `CONSTRUCTION`
   - Per Day Rate: `1000`
   - Per Hour Rate: `125`
5. Click "Create Project" button

**Expected Results**:
- Success message displays
- Project appears in project list
- Can view project details

#### Test Case: Assign Employee to Project
**Pre-conditions**: Project and employee exist
**Test Steps**:
1. In project list, click on "Office Building A"
2. Click "Assign Employees" button
3. Select employee from dropdown
4. Click "Assign" button

**Expected Results**:
- Success message displays
- Employee appears in project's assigned list
- Employee available for timesheet entry

#### Test Case: Enter Timesheet
**Pre-conditions**: Employee assigned to project
**Test Steps**:
1. Navigate to project details
2. Click "Timesheet" button
3. Select date
4. Enter hours for assigned employee: `8`
5. Click "Save" button

**Expected Results**:
- Success message displays
- Hours saved for employee
- Total expense updates based on hourly rate

---

### TC005: Material Request Form (MRF)

#### Test Case: Create MRF (Project Manager)
**Pre-conditions**: Logged in as Project Manager, project exists
**Test Steps**:
1. Navigate to Dashboard
2. Click "Material Request Form"
3. Click "Create MRF" button
4. Fill in the form:
   - Select Project: `Office Building A`
   - Add items:
     - Item 1: Description: `Cement`, Quantity: `100`, Unit: `Bags`, Unit Price: `25`
     - Item 2: Description: `Steel`, Quantity: `50`, Unit: `Tons`, Unit Price: `30`
   - Total automatically calculates: `4000 AED`
5. Click "Submit" button

**Expected Results**:
- Success message displays
- MRF created with status "PENDING"
- MRF appears in list
- Total amount calculated correctly

#### Test Case: Approve MRF as Admin (Under 2000 AED)
**Pre-conditions**: MRF under 2000 AED exists, logged in as Admin
**Test Steps**:
1. Navigate to "MRF Approval Dashboard"
2. Find MRF with amount less than 2000 AED
3. Review details
4. Click "Approve" button

**Expected Results**:
- Success message displays
- MRF status changes to "APPROVED"
- Removed from pending list

#### Test Case: Approve MRF as Super Admin (Over 2000 AED)
**Pre-conditions**: MRF over 2000 AED exists, logged in as Super Admin
**Test Steps**:
1. Navigate to "Approval Pending"
2. Find MRF with amount over 2000 AED
3. Review details
4. Click "Approve" button

**Expected Results**:
- Success message displays
- MRF status changes to "APPROVED"
- Removed from pending list

#### Test Case: Reject MRF
**Pre-conditions**: Pending MRF exists, logged in as approver
**Test Steps**:
1. Navigate to approval dashboard
2. Find pending MRF
3. Click "Reject" button
4. Enter rejection reason (if prompted)

**Expected Results**:
- Success message displays
- MRF status changes to "REJECTED"
- Removed from pending list

---

### TC006: Inventory Management (Project Manager)

#### Test Case: Create Inventory Item
**Pre-conditions**: Logged in as Project Manager
**Test Steps**:
1. Navigate to Dashboard
2. Click "Inventory Management"
3. Click "Add Inventory" button
4. Fill in the form:
   - Item Name: `Safety Helmet`
   - Description: `Yellow safety helmet`
   - Quantity: `50`
   - Unit: `Pieces`
   - Unit Price: `25`
   - Category: `SAFETY`
5. Click "Submit Create Request" button

**Expected Results**:
- Create request submitted
- Request pending approval
- Shows in "My Requests" list

#### Test Case: Approve Inventory Request (Super Admin)
**Pre-conditions**: Inventory request exists, logged in as Super Admin
**Test Steps**:
1. Navigate to inventory requests
2. Find pending create request
3. Review details
4. Click "Approve" button

**Expected Results**:
- Success message displays
- Inventory item created
- Appears in main inventory list

#### Test Case: Update Inventory
**Pre-conditions**: Inventory item exists
**Test Steps**:
1. In inventory list, find item
2. Click "Edit" button
3. Update quantity: `75`
4. Click "Submit Update Request"

**Expected Results**:
- Update request submitted
- Pending approval
- Original item unchanged until approved

---

### TC007: Purchase Order Management

#### Test Case: Create Purchase Order
**Pre-conditions**: Logged in as Project Manager, project exists
**Test Steps**:
1. Navigate to Dashboard
2. Click "Purchase Order Management"
3. Click "Create Purchase Order" button
4. Fill in the form:
   - Select Project: `Office Building A`
   - Supplier Name: `ABC Suppliers`
   - Supplier Email: `supplier@abc.com`
   - Supplier Phone: `+971501234567`
   - Expected Delivery: 14 days from today
   - Payment Terms: `NET 30`
   - Add items:
     - Item: `Cement`, Quantity: `100`, Unit Price: `25`
     - Item: `Steel`, Quantity: `50`, Unit Price: `30`
5. Click "Create" button

**Expected Results**:
- Success message displays
- PO created with status "CREATED"
- PO number generated automatically
- Total amount calculated correctly

#### Test Case: Update PO Status
**Pre-conditions**: Purchase Order exists
**Test Steps**:
1. In PO list, find created PO
2. Click on PO to view details
3. Click "Update Status" button
4. Select new status: `SENT_TO_SUPPLIER`
5. Click "Update" button

**Expected Results**:
- Success message displays
- Status updated in list
- Status history maintained

#### Test Case: Delete Purchase Order
**Pre-conditions**: PO with status "CREATED" exists
**Test Steps**:
1. In PO list, find PO with "CREATED" status
2. Click "Delete" button
3. Confirm deletion

**Expected Results**:
- Success message displays
- PO removed from list
- Cannot delete PO with status other than "CREATED"

---

### TC008: Reporting (Admin)

#### Test Case: Generate Cash Flow Report
**Pre-conditions**: Logged in as Admin, project data exists
**Test Steps**:
1. Navigate to Dashboard
2. Click "Reports" → "Cash Flow Report"
3. Select date range:
   - Start Date: 1 month ago
   - End Date: Today
4. Click "Generate Report" button

**Expected Results**:
- Report displays with:
  - Project-wise cash flow
  - Total inflow and outflow
  - Net cash flow
- Can drill down to project details

#### Test Case: Generate Employee Hours Report
**Pre-conditions**: Timesheet data exists
**Test Steps**:
1. Navigate to "Reports" → "Employee Hours Report"
2. Select date range
3. Click "Generate Report" button

**Expected Results**:
- Report displays:
  - Employee-wise hours
  - Project distribution
  - Total hours summary

#### Test Case: Generate Project Breakdown Report
**Pre-conditions**: Project with expenses exists
**Test Steps**:
1. Navigate to "Reports" → "Project Breakdown"
2. Select project from dropdown
3. Click "Generate Report" button

**Expected Results**:
- Report displays:
  - Budget vs actual
  - Expense categories
  - Resource utilization

---

### TC009: Notifications

#### Test Case: Receive Notification
**Pre-conditions**: User has pending notifications
**Test Steps**:
1. Login to system
2. Check notification icon/badge
3. Click on notifications

**Expected Results**:
- Notification count displays
- List of notifications shown
- Can mark as read

---

## Test Execution Guidelines

### Best Practices
1. **Test Data Management**
   - Create unique test data for each session
   - Document all test data created
   - Clean up test data after testing

2. **Issue Reporting**
   - Screenshot any errors
   - Note exact steps to reproduce
   - Include user role and test data used

3. **Test Coverage**
   - Test all positive scenarios first
   - Then test negative scenarios
   - Verify role-based restrictions

### Common Validation Points
1. **Form Validations**
   - Required fields cannot be empty
   - Numeric fields accept only numbers
   - Date fields have proper format
   - Email fields validate format

2. **Business Rules**
   - Unique constraints (Employee ID, Passport, etc.)
   - Approval thresholds (MRF 2000 AED limit)
   - Status transitions (PO status flow)
   - Role-based access restrictions

3. **Data Integrity**
   - Calculations are accurate (totals, expenses)
   - Relationships maintained (project-employee)
   - Historical data preserved
   - Concurrent user updates handled

---

## Appendix

### A. Status Values

**MRF Status:**
- PENDING
- APPROVED
- REJECTED

**Purchase Order Status:**
- CREATED
- SENT_TO_SUPPLIER
- SUPPLIER_ACCEPTED
- SUPPLIER_REJECTED
- IN_PRODUCTION
- SHIPPED
- DELIVERED
- COMPLETED
- CANCELLED

**Project Stages:**
- PLANNING
- IN_PROGRESS
- COMPLETED
- ON_HOLD
- CANCELLED

### B. Error Messages Reference

Common error messages and their meanings:
- "Invalid username or password" - Login credentials incorrect
- "Session expired" - Need to login again
- "Access denied" - User lacks permission for this action
- "Duplicate entry" - Unique constraint violation
- "Required field" - Mandatory field is empty

### C. Troubleshooting

**Cannot Login:**
1. Verify credentials are correct
2. Check CAPS LOCK is off
3. Clear browser cache
4. Try different browser

**Features Not Visible:**
1. Verify logged in with correct role
2. Refresh the page
3. Logout and login again

**Data Not Saving:**
1. Check all required fields filled
2. Verify data format is correct
3. Check for error messages
4. Verify user has permission

---

## Test Sign-off

| Test Phase | Tester Name | Date | Status | Comments |
|------------|-------------|------|---------|----------|
| Authentication | | | | |
| User Management | | | | |
| Employee Management | | | | |
| Project Management | | | | |
| MRF | | | | |
| Inventory | | | | |
| Purchase Orders | | | | |
| Reports | | | | |

**Overall Test Result:** ☐ PASS ☐ FAIL

**Tested By:** _______________________

**Date:** _______________________

**Approved By:** _______________________