# Security Workforce Management Platform - Data Schema

This document outlines the data structures and relationships used within the SecureGuard Command platform. The system is designed for multi-tenant SaaS operations, ensuring strict isolation between security companies.

## 1. Core Entities

### Guard (Workforce)
Represents a security officer in the field.
- `id`: Unique identifier (e.g., GRD-001)
- `name`: Full name
- `email`: Professional email
- `status`: Active, On Break, Off Duty, Suspended
- `complianceStatus`: Compliant, Expiring Soon, Non-Compliant
- `currentSiteId`: Reference to current Site
- `licenceExpiry`: ISO timestamp for SIA/Registry expiry
- `docsMissing`: Count of missing mandatory documents
- `performanceScore`: Numerical rating (0-100)

### Site (Client Location)
Represents a contracted location being secured.
- `id`: Unique identifier (e.g., SITE-001)
- `name`: Site name
- `clientId`: Reference to Client
- `address`: Physical location
- `riskLevel`: Low, Medium, High, Critical
- `activeGuardsCount`: Number of guards currently clocked in
- `healthScore`: Operational efficiency rating

### Incident (Operational Reporting)
Represents a security event reported from the field.
- `id`: Unique identifier (e.g., INC-2024-001)
- `siteId`: Reference to Site
- `guardId`: Reference to Guard (reporter)
- `type`: Intrusion, Fire, Vandalism, Medical, etc.
- `severity`: Low, Medium, High, Critical
- `status`: Open, In Progress, Resolved, Archived
- `description`: Detailed text report
- `timestamp`: Event time

## 2. Logistics & Operations

### Shift (Scheduling)
- `id`: Unique identifier
- `siteId`: Reference to Site
- `guardId`: Reference to Guard (if assigned)
- `startTime` / `endTime`: ISO timestamps
- `status`: Published, Open, Claimed, In Progress, Completed
- `priority`: Routine, Urgent, STAT

### Vehicle (Fleet)
- `id`: Asset ID
- `model`: Vehicle type
- `plate`: License plate
- `status`: Active, Maintenance, Available
- `fuelLevel`: Percentage (0-100)
- `nextService`: ISO date

### Visitor (Access Control)
- `id`: Visitor ID
- `name`: Full name
- `company`: Representing company
- `siteName`: Destination site
- `status`: Expected, Checked In, Checked Out

## 3. Business & HR

### Applicant (Recruitment)
- `id`: Application ID
- `name`: Candidate name
- `role`: Target position
- `status`: Applied, Interview, Background Check, Hired, Rejected

### PayrollRecord
- `id`: Transaction ID
- `guardName`: Reference to Guard
- `hours`: Total approved hours
- `amount`: Gross pay calculation
- `status`: Pending, Approved, Paid

### Invoice
- `id`: Billing ID
- `clientName`: Reference to Client
- `amount`: Total billable amount
- `status`: Paid, Pending, Overdue

## 4. System Configuration

### FormDefinition (Dynamic Builder)
- `id`: Schema ID
- `name`: Form type (e.g., Hazard Identification)
- `fields`: Field count
- `status`: Active, Draft

## 5. Communications

### Message (Unified Inbox)
- `id`: Message ID
- `senderName`: Source entity
- `preview`: Text snippet
- `timestamp`: Sent time
- `type`: WhatsApp, SMS, Internal
