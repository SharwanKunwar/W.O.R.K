package com.unpredictableXCoder.FocusPlannerBackend.login.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class LegacyPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder delegate = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return delegate.encode(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null || encodedPassword.isBlank()) {
            return false;
        }

        if (encodedPassword.startsWith("$2") || encodedPassword.startsWith("{bcrypt}")) {
            return delegate.matches(rawPassword, encodedPassword);
        }

        return rawPassword.toString().equals(encodedPassword);
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        return false;
    }
}
