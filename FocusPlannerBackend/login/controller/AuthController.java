package com.unpredictableXCoder.FocusPlannerBackend.login.controller;

import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.AuthResponse;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.LoginRequest;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.RegisterRequest;
import com.unpredictableXCoder.FocusPlannerBackend.login.service.AuthServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthServiceHelper authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginUser(request));
    }
}
