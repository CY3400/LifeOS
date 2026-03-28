package com.charbel.lifeos.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charbel.lifeos.entity.DailyTask;

public interface DailyTaskRepository extends JpaRepository<DailyTask, Long>{
    List<DailyTask> findByUserId(Long userId);

    Optional<DailyTask> findByIdAndUserId(Long id, Long userId);

    List<DailyTask> findByTaskDateAndUserIdOrderByStartTime(LocalDate taskDate, Long userId);
}
