package com.unpredictableXCoder.FocusPlannerBackend.login.service.imps;

import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.AuthResponse;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.LoginRequest;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.RegisterRequest;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.UserDTO;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import com.unpredictableXCoder.FocusPlannerBackend.login.repository.UserRepository;
import com.unpredictableXCoder.FocusPlannerBackend.login.security.JwtUtil;
import com.unpredictableXCoder.FocusPlannerBackend.login.service.AuthServiceHelper;
import com.unpredictableXCoder.FocusPlannerBackend.login.service.UserServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceIMP implements AuthServiceHelper {

    private final UserServiceHelper userServiceHelper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        UserDTO userDTO = UserDTO.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
        UserDTO createdUser = userServiceHelper.createUser(userDTO);

        UserDetails userDetails = userDetailsService.loadUserByUsername(createdUser.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(jwtToken) // Optional, using same for now
                .user(createdUser)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (isLegacyPlaintextPassword(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        UserDTO userDTO = userServiceHelper.getUserByEmail(request.getEmail());

        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(jwtToken)
                .user(userDTO)
                .build();
    }

    private boolean isLegacyPlaintextPassword(String storedPassword) {
        return storedPassword != null && !storedPassword.isBlank() && !storedPassword.startsWith("$2")
                && !storedPassword.startsWith("{bcrypt}");
    }
}
