package org.erp.controller;

import org.erp.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/cashflow")
    public ResponseEntity<Map<String, Object>> getCashFlowReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> report = reportService.getCashFlowReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/employee-hours")
    public ResponseEntity<Map<String, Object>> getEmployeeHoursReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> report = reportService.getEmployeeHoursReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/project-breakdown")
    public ResponseEntity<Map<String, Object>> getProjectBreakdownReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> report = reportService.getProjectBreakdownReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}