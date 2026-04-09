package com.charbel.lifeos.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charbel.lifeos.entity.TaskSchedule;

public interface TaskScheduleRepository extends JpaRepository<TaskSchedule, Long> {
    List<TaskSchedule> findByTaskId(Long taskId);

    List<TaskSchedule> findByTaskUserId(Long userId);

    Optional<TaskSchedule> findByIdAndTaskUserId(Long id, Long userId);

    List<TaskSchedule> findByTaskUserIdAndTaskDateOrderByStartTime(Long userId, LocalDate taskDate);

    List<TaskSchedule> findByTaskIdAndTaskDateOrderByStartTime(Long taskId, LocalDate taskDate);

    boolean existsByTaskIdAndTaskDateAndStartTimeAndEndTime(Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime);
}
