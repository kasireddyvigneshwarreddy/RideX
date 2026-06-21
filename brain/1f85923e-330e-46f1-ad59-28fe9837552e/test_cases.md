# Functional Test Cases Specification
## Help Desk Ticketing and Reporting System

This document contains 30 functional test cases designed to validate the core features, data constraints, security thresholds, and reporting engines of the Help Desk Ticketing and Reporting System.

---

## 1. Test Execution Guidelines

* **Test Environment:** Sandbox Staging Tenant (connected to test MySQL and mock SMTP relay).
* **Initial State:** Seed data loaded (as specified in `database_schema.md`).
* **Actual Result Legend:**
  * `[ ] Pending` - Not executed.
  * `[P] Passed` - Behavior matches expected outcome.
  * `[F] Failed` - Behavior deviates from expected outcome (requires bug logging).

---

## 2. Test Cases Matrix

| Test ID | Module | Scenario / Actions | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-001** | Authentication | Input valid email and password in login page. Click Submit. | Authentication succeeds. User JWT is created. Routed to Dashboard. | `[ ] Pending` |
| **TC-AUTH-002** | Authentication | Input email missing `@` domain symbol. Click Submit. | UI blocks submit. Displays validation message "Please enter a valid company email address." | `[ ] Pending` |
| **TC-AUTH-003** | Authentication | Input correct email but wrong password. Click Submit. | Auth fails. Displays warning: "Invalid credentials. Please verify your email and password." | `[ ] Pending` |
| **TC-AUTH-004** | Authentication | Click "Continue with SSO" button on login screen. | Redirects to Okta/Identity Provider, authenticates successfully, and routes back to Dashboard. | `[ ] Pending` |
| **TC-AUTH-005** | Authentication | Trigger 5 consecutive incorrect password submissions for single email. | System locks account for 15 minutes. Displays alert: "Account locked due to consecutive failed attempts." | `[ ] Pending` |
| **TC-TKT-001** | Ticket Intake | Fill subject, category, priority, description, and click Submit. | Ticket commits to database. UI shows ticket ID (e.g., `INC-1004`). Confirmation email dispatched. | `[ ] Pending` |
| **TC-TKT-002** | Ticket Intake | Attempt to submit ticket from portal with empty Subject field. | Validation blocks form submission. Highlight field with warning: "Subject is a required field." | `[ ] Pending` |
| **TC-TKT-003** | Ticket Intake | Send support email from unregistered address to `support@company.com`. | IMAP poller parses mail. Auto-creates guest requester profile. Logs ticket in queue. | `[ ] Pending` |
| **TC-TKT-004** | Ticket Intake | Attach a file exceeding configured size (e.g., 20MB file when max is 15MB). | Upload blocked. Displays warning: "Attachment size exceeds the maximum limit of 15MB." | `[ ] Pending` |
| **TC-TKT-005** | Ticket Intake | Attach file with `.exe` extension during ticket creation. | Validation blocks file upload. Displays: "Uploaded file extension is not permitted for security reasons." | `[ ] Pending` |
| **TC-TKT-006** | Collaboration | Support agent posts a public comment to an assigned ticket. | Comment committed. Ticket status stays `Open`. Email notification sent to the customer. | `[ ] Pending` |
| **TC-TKT-007** | Collaboration | Support agent posts an internal note checkbox marked. | Comment committed with yellow layout background. Note is hidden from Customer Portal view. | `[ ] Pending` |
| **TC-TKT-008** | Assignment | Support manager assigns unassigned ticket to Agent Emily. | Ticket agent_id updates. Status changes to `Open`. Email notification sent to Emily. | `[ ] Pending` |
| **TC-TKT-009** | Assignment | System triggers automated ticket routing using Round-Robin. | New ticket routes to next online agent with lowest ticket count. Queue balance verified. | `[ ] Pending` |
| **TC-TKT-010** | Lifecycle | Leave ticket in `Resolved` state with no comments for 72 hours. | Scheduler daemon updates ticket status to `Closed`. Logs system audit event. | `[ ] Pending` |
| **TC-SLA-001** | SLA Engine | Create a new ticket with Urgent priority. | Ticket links to SLA-Urgent policy. Sets response target = 1 hr; resolution = 4 hrs. | `[ ] Pending` |
| **TC-SLA-002** | SLA Engine | Change ticket status from `Open` to `Pending` (Awaiting customer reply). | SLA countdown clock pauses. Deadline timestamp is temporarily suspended. | `[ ] Pending` |
| **TC-SLA-003** | SLA Engine | Customer replies to a ticket in `Pending` state. | Ticket status updates to `Open`. SLA countdown clock resumes with original remaining time. | `[ ] Pending` |
| **TC-SLA-004** | SLA Engine | Ticket reaches 75% of target response duration without agent update. | System triggers SLA Warning webhook. Sends warning email to active assignee. | `[ ] Pending` |
| **TC-SLA-005** | SLA Engine | Ticket exceeds SLA resolution target without resolution status update. | Ticket severity changes to `Breached`. Escalated email sent to supervisor. Reassigned to Tier-2. | `[ ] Pending` |
| **TC-KB-001** | Knowledge Base | Type "VPN setup" in the ticket creation subject input box. | Search queries matching articles. Top 2 results dynamically render in suggestion panel. | `[ ] Pending` |
| **TC-KB-002** | Knowledge Base | Click "This resolved my issue" on suggested article during ticket creation. | Portal closes ticket form wizard. Cancel log recorded. Increment article helpfulness rating. | `[ ] Pending` |
| **TC-KB-003** | Knowledge Base | Agent creates draft KB article and clicks "Request Review". | Status updates to `Draft`. Article is hidden from portals. Support Manager alerted for approval. | `[ ] Pending` |
| **TC-RPT-001** | Reporting | Access supervisor dashboard metric panel. | Real-time counts of active breaches, unassigned queues, and MTTR display current values. | `[ ] Pending` |
| **TC-RPT-002** | Reporting | Click "Export CSV" on the Ticket List page. | System packages matching results. Downloads `.csv` file matching column headers. | `[ ] Pending` |
| **TC-RPT-003** | Reporting | Request SLA compliance report PDF export for previous month. | System renders PDF document outlining target rates vs. actual breaches. | `[ ] Pending` |
| **TC-RPT-004** | Reporting | Enable weekly recurring automated dashboard emails. | Scheduler schedules task. Reports compile and send PDF report to manager every Monday. | `[ ] Pending` |
| **TC-AUD-001** | Auditing | Support Agent self-assigns a ticket. | Audit log table inserts record mapping: `field_changed: 'agent_id'`, `old_value: 'NULL'`, `new_value: 'agent_id'`. | `[ ] Pending` |
| **TC-AUD-002** | Auditing | Ticket description gets edited by system administrator. | Audit log inserts record mapping. Stores previous description state in `old_value`. | `[ ] Pending` |
| **TC-USR-001** | Management | Change user account status to `inactive` in administrator dashboard. | Database status field updates to `inactive`. User is immediately forced-logged out of UI. | `[ ] Pending` |
