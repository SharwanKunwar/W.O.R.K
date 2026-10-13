package com.unpredictableXCoder.FocusPlannerBackend.login.controller;

import com.unpredictableXCoder.FocusPlannerBackend.login.dtos.UserDTO;
import com.unpredictableXCoder.FocusPlannerBackend.login.service.UserServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserServiceHelper  userServiceHelper;

    // post user
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(userServiceHelper.createUser(userDTO));
    }

    // get all users
    @GetMapping("/all")
    public ResponseEntity<Iterable<UserDTO>> getAllUsers()
    {
        return ResponseEntity.ok(userServiceHelper.getAllUsers());
    }

    //Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email)
    {
        return ResponseEntity.ok(userServiceHelper.getUserByEmail(email));
    }

    // Delete user
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable("userId") String userId)
    {
        userServiceHelper.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully.");
    }

    //Update user
    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable("userId") String userId, @RequestBody UserDTO userDTO)
    {
        return ResponseEntity.ok(userServiceHelper.updateUser(userDTO, userId));
    }

    //Get user by id
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("userId") String userId)
    {
        return ResponseEntity.ok(userServiceHelper.getUserById(userId));
    }

}
