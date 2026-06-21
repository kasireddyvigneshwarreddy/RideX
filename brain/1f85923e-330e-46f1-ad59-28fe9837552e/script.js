// Initialize prototype state with dummy database seed if localStorage is empty
const DEFAULT_TICKETS = [
    { id: 'INC-102', title: 'Cannot access VPN US-East Server', category: 'Software Access', priority: 'high', status: 'open', requester: 'John Doe', agent: 'Daniel Developer', description: 'Getting authentication timeouts since my password reset today when connecting to US-East server cluster.', slaTimeRemaining: 705, created_at: '2026-06-21 08:30:00' },
    { id: 'INC-492', title: 'Server screen failure at primary cluster', category: 'Hardware Support', priority: 'urgent', status: 'new', requester: 'Jane Smith', agent: 'Unassigned', description: 'Cabinet 4 rack C server monitor shows screen glitching and vertical lines. Requires display inspection.', slaTimeRemaining: 1270, created_at: '2026-06-21 08:45:00' },
    { id: 'INC-301', title: 'Double subscription charge on INV-8921', category: 'Billing & Invoices', priority: 'medium', status: 'pending', requester: 'John Doe', agent: 'Emily Expert', description: 'Customer reported twin debit card authorizations of $199 on invoice INV-8921. Needs audit and credit write-off.', slaTimeRemaining: null, created_at: '2026-06-20 14:12:00' },
    { id: 'INC-190', title: 'Reset Outlook email password credentials', category: 'Software Access', priority: 'low', status: 'resolved', requester: 'Jane Smith', agent: 'Alex Analyst', description: 'Forgot AD credentials locked out from email on mobile phone and laptop application.', slaTimeRemaining: null, created_at: '2026-06-20 10:15:00' }
];

const DEFAULT_COMMENTS = {
    'INC-102': [
        { author: 'John Doe (Client)', text: 'I verified that my credentials work fine on the main SSO portal page, only VPN times out.', time: '08:30 AM', isInternal: false },
        { author: 'Daniel Developer (Agent)', text: 'Checked US-East firewall routes, user IP looks whitelisted. Requesting profile reset check.', time: '09:12 AM', isInternal: true }
    ],
    'INC-492': [
        { author: 'System Ingestion', text: 'Ticket created automatically from inbox parser queue.', time: '08:45 AM', isInternal: true }
    ]
};

// Check and load storage states
let tickets = JSON.parse(localStorage.getItem('hd_tickets'));
let comments = JSON.parse(localStorage.getItem('hd_comments'));

if (!tickets) {
    localStorage.setItem('hd_tickets', JSON.stringify(DEFAULT_TICKETS));
    tickets = DEFAULT_TICKETS;
}
if (!comments) {
    localStorage.setItem('hd_comments', JSON.stringify(DEFAULT_COMMENTS));
    comments = DEFAULT_COMMENTS;
}

// Global SLA Timer loop
function startSlaTimer() {
    setInterval(() => {
        let updated = false;
        tickets.forEach(ticket => {
            if (ticket.status !== 'resolved' && ticket.status !== 'closed' && ticket.status !== 'pending' && ticket.slaTimeRemaining > 0) {
                ticket.slaTimeRemaining--;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('hd_tickets', JSON.stringify(tickets));
            // Trigger visual UI update events if update function exists
            if (typeof updateSlaTimersInUI === 'function') {
                updateSlaTimersInUI();
            }
        }
    }, 1000);
}

// Start immediately on script load
startSlaTimer();

// Helper to format remaining seconds into readable time
function formatSlaDuration(seconds) {
    if (seconds === null || seconds === undefined) return 'Paused';
    if (seconds <= 0) return 'BREACHED';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

// Generate new mock ticket ID helper
function generateTicketId() {
    const nextNum = tickets.length + 100;
    return `INC-${nextNum}`;
}
