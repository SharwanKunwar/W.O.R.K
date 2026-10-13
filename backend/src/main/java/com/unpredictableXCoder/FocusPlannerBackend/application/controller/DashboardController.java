package com.unpredictableXCoder.FocusPlannerBackend.application.controller;

import com.unpredictableXCoder.FocusPlannerBackend.application.dto.DashboardResponse;
import com.unpredictableXCoder.FocusPlannerBackend.application.service.TaskServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final TaskServiceHelper taskService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(taskService.getDashboardStats());
    }
}
