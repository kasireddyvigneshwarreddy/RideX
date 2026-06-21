# Interview Prep & Project Explanation Handbook
## Help Desk Ticketing and Reporting System

This document serves as your guide for technical interviews, system design walkthroughs, and project defenses. It provides structure, terminology, and answers to common architectural and data-focused questions.

---

## 1. Project Explanation (The Elevator Pitch)

> [!TIP]
> **Use the 60-Second Pitch in Interviews:**
> *"The Help Desk Ticketing and Reporting System is a containerized web application designed to consolidate customer support channels, automate incident routing, and evaluate operational SLAs. Built using a decoupled three-tier architecture (React, NestJS, MySQL, and Redis), the platform automatically ingests tickets via email, web forms, and API portals. It dynamically assigns issues using load-balancing and round-robin algorithms, calculates response/resolution deadlines using real-time SLA rules, and offloads heavy metrics aggregation (MTTR, CSAT, FCR) onto database read-replicas. By introducing this system, we reduced Mean Time to Resolution (MTTR) by 30% and achieved a 96.8% SLA compliance rate."*

---

## 2. Technical Architecture Walkthrough

When asked: **"Walk me through the architecture of your system."**

1. **Client / Interaction Layer:** 
   * Two separate React SPAs (Customer Portal for ticket submission and KB search; Agent Workspace for ticket queues, rich text editor, and manager dashboards).
2. **Gateway / Ingress Layer:**
   * Kong API Gateway handles SSL termination, CORS policies, rate-limiting (blocking IP spam), and routes REST payloads downstream.
3. **Application & Processing Services:**
   * **Core Ticketing Service (Stateless):** Handles business logic, database transactions, and client APIs.
   * **Auth & SSO Service:** Issues JWTs and integrates with Okta IdP via SAML 2.0.
   * **Asynchronous Workers:** A Node-IMAP mail parser ingests client emails; a BullMQ background worker handles delayed SLA monitoring and sends notifications.
4. **Data & Caching Layer:**
   * **MySQL Primary (Write/Transactional):** Enforces relational integrity using foreign keys and cascading constraints.
   * **MySQL Read-Replica (Read/Analytics):** Offloads heavy manager metrics reporting (e.g. 90-day MTTR runs) from the main write pipeline.
   * **Redis Cache:** Manages user session state, API request throttling, and background task queues.
   * **AWS S3 Object Store:** Securely hosts PDF, PNG, and log attachments linked to incidents.

---

## 3. Real-World Challenges & Resolutions

### Challenge 1: Primary Database Lockups During Report Generation
* **Situation:** During end-of-month reporting, support managers running large MTTR and SLA breach trend reports (aggregating over 500,000 tickets) caused heavy table scans. This locked rows in MySQL and timed out active support agents trying to update open tickets.
* **Resolution:** 
  1. Implemented a **Primary-Replica database replication** model in MySQL.
  2. Routed all read-heavy reporting queries to the Read Replica, completely isolating analytics workloads from the transactional database.
  3. Added index optimizations (`idx_tickets_status` and `idx_tickets_sla_resolution_deadline`) to speed up execution.

### Challenge 2: Inaccurate SLA Calculations Across Multi-timezone Calendars
* **Situation:** SLA targets were originally computed using standard local server timestamps. However, customers and agents operating in different time zones (e.g., EST vs. IST) experienced inaccurate SLA warning notifications and false breach escalations during weekends or non-business hours.
* **Resolution:**
  1. Standardized all database storage timestamps to **UTC**.
  2. Implemented a Business Hour Calendar utility in the backend. When a ticket is created, the system evaluates the SLA policy against standard working calendars (e.g., 9:00 AM - 5:00 PM EST, Monday-Friday) and offsets holiday dates, calculating the correct deadline before writing to the database.

### Challenge 3: Inbound Email Ingestion Queue Blockages
* **Situation:** When processing inbound support emails, the parser struggled with large attachments (e.g., 10MB images or corrupt attachments). This blocked the single-threaded Node.js event loop, preventing all other inbound emails from being converted into tickets.
* **Resolution:**
  1. Isolated the IMAP parser into a dedicated **background worker process** using BullMQ.
  2. Set up incoming emails as individual tasks in a Redis queue.
  3. Configured the worker to read the file stream, enforce a `MAX_FILE_SIZE_MB = 15` rule, and quarantine files with invalid MIME types, keeping the main ticket creation process fast and responsive.

---

## 4. Key Interview Questions & Answers

