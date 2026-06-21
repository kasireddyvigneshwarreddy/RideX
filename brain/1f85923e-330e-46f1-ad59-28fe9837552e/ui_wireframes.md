# UI Wireframes & Page Structure Design
## Help Desk Ticketing and Reporting System

This document outlines the visual structure, layout grids, components, and wireframes for the core pages of the Help Desk System. The designs prioritize a modern, glassmorphic dark-themed layout with HSL-tailored accents (neon blue and purple) and clean typography.

---

## 1. Design System & Global Layout

To establish a consistent user experience, the system utilizes a unified layout framework:
* **Shell Layout:** Left-fixed sidebar navigation (`w-64`) paired with a fluid main content container (`flex-1 bg-slate-950 text-slate-100 min-h-screen`).
* **Visual Styling:** Semi-transparent containers (`bg-slate-900/50 backdrop-blur-md border border-slate-800`), smooth hover animations, and neon border rings for focused inputs.
* **Responsive Breakpoints:**
  * Sidebar collapses to a burger menu on mobile (`< 768px`).
  * Grids adjust dynamically: 1 column on mobile, 2 columns on tablet, 3-4 columns on desktop.

---

## 2. Page Specifications & Wireframes

### 2.1 Login Page
* **Route:** `/login`
* **Layout:** Centered card interface (`max-w-md w-full`) against a subtle animated gradient background.
* **Wireframe Layout:**

```
+-------------------------------------------------------------+
|                                                             |
|                     [ HELP DESK LOGO ]                      |
|                 Welcome back. Access your workspace.        |
|                                                             |
|        +-------------------------------------------+        |
|        |  Email Address                            |        |
|        |  [ alex.admin@company.com              ]  |        |
|        |                                           |        |
|        |  Password                  (Forgot?)      |        |
|        |  [ **********                          ]  |        |
|        |                                           |        |
|        |  [x] Keep me signed in                    |        |
|        |                                           |        |
|        |  [          SIGN IN WITH EMAIL            ]        |
|        |                                           |        |
|        |  ------------- or continue with -----------        |
|        |                                           |        |
|        |  [        SSO / OKTA ENTERPRISE           ]        |
|        +-------------------------------------------+        |
|                                                             |
|                  Need access? Contact IT admin.             |
+-------------------------------------------------------------+
```

* **Interactive Elements:**
  * **Email/Password inputs:** Standard validate-on-blur.
  * **Sign In with Email:** Primary action button (purple gradient glow).
  * **SSO / Okta Login:** Initiates OIDC redirect sequence.

---

### 2.2 Dashboard
* **Route:** `/dashboard`
* **Layout:** Sidebar shell with a 4-column metric grid at the top, a 2-column center split (sla monitoring and active tickets), and a live activity feed.
* **Wireframe Layout:**

```
+------------------------------------------------------------------------------------+
| [Logo]        |  Search tickets...                            (Profile) [Alex A.]  |
|               +--------------------------------------------------------------------+
| > Dashboard   |  +------------+  +------------+  +------------+  +---------------+ |
| > Tickets     |  | Open Tkt   |  | Avg MTTR   |  | SLA Compl. |  | Deflected KB  | |
| > Reports     |  |   14       |  |  2.4 hrs   |  |   96.8%    |  |     22%       | |
| > KB Manager  |  +------------+  +------------+  +------------+  +---------------+ |
| > Settings    |                                                                    |
|               |  +---------------------------------+ +---------------------------+ |
|               |  | SLA Breach Warnings             | | Assigned Queue Status     | |
|               |  | - INC-102  High   12m remaining | | [ ] Hardware   - 4 open   | |
|               |  | - INC-492  Urgent 22m remaining | | [ ] Software   - 8 open   | |
|               |  | - INC-281  Medium 4h remaining  | | [ ] Billing    - 2 open   | |
|               |  +---------------------------------+ +---------------------------+ |
|               |                                                                    |
|               |  +---------------------------------------------------------------+ |
|               |  | Recent Activity Logs                                          | |
|               |  | - [09:12 AM] Agent Daniel self-assigned INC-102               | |
|               |  | - [08:45 AM] System auto-created INC-492 via support email    | |
|               |  +---------------------------------------------------------------+ |
+------------------------------------------------------------------------------------+
```

* **High-Fidelity Mockup (Visual Preview):**
![Agent Workspace Dashboard](C:\Users\gouth\.gemini\antigravity\brain\1f85923e-330e-46f1-ad59-28fe9837552e\dashboard_mockup_1782015733465.png)

---

### 2.3 Create Ticket Page
* **Route:** `/tickets/new`
* **Layout:** Two-column page layout.
  * **Left Column (70%):** Multi-step ticket details form.
  * **Right Column (30%):** Dynamic Smart Knowledge Base suggestion sidebar.
* **Wireframe Layout:**

