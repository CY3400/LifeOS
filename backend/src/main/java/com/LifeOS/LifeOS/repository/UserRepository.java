package com.LifeOS.LifeOS.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.LifeOS.LifeOS.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
}
