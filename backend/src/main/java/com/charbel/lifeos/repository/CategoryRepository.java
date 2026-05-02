package com.charbel.lifeos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Status;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdAndStatusOrderByTitleAsc(Long userId, Status status);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    Optional<Category> findByIdAndUserIdAndStatus(Long id, Long userId, Status status);

    boolean existsByUserIdAndTitle(Long userId, String title);
}
