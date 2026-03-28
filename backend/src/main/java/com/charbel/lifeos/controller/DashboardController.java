package com.charbel.lifeos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.DashboardResponse;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    private User getUserByAuthentication(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUser();
    }

    @GetMapping("/today")
    public ResponseEntity<DashboardResponse> getTodayDashboardForUser(Authentication auth) {
        User user = getUserByAuthentication(auth);

        DashboardResponse dr = dashboardService.getTodayDashboardForUser(user);

        return ResponseEntity.ok(dr);
    }
}
