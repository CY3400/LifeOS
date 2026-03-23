package com.LifeOS.LifeOS.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.LifeOS.LifeOS.entity.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    
}
