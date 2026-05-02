package com.charbel.lifeos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charbel.lifeos.entity.Status;
import com.charbel.lifeos.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long>{
    List<Task> findByUserIdAndStatus(Long userId, Status status);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    Optional<Task> findByIdAndUserIdAndStatus(Long id, Long userId, Status status);

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);

    boolean existsByGoalIdAndUserId(Long goalId, Long userId);

    boolean existsByCategoryIdAndUserIdAndStatus(Long categoryId, Long userId, Status status);

    boolean existsByGoalIdAndUserIdAndStatus(Long goalId, Long userId, Status status);
}
