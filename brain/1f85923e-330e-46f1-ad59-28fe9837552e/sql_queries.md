# Essential SQL Queries Specification
## Help Desk Ticketing and Reporting System

This document contains 20 production-grade SQL queries designed to run against the Help Desk MySQL database schema. These queries power the core reporting dashboards, agent queue views, and management metrics.

---

## 1. Operational & Queue Management Queries

### Query 1: Active Ticket Queue with User Profiles
* **Purpose:** Powers the main agent dashboard queue displaying active tickets with requester and assignee details.
* **Concepts:** `INNER JOIN`, `LEFT JOIN`, multi-table relationships.

```sql
SELECT 
    t.ticket_id,
    t.title,
    t.status,
    t.priority,
    CONCAT(req.first_name, ' ', req.last_name) AS requester_name,
    req.email AS requester_email,
    CONCAT(age.first_name, ' ', age.last_name) AS assignee_name,
    c.name AS category_name,
    t.sla_resolution_deadline
FROM tickets t
INNER JOIN users req ON t.requester_id = req.user_id
LEFT JOIN users age ON t.agent_id = age.user_id
INNER JOIN categories c ON t.category_id = c.category_id
WHERE t.status IN ('new', 'open', 'pending')
ORDER BY 
    CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END, 
    t.sla_resolution_deadline ASC;
```

---

### Query 2: Unassigned Incident Queue
* **Purpose:** Highlights new tickets requiring assignment, prioritized by urgency and age.

```sql
SELECT 
    t.ticket_id,
    t.title,
    t.priority,
    c.name AS category,
    t.created_at,
    TIMESTAMPDIFF(HOUR, t.created_at, NOW()) AS age_in_hours
FROM tickets t
INNER JOIN categories c ON t.category_id = c.category_id
WHERE t.agent_id IS NULL 
  AND t.status = 'new'
ORDER BY t.priority DESC, t.created_at ASC;
```

---

### Query 3: Complete Audit Trail for a Specific Ticket
* **Purpose:** Displays the audit history of a single ticket (e.g., ticket `#102`) showing what changed, when, and who performed it.

```sql
SELECT 
    a.audit_log_id,
    a.field_changed,
    a.old_value,
    a.new_value,
    a.changed_at,
    CONCAT(u.first_name, ' ', u.last_name) AS updated_by,
    r.name AS updater_role
FROM audit_logs a
LEFT JOIN users u ON a.user_id = u.user_id
LEFT JOIN roles r ON u.role_id = r.role_id
WHERE a.ticket_id = 102
ORDER BY a.changed_at DESC;
```

---

### Query 4: Detailed Discussion Feed per Ticket
* **Purpose:** Renders public threads and private agent notes chronologically for the agent workspace ticket editor.

```sql
SELECT 
    c.comment_id,
    c.body,
    c.is_internal,
    c.created_at,
    CONCAT(u.first_name, ' ', u.last_name) AS author_name,
    r.name AS author_role
FROM comments c
INNER JOIN users u ON c.author_id = u.user_id
INNER JOIN roles r ON u.role_id = r.role_id
WHERE c.ticket_id = 1
ORDER BY c.created_at ASC;
```

---

### Query 5: Flag Large Attachments
* **Purpose:** Security and disk-usage audit listing files larger than 5MB.

```sql
SELECT 
    a.file_name,
    a.mime_type,
    ROUND(a.file_size_bytes / (1024 * 1024), 2) AS size_mb,
    t.ticket_id,
    t.title AS ticket_title,
    a.uploaded_at
FROM attachments a
INNER JOIN tickets t ON a.ticket_id = t.ticket_id
WHERE a.file_size_bytes > (5 * 1024 * 1024)
ORDER BY a.file_size_bytes DESC;
```

---

## 2. Dashboard KPI Aggregations

### Query 6: Core Ticket Status Breakdown
* **Purpose:** Powers primary dashboard pie charts showing active workload states.
* **Concepts:** `COUNT`, `GROUP BY`.

```sql
SELECT 
    status,
    COUNT(*) AS total_tickets,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tickets), 2) AS percentage
FROM tickets
GROUP BY status
ORDER BY total_tickets DESC;
```

---

### Query 7: Queue Count by Priority & Category Matrix
* **Purpose:** Renders grid dashboard widgets tracking ticket density across departments.

```sql
SELECT 
    c.name AS category_name,
    SUM(CASE WHEN t.priority = 'urgent' THEN 1 ELSE 0 END) AS urgent_count,
    SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) AS high_count,
    SUM(CASE WHEN t.priority = 'medium' THEN 1 ELSE 0 END) AS medium_count,
    SUM(CASE WHEN t.priority = 'low' THEN 1 ELSE 0 END) AS low_count,
    COUNT(t.ticket_id) AS total_count
FROM categories c
LEFT JOIN tickets t ON c.category_id = t.category_id AND t.status != 'closed'
GROUP BY c.category_id, c.name
ORDER BY total_count DESC;
```

