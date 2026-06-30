package com.equinox.bank.controller;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.equinox.bank.entity.AuthRequest;
import com.equinox.bank.entity.User;
import com.equinox.bank.entity.UserInfo;
import com.equinox.bank.repository.UserRepo;
import com.equinox.bank.service.JwtService;
import com.equinox.bank.service.UserInfoService;




@RestController
@RequestMapping("/auth")
public class UserController {
    private UserInfoService service;
    private JwtService jwtService;
    private AuthenticationManager authenticationManager;
    
    private final UserRepo repo;

    @GetMapping("/welcome")
    public String welcome(){
        return "Welcome this endpiont is not secure";
    }
    @PostMapping("/addNewUser")
    public String addNewUser(@RequestBody UserInfo userInfo){
        return service.addUser(userInfo);
    }

    @PostMapping("/generateToken")
    public String authenticateAndGetToken(@RequestBody AuthRequest authRequest){
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        if (authentication.isAuthenticated()){
            return jwtService.generateToken(authRequest.getUsername());
        } else {
            throw new UsernameNotFoundException("Invalid Uesr Request");
        }
    }

    public UserController(UserRepo repo){
        this.repo = repo;
    }
    @PostMapping
    public User addUser(@RequestBody User user){
        return repo.save(user);
    }
    @GetMapping
    public List<User> getAllUser(){
        return repo.findAll();

    }
    
}
