package com.dexio.app.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class PasswordUtil {

    public static String hashPassword(String password) {
        if (password == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao criptografar senha", e);
        }
    }
    
    public static boolean checkPassword(String plainText, String hashedOrPlain) {
        if (plainText == null || hashedOrPlain == null) return false;
        // Permite login com senhas antigas em texto plano temporariamente (opcional, para não quebrar usuários existentes)
        if (plainText.equals(hashedOrPlain)) {
            return true;
        }
        return hashPassword(plainText).equals(hashedOrPlain);
    }
}
