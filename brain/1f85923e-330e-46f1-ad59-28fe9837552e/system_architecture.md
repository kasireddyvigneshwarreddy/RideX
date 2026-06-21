# System Architecture Specification
## Help Desk Ticketing and Reporting System

This document outlines the high-level system architecture, component layout, data flow patterns, module breakdowns, and the recommended technology stack for the Help Desk Ticketing and Reporting System.

---

## 1. High-Level System Architecture Diagram

The system follows a containerized micro-services / modular monolith pattern. It isolates transactional ticket operations, analytics read operations, and asynchronous background jobs.

```mermaid
graph TD
    %% Client Layer
    subgraph Client Layer
        Portal[Customer Web Portal]
        Workspace[Agent Workspace Desktop/Web]
        MailUser[Email Client - Gmail/Outlook]
    end

    %% Network & Entry Layer
    subgraph ingress [API Gateway & Ingress]
        Gateway[Kong API Gateway / Nginx]
    end

    %% Application Layer
    subgraph app [Application Services]
        AuthService[Auth & SSO Identity Service]
        TicketService[Core Ticketing & KB Service]
        ReportingService[Reporting & Analytics Service]
        MailParser[Inbound Mail Parser Worker]
        BackgroundWorker[SLA & Escalation Worker]
        NotificationService[Notification Engine]
    end

    %% Data & Storage Layer
    subgraph storage [Data & Storage Layer]
        MySQL_Primary[(MySQL Primary DB - Write)]
        MySQL_Replica[(MySQL Read Replica)]
        Redis[(Redis Cache & Queue)]
        S3[(AWS S3 Object Storage)]
    end

    %% Communication Flows
    Portal -->|HTTPS / REST| Gateway
    Workspace -->|HTTPS / REST| Gateway
    MailUser -->|SMTP / IMAP| MailParser
    
    Gateway -->|Route Auth| AuthService
    Gateway -->|Route Tickets/KB| TicketService
    Gateway -->|Route Reports| ReportingService

    MailParser -->|Create Tickets| TicketService
    TicketService -->|Write/Update| MySQL_Primary
    ReportingService -->|Read Analytics| MySQL_Replica
    
    TicketService -->|Queue Tasks| Redis
    BackgroundWorker -->|Poll Escalations / SLAs| Redis
    BackgroundWorker -->|Trigger Alerts| NotificationService
    NotificationService -->|Send SMTP / Slack| Portal
    NotificationService -->|Push Alerts| Workspace
    
    TicketService -->|Store Attachments| S3
```

---

## 2. Component Descriptions

### 2.1 Frontend Components
The frontend is split into two specialized single-page web applications (SPAs) optimized for performance and accessibility.

1. **Customer Self-Service Portal (SPA)**
   * **Purpose:** Interfaces with end-users for creating, tracking, and replying to tickets.
   * **Key Components:**
     * *Knowledge Base (KB) Browser:* Features real-time search indexing and article rating.
     * *Ticket Submission Wizard:* Custom forms with validation and file drop-zones.
     * *Customer Ticket View:* Thread-based list displaying public messages and state indicators.
2. **Agent Workspace & Management Console (SPA)**
   * **Purpose:** Single-pane dashboard UI for support agents and administrators.
   * **Key Components:**
     * *Live Queue Console:* Grid layout displaying assigned queues with live SLA timers.
     * *Rich Editor Workspace:* Includes canned replies, Markdown support, and private notes.
     * *Real-Time Supervisor Analytics:* Charting dashboard showing agent capacity and SLA breach warnings.
3. **Shared UI Architecture Modules**
   * *State Management:* Handles local ticket state, workspace filters, and cached session metadata.
   * *WebSocket Client:* Connects to the gateway to receive real-time notifications of ticket updates.

### 2.2 Backend Components
The backend relies on isolated, stateless services capable of horizontal scaling.

1. **API Gateway**
   * Handles incoming client requests, manages SSL termination, checks rate-limits (e.g., max 100 requests/minute per client), and routes traffic to downstream services.
2. **Auth & Identity Service**
   * Acts as the Identity Provider (IdP). Generates short-lived JSON Web Tokens (JWT) for authentication. Implements OAuth2/SAML middleware to enable external SSO sync (e.g., Okta, Azure AD).
3. **Core Ticketing Service**
   * Houses the business logic of ticket routing, category matching, and ticket creation. Orchestrates database write transactions.
4. **Reporting & Analytics Engine**
   * Handles read-heavy reporting queries. Connects to database read-replicas to prevent resource starvation on the primary transactional database during large report compilations.
