package com.bitlyclone.controller;

import com.bitlyclone.dto.AnalyticsResponse;
import com.bitlyclone.entity.User;
import com.bitlyclone.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{shortCode}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable String shortCode,
            @AuthenticationPrincipal User user
    ) {
        AnalyticsResponse response = analyticsService.getAnalytics(shortCode, user);
        return ResponseEntity.ok(response);
    }
}
