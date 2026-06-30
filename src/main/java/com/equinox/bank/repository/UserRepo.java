package com.equinox.bank.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.equinox.bank.entity.User;

/**
 * UserRepo
 */
public interface UserRepo extends JpaRepository<User, Integer> {

    
}
