package com.unpredictableXCoder.FocusPlannerBackend.login.service;

import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.AuthResponse;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.LoginRequest;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.RegisterRequest;

public interface AuthServiceHelper {
    AuthResponse registerUser(RegisterRequest request);
    AuthResponse loginUser(LoginRequest request);
}
