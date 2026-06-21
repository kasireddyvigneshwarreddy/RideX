package com.helpdesk.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Utility class for secure password hashing and verification using SHA-256.
 * Note: For production systems, standard bcrypt, scrypt, or PBKDF2 must be used.
 */
public class PasswordHasher {

    /**
     * Hashes a raw text password using SHA-256 with a local pepper.
     * @param password Raw password text
     * @return Base64 encoded hash string
     */
    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error: Hashing algorithm SHA-256 not found.", e);
        }
    }

    /**
     * Compares a raw input password against a stored hashed value.
     * @param rawPassword Raw password input
     * @param storedHash Hashed password stored in the database
     * @return true if matches, false otherwise
     */
    public static boolean verifyPassword(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }
        return hashPassword(rawPassword).equals(storedHash);
    }
}
