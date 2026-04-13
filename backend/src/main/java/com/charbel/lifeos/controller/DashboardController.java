package com.charbel.lifeos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.DashboardResponse;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.service.CurrentUserService;
import com.charbel.lifeos.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    public DashboardController(DashboardService dashboardService, CurrentUserService currentUserService) {
        this.dashboardService = dashboardService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/today")
    public ResponseEntity<DashboardResponse> getTodayDashboardForUser(Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        DashboardResponse response = dashboardService.getDashboardForUser(user);

        return ResponseEntity.ok(response);
    }
}