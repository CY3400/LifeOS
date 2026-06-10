package com.charbel.lifeos.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.charbel.lifeos.dto.GoalProgressProjection;
import com.charbel.lifeos.entity.TaskSchedule;

public interface TaskScheduleRepository extends JpaRepository<TaskSchedule, Long> {
    List<TaskSchedule> findByTaskId(Long taskId);

    List<TaskSchedule> findByTaskUserId(Long userId);

    Optional<TaskSchedule> findByIdAndTaskUserId(Long id, Long userId);

    List<TaskSchedule> findByTaskUserIdAndTaskDateOrderByStartTimeAscTaskTitleAsc(Long userId, LocalDate taskDate);

    boolean existsByTaskIdAndTaskDateAndStartTimeAndEndTime(Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime);

    boolean existsByTaskIdAndTaskUserId(Long taskId, Long userId);

    boolean existsByTaskIdAndTaskUserIdAndCompletedFalseAndTaskDateGreaterThanEqual(Long taskId, Long userId, LocalDate taskDate);

    List<TaskSchedule> findByTaskUserIdAndSeriesIdAndTaskDateGreaterThanEqual(Long userId, String seriesId, LocalDate taskDate);

    @Query(value="""
    SELECT TS.*
    FROM TASK_SCHEDULES TS
    INNER JOIN TASKS T ON T.ID = TS.TASK_ID
    WHERE TS.TASK_DATE BETWEEN :startDate AND :endDate AND T.USER_ID = :userId
    ORDER BY TS.TASK_DATE, TS.START_TIME, T.TITLE
    """, nativeQuery = true)
    List<TaskSchedule> getTaskSchedulesBetweenDates(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value="""
    SELECT goalId, totalPlannings, completedPlannings, totalPlannings - completedPlannings AS remainingPlannings, CASE WHEN totalPlannings = 0 THEN 0 ELSE ROUND(completedPlannings/totalPlannings*100, 2) END progressRate
    FROM (SELECT T.GOAL_ID AS goalId, COUNT(TS.ID) AS totalPlannings, SUM(CASE WHEN TS.COMPLETED = 1 THEN 1 ELSE 0 END) AS completedPlannings
    FROM LIFEOS.TASKS T
    INNER JOIN LIFEOS.TASK_SCHEDULES TS ON TS.TASK_ID = T.ID
    WHERE T.USER_ID = :userId AND T.GOAL_ID IS NOT NULL AND T.STATUS = :status
    GROUP BY T.GOAL_ID) SUB
    """, nativeQuery = true)
    List<GoalProgressProjection> getGoalProgress(@Param("userId") Long userId, @Param("status") String status);

    Optional<TaskSchedule> findTopByTaskIdAndSeriesIdIsNotNullOrderByCreatedAtDesc(Long taskId);

    List<TaskSchedule> findByTaskIdAndCompletedFalseAndSeriesIdIsNull(Long taskId);
}
