package com.charbel.lifeos.mapper;

import org.springframework.stereotype.Component;

import com.charbel.lifeos.dto.CategoryResponse;
import com.charbel.lifeos.entity.Category;

@Component
public class CategoryMapper {
    public CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setTitle(category.getTitle());
        response.setStatus(category.getStatus());

        return response;
    }
}