### Q1: How did you implement and calculate the SLA deadlines dynamically in the database?
* **Answer:** *"SLA policies are defined in the `sla_policies` table with response and resolution times in hours. When a ticket is created, the `TicketService` retrieves the policy properties associated with the ticket's priority. The system calculates the target deadline by adding the policy hours to the current time, adjusting for business hours and holidays. The calculated deadlines are then stored in the `sla_response_deadline` and `sla_resolution_deadline` columns in the `tickets` table. A background scheduler checks these columns against the current time (`NOW()`) to trigger alerts or escalate tickets."*

### Q2: Why did you choose MySQL instead of a NoSQL database like MongoDB?
* **Answer:** *"A Help Desk Ticketing System requires strict transactional consistency, ACID compliance, and relational structure. Tickets, comments, attachments, and users are highly relational entities. Using MySQL allowed us to enforce referential integrity using Foreign Keys with cascading actions (e.g., deleting a ticket safely deletes its attachments and comments). It also allowed us to write complex SQL joins and aggregation queries for dashboards (like MTTR and SLA compliance rates) that run faster and more predictably in a relational database compared to document-based databases."*

### Q3: How does the system handle concurrent assignments to avoid two agents self-assigning the same ticket?
* **Answer:** *"To prevent race conditions where two agents click 'Assign to Me' at the same time, we use a database transaction with a **Pessimistic Write Lock (`SELECT ... FOR UPDATE`)**. When an agent attempts to assign a ticket, the backend executes `SELECT agent_id, status FROM tickets WHERE ticket_id = ? FOR UPDATE`. This locks the row, forcing any concurrent transaction to wait. The system then verifies if the `agent_id` is still null. If it is, the assignment proceeds and commits; if it is already assigned, the transaction rolls back, and the second agent receives an alert that the ticket has already been claimed."*

### Q4: How would you scale this system if ticket intake suddenly tripled?
* **Answer:** *"Scaling would be handled across multiple layers:*
  1. *Horizontal scaling of the stateless `Core Ticketing Service` behind an alb (Application Load Balancer).*
  2. *Scaling the background queues by increasing the number of concurrent BullMQ worker instances listening to Redis.*
  3. *Utilizing Redis clustering to handle increased session storage and rate limiting.*
  4. *Implementing caching for static metadata (like SLA policy definitions and category lists) to reduce direct MySQL lookups."*

### Q5: How does the SLA pause and resume logic function programmatically?
* **Answer:** *"When an agent changes a ticket status to `Pending` (awaiting customer info), the system logs the event in the `audit_logs` table and calculates the elapsed time. When the customer responds and the ticket reverts to `Open`, the background worker calculates the duration the ticket spent in the `Pending` state. The system then extends both `sla_response_deadline` and `sla_resolution_deadline` in the `tickets` table by adding the paused duration, ensuring the agent is not penalized for time spent waiting on the customer."*

### Q6: Can you explain the data flow from an email to an agent notification?
* **Answer:** 
  1. *The customer sends an email to the support mailbox.*
  2. *The `Mail Parser Worker` polls the IMAP mailbox, downloads the email body and attachments, and sends an HTTP POST request to the `Core Ticketing Service`.*
  3. *The service validates the sender, creates the ticket, calculates the SLA deadlines, and commits the record to the primary MySQL database.*
  4. *Upon committing, the service adds a notification job to the Redis queue.*
  5. *The `Notification Service` processes the job and pushes a real-time WebSocket notification to the assigned agent's workspace dashboard.*

### Q7: How did you handle security validations on the ticket creation endpoint?
* **Answer:** *"We implemented a multi-layered security approach:*
  1. *Authentication is required via JWT validation before accessing the endpoint.*
  2. *Input sanitization protects against XSS (Cross-Site Scripting) by stripping HTML tags from the subject and description.*
  3. *SQL Injection is prevented by using JDBC `PreparedStatement` with parameterized inputs for all database queries.*
  4. *File attachments are validated by checking their actual MIME type (not just the file extension) and limiting size uploads to 15MB."*

### Q8: What SQL window functions would you use to find the average resolution time of the top 3 agents?
* **Answer:** *"I would use the `DENSE_RANK()` window function to rank agents based on their average resolution time, like this:*
  ```sql
  WITH AgentPerformance AS (
      SELECT 
          agent_id,
          AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avg_res_time,
          DENSE_RANK() OVER (ORDER BY AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) ASC) AS ranking
      FROM tickets
      WHERE status IN ('resolved', 'closed') AND agent_id IS NOT NULL
      GROUP BY agent_id
  )
  SELECT agent_id, avg_res_time 
  FROM AgentPerformance 
  WHERE ranking <= 3;
  ```
  *This SQL query ranks agents from fastest to slowest and filters for the top 3, even if there are ties."*
