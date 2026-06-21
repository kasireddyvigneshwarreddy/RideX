package com.helpdesk.service;

import com.helpdesk.model.Ticket;
import com.helpdesk.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

/**
 * Service handling ticket creation operations in the MySQL database.
 */
public class TicketService {

    /**
     * Creates a new support ticket and dynamically computes SLA deadlines.
     * @param ticket Ticket object containing basic details (title, description, requester, category, priority, policy)
     * @return Fully populated Ticket object including generated ID and SLA deadlines, or null on failure
     */
    public Ticket createTicket(Ticket ticket) {
        String sql = "INSERT INTO tickets (title, description, status, priority, requester_id, agent_id, category_id, sla_policy_id, sla_response_deadline, sla_resolution_deadline) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection()) {
            // Start transaction
            conn.setAutoCommit(false);
            
            try {
                // 1. Calculate SLA deadlines dynamically based on the policy rules
                calculateAndSetSla(conn, ticket);
                
                // 2. Perform Insert statement
                try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    pstmt.setString(1, ticket.getTitle());
                    pstmt.setString(2, ticket.getDescription());
                    pstmt.setString(3, ticket.getStatus() != null ? ticket.getStatus() : "new");
                    pstmt.setString(4, ticket.getPriority() != null ? ticket.getPriority() : "medium");
                    pstmt.setInt(5, ticket.getRequesterId());
                    
                    if (ticket.getAgentId() != null) {
                        pstmt.setInt(6, ticket.getAgentId());
                    } else {
                        pstmt.setNull(6, java.sql.Types.INTEGER);
                    }
                    
                    pstmt.setInt(7, ticket.getCategoryId());
                    pstmt.setInt(8, ticket.getSlaPolicyId());
                    pstmt.setTimestamp(9, ticket.getSlaResponseDeadline());
                    pstmt.setTimestamp(10, ticket.getSlaResolutionDeadline());
                    
                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows == 0) {
                        throw new SQLException("Creating ticket failed, no rows affected.");
                    }

                    // Retrieve generated Primary Key ID
                    try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            ticket.setTicketId(generatedKeys.getInt(1));
                        } else {
                            throw new SQLException("Creating ticket failed, no ID obtained.");
                        }
                    }
                }
                
                // Commit transaction
                conn.commit();
                return ticket;
                
            } catch (SQLException e) {
                // Rollback on any failure
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            System.err.println("Database error during ticket creation: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Helper method to lookup configured SLA policy hours and calculate dynamic deadlines.
     */
    private void calculateAndSetSla(Connection conn, Ticket ticket) throws SQLException {
        String policySql = "SELECT response_time_hours, resolution_time_hours FROM sla_policies WHERE sla_policy_id = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(policySql)) {
            pstmt.setInt(1, ticket.getSlaPolicyId());
            
            try (ResultSet rs = pstmt.executeQuery()) {
                long nowMs = System.currentTimeMillis();
                int responseHours = 8;     // Default fallback
                int resolutionHours = 24;  // Default fallback
                
                if (rs.next()) {
                    responseHours = rs.getInt("response_time_hours");
                    resolutionHours = rs.getInt("resolution_time_hours");
                }
                
                // Compute milliseconds (1 hour = 3,600,000 ms)
                ticket.setSlaResponseDeadline(new Timestamp(nowMs + (responseHours * 3600000L)));
                ticket.setSlaResolutionDeadline(new Timestamp(nowMs + (resolutionHours * 3600000L)));
            }
        }
    }
}
