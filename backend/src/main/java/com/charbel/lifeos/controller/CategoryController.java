package com.charbel.lifeos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.CategoryResponse;
import com.charbel.lifeos.dto.CreateCategoryRequest;
import com.charbel.lifeos.dto.UpdateCategoryRequest;
import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Status;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.mapper.CategoryMapper;
import com.charbel.lifeos.service.CategoryService;
import com.charbel.lifeos.service.CurrentUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CurrentUserService currentUserService;
    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    public CategoryController(CurrentUserService currentUserService, CategoryService categoryService, CategoryMapper categoryMapper) {
        this.currentUserService = currentUserService;
        this.categoryService = categoryService;
        this.categoryMapper = categoryMapper;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);
        
        Category created = categoryService.createCategory(user, req.getTitle());

        return ResponseEntity.status(201).body(categoryMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateCategoryRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);
        
        Category updated = categoryService.updateCategory(id, user, req.getTitle());

        return ResponseEntity.ok(categoryMapper.toResponse(updated));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<CategoryResponse> archive(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        Category updated = categoryService.archiveCategory(user, id);

        return ResponseEntity.ok(categoryMapper.toResponse(updated));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<CategoryResponse> restore(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        Category updated = categoryService.restoreCategory(user, id);

        return ResponseEntity.ok(categoryMapper.toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(Authentication auth, @RequestParam(required = false) Status status) {
        User user = currentUserService.getCurrentUser(auth);

        if(status == null) {
            status = Status.ACTIVE;
        }

        List<CategoryResponse> categories = categoryService.getCategoriesByStatusForUser(user, status).stream().map(categoryMapper::toResponse).toList();

        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        Category category = categoryService.getCategoryByIdForUser(user, id);

        return ResponseEntity.ok(categoryMapper.toResponse(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        categoryService.deleteCategory(id, user);

        return ResponseEntity.noContent().build();
    }
}