```
+------------------------------------------------------------------------------------+
| [Logo]        |  Create Support Ticket                                             |
|               +--------------------------------------------------------------------+
| > Dashboard   |  +-------------------------------------+ +-----------------------+ |
| > Tickets     |  | Ticket Subject                      | | KB Suggestions        | |
| > Reports     |  | [ Cannot connect to corporate VPN ] | | We found these        | |
| > KB Manager  |  |                                     | | articles helpful:     | |
| > Settings    |  | Category             Priority       | |                       | |
|               |  | [ Software Access v] [ High       v] | | > How to reset VPN    | |
|               |  |                                     | |   credentials         | |
|               |  | Description                         | |   [Read Article]      | |
|               |  | +---------------------------------+ | |                       | |
|               |  | | Getting authentication timeouts | | > VPN server address  | |
|               |  | | since my password reset today.  | |   directory           | |
|               |  | +---------------------------------+ | |   [Read Article]      | |
|               |  |                                     | |                       | |
|               |  | Attachments                         | | Did this resolve      | |
|               |  | +---------------------------------+ | | your issue?           | |
|               |  | | Drag files here to upload       | | [Yes, cancel ticket]  | |
|               |  | +---------------------------------+ | |                       | |
|               |  |                                     | |                       | |
|               |  | [ SUBMIT TICKET ]      [ Cancel ]   | |                       | |
|               |  +-------------------------------------+ +-----------------------+ |
+------------------------------------------------------------------------------------+
```

* **Interactive Elements:**
  * **Subject Input:** Triggers search query on keyup to update the right-hand KB Suggestions column.
  * **Category Dropdown:** Changes input parameters dynamically.
  * **Yes, Cancel Ticket:** Deflects the ticket creation flow.

---

### 2.4 Ticket List Page
* **Route:** `/tickets`
* **Layout:** List shell. Includes horizontal filter toolbar (Status, Priority, Category, Assignee) above a tabular ticket database.
* **Wireframe Layout:**

```
+------------------------------------------------------------------------------------+
| [Logo]        |  Tickets Database                                                  |
|               +--------------------------------------------------------------------+
| > Dashboard   |  [Search Tickets...] [Status v] [Priority v] [Category v] [+ NEW]   |
| > Tickets     |  +---------------------------------------------------------------+ |
| > Reports     |  | ID   | Subject            | Category | Priority | Status | SLA| |
| > KB Manager  |  |------+--------------------+----------+----------+--------+----| |
| > Settings    |  | #102 | Broken laptop      | Hardware | High     | Open   | 12m| |
|               |  | #492 | VPN Timeout error  | Software | Urgent   | New    | 22m| |
|               |  | #301 | Duplicate invoice  | Billing  | Medium   | Pend   | Paused| |
|               |  | #190 | Reset Outlook pass | Software | Low      | Resolved| ok| |
|               |  +---------------------------------------------------------------+ |
|               |  | Showing 1-4 of 1,290 tickets          [Prev] [1] [2] [3] [Next] |
|               +--------------------------------------------------------------------+
+------------------------------------------------------------------------------------+
```

* **Interactive Elements:**
  * **Table Rows:** Hover highlights row; clicking a row opens the slide-over ticket detail panel.
  * **SLA Column:** Renders a countdown timer with red/amber/green text flags depending on remaining duration.

---

### 2.5 Reports Dashboard
* **Route:** `/reports`
* **Layout:** Grid dashboard dedicated to high-level system reporting. Features charts (line, bar, doughnut) and export actions.
* **Wireframe Layout:**

```
+------------------------------------------------------------------------------------+
| [Logo]        |  System Performance Reports             [Export PDF] [Schedule]    |
|               +--------------------------------------------------------------------+
| > Dashboard   |  Date Range: [ Last 30 Days v]    Filter Department: [ All Groups v] |
| > Tickets     |  +---------------------------------+ +---------------------------+ |
| > Reports     |  | Ticket Volume Trend             | | CSAT Breakdown            | |
| > KB Manager  |  |                                 | |   (Doughnut Chart)        | |
| > Settings    |  |  (Line chart showing intake vs. | |   5 Star [======= ] 85%   | |
|               |  |   resolution rates over days)   | |   4 Star [==      ] 10%   | |
|               |  |                                 | |   3-1Star[=       ] 5%    | |
|               |  +---------------------------------+ +---------------------------+ |
|               |                                                                    |
|               |  +---------------------------------------------------------------+ |
|               |  | Agent Performance Metrics                                     | |
|               |  | | Agent Name | Tickets Resolved | Avg MTTR | SLA Compliance % | |
|               |  | |------------+------------------+----------+------------------| |
|               |  | | Daniel D.  |        142       | 1.8 hrs  |      98.2%       | |
|               |  | | Emily E.   |        118       | 2.1 hrs  |      95.4%       | |
|               |  +---------------------------------------------------------------+ |
+------------------------------------------------------------------------------------+
```

* **High-Fidelity Mockup (Visual Preview):**
![Reports Dashboard](C:\Users\gouth\.gemini\antigravity\brain\1f85923e-330e-46f1-ad59-28fe9837552e\reports_mockup_1782015753453.png)
