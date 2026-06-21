package com.helpdesk.service;

import com.helpdesk.model.User;
import com.helpdesk.util.DBConnection;
import com.helpdesk.util.PasswordHasher;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Service handling user login and authentication verification against MySQL database.
 */
public class AuthService {

    /**
     * Authenticates a user using email and password.
     * @param email User email
     * @param password Plaintext password
     * @return User object if authentication is successful, null otherwise
     */
    public User authenticate(String email, String password) {
        if (email == null || password == null) {
            return null;
        }

        String query = "SELECT * FROM users WHERE email = ? AND status = 'active'";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, email);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password_hash");
                    
                    // Verify plaintext password against DB SHA-256 hash
                    if (PasswordHasher.verifyPassword(password, storedHash)) {
                        User user = new User();
                        user.setUserId(rs.getInt("user_id"));
                        user.setRoleId(rs.getInt("role_id"));
                        user.setFirstName(rs.getString("first_name"));
                        user.setLastName(rs.getString("last_name"));
                        user.setEmail(rs.getString("email"));
                        user.setPasswordHash(storedHash);
                        user.setStatus(rs.getString("status"));
                        user.setCreatedAt(rs.getTimestamp("created_at"));
                        user.setUpdatedAt(rs.getTimestamp("updated_at"));
                        return user;
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error during user authentication: " + e.getMessage());
            e.printStackTrace();
        }
        return null; // Auth failed or exception occurred
    }
}
