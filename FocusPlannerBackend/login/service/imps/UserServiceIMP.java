package com.unpredictableXCoder.FocusPlannerBackend.login.service.imps;

import com.unpredictableXCoder.FocusPlannerBackend.exceptions.BadRequestException;
import com.unpredictableXCoder.FocusPlannerBackend.exceptions.ResourceNotFoundException;
import com.unpredictableXCoder.FocusPlannerBackend.exceptions.UserAlreadyExistsException;
import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.UserDTO;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.Provider;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import com.unpredictableXCoder.FocusPlannerBackend.login.helper.UserHelper;
import com.unpredictableXCoder.FocusPlannerBackend.login.repository.UserRepository;
import com.unpredictableXCoder.FocusPlannerBackend.login.service.UserServiceHelper;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceIMP implements UserServiceHelper {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDTO createUser(UserDTO userDTO)
    {
        if(userDTO.getEmail() == null || userDTO.getEmail().isBlank()) throw new BadRequestException("Email is required");
        if(userRepository.existsByEmail(userDTO.getEmail())) throw new UserAlreadyExistsException("Email already exists");

        User user = modelMapper.map(userDTO, User.class);
        if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setProvider(userDTO.getProvider() != null ? userDTO.getProvider() : Provider.LOCAL );

        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<UserDTO> getAllUsers()
    {
        return userRepository.findAll()
                .stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email)
    {
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found with email: " + email));
        User savedUser = modelMapper.map(user, User.class);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UserDTO userDTO, String userId)
    {
        UUID uId = UUID.fromString(userId);
        User existingUser = userRepository.findById(uId).orElseThrow(()-> new ResourceNotFoundException("User not found with id: " + uId));
        // email must not be changed
        if(userDTO.getName() != null) existingUser.setName(userDTO.getName());
        if(userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        if(userDTO.getProvider() != null) existingUser.setProvider(userDTO.getProvider());
        if(userDTO.getImage() != null) existingUser.setImage(userDTO.getImage());
        existingUser.setEnabled(userDTO.isEnable());
        User user = userRepository.save(existingUser);
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    @Transactional
    public void deleteUser(String userId)
    {
        UUID uId = UserHelper.parseUUID(userId);
        User user = userRepository.findById(uId).orElseThrow(()-> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(String id)
    {
        UUID uId = UserHelper.parseUUID(id);
        User user = userRepository.findById(uId).orElseThrow(()-> new ResourceNotFoundException("User not found with id: " + id));
        return modelMapper.map(user, UserDTO.class);
    }



}
