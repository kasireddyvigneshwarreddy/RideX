package com.bitlyclone.util;

public class Base62Encoder {

    private static final String ALLOWED_CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int BASE = ALLOWED_CHARACTERS.length();

    public static String encode(long input) {
        if (input == 0) {
            return "0";
        }
        StringBuilder encodedString = new StringBuilder();
        while (input > 0) {
            encodedString.append(ALLOWED_CHARACTERS.charAt((int) (input % BASE)));
            input = input / BASE;
        }
        return encodedString.reverse().toString();
    }

    public static long decode(String input) {
        long decoded = 0;
        for (int i = 0; i < input.length(); i++) {
            int charIndex = ALLOWED_CHARACTERS.indexOf(input.charAt(i));
            if (charIndex < 0) {
                throw new IllegalArgumentException("Invalid character in base62 string: " + input.charAt(i));
            }
            decoded = decoded * BASE + charIndex;
        }
        return decoded;
    }
}
