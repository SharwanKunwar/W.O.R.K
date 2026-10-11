package com.unpredictableXCoder.FocusPlannerBackend.login.security;

import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import com.unpredictableXCoder.FocusPlannerBackend.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService
{
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException
    {
        User user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("Invalid Email or password"));
        return user;
    }
}