---

### Query 8: Real-Time Agent Workload Summary
* **Purpose:** Identifies who has active assignments to prevent bottleneck allocations.

```sql
SELECT 
    u.user_id AS agent_id,
    CONCAT(u.first_name, ' ', u.last_name) AS agent_name,
    SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) AS open_tickets,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tickets,
    COUNT(t.ticket_id) AS total_active_assigned
FROM users u
INNER JOIN roles r ON u.role_id = r.role_id
LEFT JOIN tickets t ON u.user_id = t.agent_id AND t.status IN ('open', 'pending')
WHERE r.name = 'agent' AND u.status = 'active'
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY total_active_assigned DESC;
```

---

### Query 9: Hourly Ticket Ingestion Load
* **Purpose:** Determines peak times for support staffing schedules.

```sql
SELECT 
    HOUR(created_at) AS hour_of_day,
    COUNT(*) AS tickets_ingested
FROM tickets
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY HOUR(created_at)
ORDER BY hour_of_day ASC;
```

---

## 3. SLA & Compliance Reports

### Query 10: Near-Breach Warnings (SLA Warning Grid)
* **Purpose:** Warns agents of unresolved tickets with less than 1 hour remaining on their SLA.

```sql
SELECT 
    t.ticket_id,
    t.title,
    t.priority,
    t.sla_resolution_deadline,
    TIMESTAMPDIFF(MINUTE, NOW(), t.sla_resolution_deadline) AS minutes_remaining,
    CONCAT(u.first_name, ' ', u.last_name) AS assignee
FROM tickets t
LEFT JOIN users u ON t.agent_id = u.user_id
WHERE t.status IN ('new', 'open')
  AND t.sla_resolution_deadline > NOW()
  AND t.sla_resolution_deadline <= DATE_ADD(NOW(), INTERVAL 1 HOUR)
ORDER BY t.sla_resolution_deadline ASC;
```

---

### Query 11: SLA Breach Volume by Category
* **Purpose:** Highlights department-level bottlenecks failing SLA targets.

```sql
SELECT 
    c.name AS category_name,
    COUNT(t.ticket_id) AS total_tickets,
    SUM(CASE WHEN NOW() > t.sla_resolution_deadline AND t.status != 'resolved' AND t.status != 'closed' THEN 1 ELSE 0 END) AS active_breaches,
    ROUND(
      (SUM(CASE WHEN NOW() > t.sla_resolution_deadline AND t.status != 'resolved' AND t.status != 'closed' THEN 1 ELSE 0 END) * 100.0) / COUNT(t.ticket_id), 
      2
    ) AS breach_rate_percentage
FROM categories c
LEFT JOIN tickets t ON c.category_id = t.category_id
GROUP BY c.category_id, c.name
ORDER BY active_breaches DESC;
```

---

### Query 12: SLA Resolution Compliance Rate
* **Purpose:** Executive SLA report tracking the percentage of resolved tickets that met their resolution deadlines.

```sql
SELECT 
    DATE(t.updated_at) AS resolution_date,
    COUNT(*) AS resolved_tickets,
    SUM(CASE WHEN t.updated_at <= t.sla_resolution_deadline THEN 1 ELSE 0 END) AS compliant_tickets,
    ROUND(
        (SUM(CASE WHEN t.updated_at <= t.sla_resolution_deadline THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 
        2
    ) AS compliance_rate
FROM tickets t
WHERE t.status IN ('resolved', 'closed')
  AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(t.updated_at)
ORDER BY resolution_date DESC;
```

---

## 4. Agent Performance & CSAT Analytics

### Query 13: Mean Time to Resolution (MTTR) Leaderboard
* **Purpose:** Renders monthly agent speed leaderboards.
* **Concepts:** `AVG`, `TIMESTAMPDIFF`.

```sql
SELECT 
    u.user_id AS agent_id,
    CONCAT(u.first_name, ' ', u.last_name) AS agent_name,
    COUNT(t.ticket_id) AS resolved_count,
    ROUND(AVG(TIMESTAMPDIFF(SECOND, t.created_at, t.updated_at)) / 3600.0, 2) AS avg_resolution_hours
FROM users u
INNER JOIN tickets t ON u.user_id = t.agent_id
WHERE t.status IN ('resolved', 'closed')
  AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.user_id, u.first_name, u.last_name
HAVING resolved_count > 0
ORDER BY avg_resolution_hours ASC;
```

---

### Query 14: Agent First Response Time (ART) Analysis
* **Purpose:** Measures the average time elapsed before an agent replies to a ticket.

