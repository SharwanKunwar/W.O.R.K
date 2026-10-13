package com.unpredictableXCoder.FocusPlannerBackend.login.service;

import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.UserDTO;

public interface UserServiceHelper
{
    UserDTO createUser(UserDTO userDTO);
    Iterable<UserDTO> getAllUsers();
    UserDTO getUserByEmail(String email);
    UserDTO updateUser(UserDTO userDTO, String userId);
    void deleteUser(String userId);
    UserDTO getUserById(String id);

}
