package com.unpredictableXCoder.FocusPlannerBackend.login.service.imps;

import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.UserDTO;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import com.unpredictableXCoder.FocusPlannerBackend.login.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceIMPTest {

    @Test
    void createUserShouldEncodePasswordBeforeSaving() {
        UserRepository userRepository = mock(UserRepository.class);
        ModelMapper modelMapper = mock(ModelMapper.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserServiceIMP userService = new UserServiceIMP(userRepository, modelMapper, passwordEncoder);

        UserDTO request = UserDTO.builder()
                .email("test@example.com")
                .name("Test User")
                .password("plain-password")
                .build();

        User mappedUser = new User();
        mappedUser.setEmail(request.getEmail());
        mappedUser.setPassword(request.getPassword());

        when(modelMapper.map(request, User.class)).thenReturn(mappedUser);
        when(modelMapper.map(any(User.class), eq(UserDTO.class))).thenReturn(UserDTO.builder().email("test@example.com").build());
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("plain-password")).thenReturn("$2a$10$encodedHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDTO result = userService.createUser(request);

        assertEquals("$2a$10$encodedHash", mappedUser.getPassword());
        assertEquals("test@example.com", result.getEmail());
        verify(passwordEncoder).encode("plain-password");
        verify(userRepository).save(any(User.class));
    }
}