```sql
SELECT 
    u.user_id AS agent_id,
    CONCAT(u.first_name, ' ', u.last_name) AS agent_name,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, first_reply.first_comment_time)), 1) AS avg_first_response_minutes
FROM users u
INNER JOIN tickets t ON u.user_id = t.agent_id
INNER JOIN (
    SELECT ticket_id, MIN(created_at) AS first_comment_time
    FROM comments
    WHERE is_internal = 0
    GROUP BY ticket_id
) first_reply ON t.ticket_id = first_reply.ticket_id
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY avg_first_response_minutes ASC;
```

---

### Query 15: First Contact Resolution (FCR) Rate
* **Purpose:** Computes the percentage of tickets solved with exactly one agent reply.

```sql
SELECT 
    ROUND(
        (COUNT(CASE WHEN comment_counts.total_comments = 1 THEN 1 END) * 100.0) / COUNT(*), 
        2
    ) AS fcr_rate_percentage
FROM tickets t
INNER JOIN (
    SELECT ticket_id, COUNT(*) AS total_comments 
    FROM comments 
    WHERE is_internal = 0
    GROUP BY ticket_id
) comment_counts ON t.ticket_id = comment_counts.ticket_id
WHERE t.status IN ('resolved', 'closed')
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

### Query 16: Top Requesters (Incident Drivers)
* **Purpose:** Identifies customers creating high support volumes.

```sql
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
    u.email,
    COUNT(t.ticket_id) AS tickets_submitted
FROM users u
INNER JOIN tickets t ON u.user_id = t.requester_id
GROUP BY u.user_id, u.first_name, u.last_name, u.email
ORDER BY tickets_submitted DESC
LIMIT 5;
```

---

## 5. System Trends & Health Reports

### Query 17: Monthly Intake & Closure Volume Trends
* **Purpose:** Line charts indicating support queue growth vs. output.

```sql
SELECT 
    DATE_FORMAT(months.date_val, '%Y-%m') AS year_month,
    COALESCE(intake.created_count, 0) AS tickets_created,
    COALESCE(closures.closed_count, 0) AS tickets_closed
FROM (
    SELECT DISTINCT DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL (a.a + (10 * b.a)) MONTH) AS date_val
    FROM (SELECT 0 AS a UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS a
    CROSS JOIN (SELECT 0 AS a UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS b
    LIMIT 12
) months
LEFT JOIN (
    SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month_start, COUNT(*) AS created_count
    FROM tickets
    GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
) intake ON months.date_val = intake.month_start
LEFT JOIN (
    SELECT DATE_FORMAT(updated_at, '%Y-%m-01') AS month_start, COUNT(*) AS closed_count
    FROM tickets
    WHERE status IN ('resolved', 'closed')
    GROUP BY DATE_FORMAT(updated_at, '%Y-%m-01')
) closures ON months.date_val = closures.month_start
ORDER BY year_month ASC;
```

---

### Query 18: Ticket Reopen Rate
* **Purpose:** Quality assurance metric showing how often resolved tickets are reopened.

```sql
SELECT 
    COUNT(DISTINCT t.ticket_id) AS total_resolved_tickets,
    COUNT(DISTINCT a.ticket_id) AS reopened_tickets,
    ROUND((COUNT(DISTINCT a.ticket_id) * 100.0) / COUNT(DISTINCT t.ticket_id), 2) AS reopen_rate_percentage
FROM tickets t
LEFT JOIN audit_logs a ON t.ticket_id = a.ticket_id 
    AND a.field_changed = 'status' 
    AND a.old_value = 'resolved' 
    AND a.new_value = 'open'
WHERE t.status IN ('resolved', 'closed')
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

### Query 19: Ratio of Public Comments vs. Private Internal Notes
* **Purpose:** Audits communication overhead across ticket categories.

```sql
SELECT 
    cat.name AS category_name,
    COUNT(com.comment_id) AS total_comments,
    SUM(CASE WHEN com.is_internal = 0 THEN 1 ELSE 0 END) AS public_replies,
    SUM(CASE WHEN com.is_internal = 1 THEN 1 ELSE 0 END) AS private_notes,
    ROUND(
        SUM(CASE WHEN com.is_internal = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(com.comment_id), 
        2
    ) AS private_notes_ratio
FROM categories cat
INNER JOIN tickets t ON cat.category_id = t.category_id
INNER JOIN comments com ON t.ticket_id = com.ticket_id
GROUP BY cat.category_id, cat.name
ORDER BY private_notes_ratio DESC;
```

---

### Query 20: Daily Closed Volume Tracker (14-Day Rolling Window)
* **Purpose:** Daily output scorecard monitor.

```sql
SELECT 
    DATE(updated_at) AS date_closed,
    COUNT(*) AS resolved_count
FROM tickets
WHERE status IN ('resolved', 'closed')
  AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
GROUP BY DATE(updated_at)
ORDER BY date_closed DESC;
```
