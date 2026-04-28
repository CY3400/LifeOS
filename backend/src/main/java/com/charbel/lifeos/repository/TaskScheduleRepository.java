package com.charbel.lifeos.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.charbel.lifeos.entity.TaskSchedule;

public interface TaskScheduleRepository extends JpaRepository<TaskSchedule, Long> {
    List<TaskSchedule> findByTaskId(Long taskId);

    List<TaskSchedule> findByTaskUserId(Long userId);

    Optional<TaskSchedule> findByIdAndTaskUserId(Long id, Long userId);

    List<TaskSchedule> findByTaskUserIdAndTaskDateOrderByStartTimeAscTaskTitleAsc(Long userId, LocalDate taskDate);

    boolean existsByTaskIdAndTaskDateAndStartTimeAndEndTime(Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime);

    boolean existsByTaskIdAndTaskUserId(Long taskId, Long userId);

    List<TaskSchedule> findByTaskUserIdAndSeriesIdAndTaskDateGreaterThanEqual(Long userId, String seriesId, LocalDate taskDate);

    @Query(value="""
    SELECT TS.*
    FROM TASK_SCHEDULES TS
    INNER JOIN TASKS T ON T.ID = TS.TASK_ID
    WHERE TASK_DATE BETWEEN :startDate AND :endDate AND T.USER_ID = :userId
    ORDER BY TS.TASK_DATE, TS.START_TIME, T.TITLE
    """, nativeQuery = true)
    List<TaskSchedule> getTaskSchedulesBetweenDates(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
