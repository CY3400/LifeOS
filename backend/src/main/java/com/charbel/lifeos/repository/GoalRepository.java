package com.charbel.lifeos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Status;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdAndStatus(Long userId, Status status);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    Optional<Goal> findByIdAndUserIdAndStatus(Long id, Long userId, Status status);

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);

    boolean existsByCategoryIdAndUserIdAndStatus(Long categoryId, Long userId, Status status);
}
