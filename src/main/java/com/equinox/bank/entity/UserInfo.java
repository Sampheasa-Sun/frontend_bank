package com.equinox.bank.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String email;
    private String password;
    private String roles;
    public String getEmail() { return email; } // Or getName() / getUsername() depending on your setup
    public String getPassword() { return password; }
    public String getRoles() { return roles; }
    
    // Also ensure you have a setPassword method for when you encode it!
    public void setPassword(String password) { this.password = password; }
}