5. **Asynchronous Background Workers**
   * *SLA & Escalation Worker:* Evaluates ticket thresholds, alerts teams on upcoming breaches, and updates escalation states.
   * *Mail Parser Worker:* Polling agent connecting to IMAP folders to ingest support emails.
   * *Notification Engine:* Decoupled SMTP/Webhook publisher that manages email relays and Slack/Teams integrations.

### 2.3 Database & Storage Components
1. **Primary Relational Database (MySQL 8.0+)**
   * Stores structured operational data: ticket properties, user definitions, SLA settings, and audit logs.
2. **Read Replica Database**
   * A read-only clone of the primary database. Offloads reporting queries, analytics, and metrics aggregation.
3. **Memory Cache & Queue (Redis)**
   * Acts as the session state store, API rate-limit counter, and message broker for background job distributions (e.g., queueing emails and SLA calculation tasks).
4. **Cloud Object Storage (AWS S3 or MinIO)**
   * Provides storage for file uploads (PDFs, screenshots, logs) linked to tickets and comments.

---

## 3. Core Modules Breakdown

```
├── Authentication Module
│   ├── Login / Logout (JWT validation)
│   └── SSO / SAML Handlers
├── Ticket Engine Module
│   ├── Intake Controller (Email, API, Web)
│   ├── Routing Controller (Round-Robin, Load-Balancer)
│   └── State transition state machine
├── Collaboration Module
│   ├── Rich-Text Commenting
│   └── Internal Private Threading
├── SLA Engine Module
│   ├── SLA Rule Evaluator
│   ├── Business Calendar Resolver
│   └── SLA Action Escalator
├── Knowledge Base Module
│   ├── Search Auto-suggest
│   └── Article Publishing Lifecycle
└── Reporting & Auditing Module
    ├── Dashboard Aggregation (ART, MTTR, CSAT)
    └── Audit Log Writer
```

---

## 4. End-to-End Data Flow

The sequence diagram below shows the flow of data when a **Customer Ticket is Ingested via Inbound Email, routed, evaluated for SLA, and notified to an agent**.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Email Client)
    participant IMAP as Mail Server (IMAP)
    participant Worker as Mail Parser Worker
    participant API as Core Ticketing Service
    participant DB as MySQL DB
    participant Cache as Redis (Job Queue)
    participant SLAWorker as SLA & Escalation Worker
    actor Agent as Support Agent

    Customer->>IMAP: Sends support request email
    loop Polling Interval (every 60s)
        Worker->>IMAP: Poll for new unread messages
        IMAP-->>Worker: Return email raw body & attachments
    end
    Worker->>API: HTTP POST /tickets/ingest (Payload)
    
    rect rgb(240, 248, 255)
        Note over API: Core Business Logic Processing
        API->>DB: Check/Create Requester record
        API->>DB: Apply auto-routing rules to determine group
        API->>DB: Calculate SLA response/resolution deadlines
        API->>DB: Insert ticket, comment, and audit record
    end
    
    DB-->>API: Confirm database commit
    API->>Cache: Enqueue SLA checking job & agent notification job
    API-->>Worker: HTTP 201 Created (Success)
    
    par Queue Execution: SLA Tracking
        Cache->>SLAWorker: Trigger SLA timer evaluation
        Note over SLAWorker: SLAWorker keeps tracking deadline
    and Queue Execution: Notification Routing
        Cache->>Agent: WebSocket push notification: "New Ticket Assigned"
    end
```

---

## 5. Technology Stack Recommendations

| Component Layer | Technology Option (Recommended) | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18+** / **TypeScript** / **Vite** | Single-page framework with an active ecosystem. TypeScript ensures compile-time safety for ticket interfaces. |
| **UI Styling** | **Tailwind CSS** & **Radix UI** | Modern CSS utility layer coupled with accessible headless components, yielding professional, customized workspaces. |
| **Backend Core** | **Node.js** with **NestJS** | Highly modular, scalable backend framework. Offers excellent integration with SQL database ORMs and job managers. |
| **Background Jobs** | **BullMQ** (powered by Redis) | High-performance, low-overhead distributed task framework in Node.js. Handles retries, delays, and scheduling. |
| **Primary Database** | **MySQL 8.0** | Relational capabilities with strong support for transactions (`InnoDB`), complex joins for reporting, and spatial indexes. |
| **Caching & Messaging** | **Redis 7.0** | In-memory key-value cache. Ideal for session management, API rate limiting, and backpressure messaging. |
| **File Storage** | **AWS S3** or **MinIO** | Standard API for secure, scalable file storage. MinIO serves as a local development drop-in. |
| **Infrastructure / DevOps**| **Docker** / **Kubernetes** / **Terraform**| Ensures predictable setups across local developer machines, staging servers, and elastic cloud environments. |
