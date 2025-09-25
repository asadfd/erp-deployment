package org.erp.service;

import org.erp.entity.*;
import org.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private CashFlowRepository cashFlowRepository;
    
    @Autowired
    private TimesheetRepository timesheetRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private ProjectInventoryItemRepository projectInventoryItemRepository;

    public Map<String, Object> getCashFlowReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        
        List<CashFlow> cashFlows = cashFlowRepository.findByTransactionDateBetween(startDate, endDate);
        List<Map<String, Object>> projectSummaries = new ArrayList<>();
        
        Map<Long, List<CashFlow>> projectCashFlows = new HashMap<>();
        for (CashFlow cf : cashFlows) {
            projectCashFlows.computeIfAbsent(cf.getProject().getId(), k -> new ArrayList<>()).add(cf);
        }
        
        for (Map.Entry<Long, List<CashFlow>> entry : projectCashFlows.entrySet()) {
            Project project = projectRepository.findById(entry.getKey()).orElse(null);
            if (project != null) {
                Map<String, Object> summary = new HashMap<>();
                summary.put("projectId", project.getId());
                summary.put("projectDescription", project.getProjectDescription());
                
                BigDecimal totalInflow = BigDecimal.ZERO;
                BigDecimal totalOutflow = BigDecimal.ZERO;
                
                for (CashFlow cf : entry.getValue()) {
                    if (cf.getType() == CashFlow.CashFlowType.INFLOW) {
                        totalInflow = totalInflow.add(cf.getAmount());
                    } else {
                        totalOutflow = totalOutflow.add(cf.getAmount());
                    }
                }
                
                summary.put("totalInflow", totalInflow);
                summary.put("totalOutflow", totalOutflow);
                summary.put("netCashFlow", totalInflow.subtract(totalOutflow));
                summary.put("transactions", entry.getValue());
                
                projectSummaries.add(summary);
            }
        }
        
        report.put("projectSummaries", projectSummaries);
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        
        return report;
    }

    public Map<String, Object> getEmployeeHoursReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        
        List<Timesheet> timesheets = timesheetRepository.findByWorkDateBetween(startDate, endDate);
        List<Map<String, Object>> employeeSummaries = new ArrayList<>();
        
        Map<Long, List<Timesheet>> employeeTimesheets = new HashMap<>();
        for (Timesheet ts : timesheets) {
            employeeTimesheets.computeIfAbsent(ts.getEmployee().getId(), k -> new ArrayList<>()).add(ts);
        }
        
        for (Map.Entry<Long, List<Timesheet>> entry : employeeTimesheets.entrySet()) {
            Employee employee = entry.getValue().get(0).getEmployee();
            
            Map<Long, List<Timesheet>> projectTimesheets = new HashMap<>();
            for (Timesheet ts : entry.getValue()) {
                projectTimesheets.computeIfAbsent(ts.getProject().getId(), k -> new ArrayList<>()).add(ts);
            }
            
            List<Map<String, Object>> projectDetails = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal totalHours = BigDecimal.ZERO;
            
            for (Map.Entry<Long, List<Timesheet>> projectEntry : projectTimesheets.entrySet()) {
                Project project = projectEntry.getValue().get(0).getProject();
                Map<String, Object> projectDetail = new HashMap<>();
                projectDetail.put("projectId", project.getId());
                projectDetail.put("projectDescription", project.getProjectDescription());
                
                BigDecimal projectHours = BigDecimal.ZERO;
                BigDecimal projectAmount = BigDecimal.ZERO;
                BigDecimal dailyRate = BigDecimal.ZERO;
                BigDecimal hourlyRate = BigDecimal.ZERO;
                
                for (Timesheet ts : projectEntry.getValue()) {
                    projectHours = projectHours.add(ts.getHoursWorked());
                    projectAmount = projectAmount.add(ts.getTotalAmount());
                    dailyRate = ts.getDailyRate() != null ? ts.getDailyRate() : dailyRate;
                    hourlyRate = ts.getHourlyRate() != null ? ts.getHourlyRate() : hourlyRate;
                }
                
                projectDetail.put("hoursWorked", projectHours);
                projectDetail.put("totalAmount", projectAmount);
                projectDetail.put("dailyRate", dailyRate);
                projectDetail.put("hourlyRate", hourlyRate);
                projectDetail.put("daysWorked", projectHours.divide(BigDecimal.valueOf(8), 2, BigDecimal.ROUND_HALF_UP));
                
                projectDetails.add(projectDetail);
                totalAmount = totalAmount.add(projectAmount);
                totalHours = totalHours.add(projectHours);
            }
            
            Map<String, Object> employeeSummary = new HashMap<>();
            employeeSummary.put("employeeId", employee.getId());
            employeeSummary.put("employeeName", employee.getName());
            employeeSummary.put("empId", employee.getEmpId());
            employeeSummary.put("totalHours", totalHours);
            employeeSummary.put("totalAmount", totalAmount);
            employeeSummary.put("projectDetails", projectDetails);
            
            employeeSummaries.add(employeeSummary);
        }
        
        report.put("employeeSummaries", employeeSummaries);
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        
        return report;
    }

    public Map<String, Object> getProjectBreakdownReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        
        List<Project> projects = projectRepository.findAll();
        List<Map<String, Object>> projectBreakdowns = new ArrayList<>();
        
        for (Project project : projects) {
            Map<String, Object> breakdown = new HashMap<>();
            breakdown.put("projectId", project.getId());
            breakdown.put("projectDescription", project.getProjectDescription());
            breakdown.put("projectType", project.getProjectType());
            breakdown.put("projectStage", project.getProjectStage());
            breakdown.put("projectBudget", project.getProjectBudget());
            
            List<CashFlow> cashFlows = cashFlowRepository.findByProjectIdAndDateRange(project.getId(), startDate, endDate);
            BigDecimal totalInflow = BigDecimal.ZERO;
            BigDecimal totalOutflow = BigDecimal.ZERO;
            
            for (CashFlow cf : cashFlows) {
                if (cf.getType() == CashFlow.CashFlowType.INFLOW) {
                    totalInflow = totalInflow.add(cf.getAmount());
                } else {
                    totalOutflow = totalOutflow.add(cf.getAmount());
                }
            }
            
            breakdown.put("cashInflow", totalInflow);
            breakdown.put("cashOutflow", totalOutflow);
            breakdown.put("netCashFlow", totalInflow.subtract(totalOutflow));
            
            List<ProjectInventoryItem> inventoryItems = projectInventoryItemRepository.findByProject(project);
            BigDecimal totalInventoryValue = BigDecimal.ZERO;
            int totalInventoryItems = 0;
            
            for (ProjectInventoryItem item : inventoryItems) {
                totalInventoryValue = totalInventoryValue.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);
                totalInventoryItems += item.getAllocatedQuantity() != null ? item.getAllocatedQuantity() : 0;
            }
            
            breakdown.put("totalInventoryItems", totalInventoryItems);
            breakdown.put("totalInventoryValue", totalInventoryValue);
            
            List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByProjectAndCreatedDateBetween(project, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
            BigDecimal totalPOValue = BigDecimal.ZERO;
            
            for (PurchaseOrder po : purchaseOrders) {
                totalPOValue = totalPOValue.add(po.getTotalAmount() != null ? po.getTotalAmount() : BigDecimal.ZERO);
            }
            
            breakdown.put("purchaseOrderCount", purchaseOrders.size());
            breakdown.put("totalPOValue", totalPOValue);
            
            List<Timesheet> timesheets = timesheetRepository.findByProjectAndWorkDateBetween(project, startDate, endDate);
            BigDecimal laborCost = BigDecimal.ZERO;
            BigDecimal totalHours = BigDecimal.ZERO;
            
            for (Timesheet ts : timesheets) {
                laborCost = laborCost.add(ts.getTotalAmount() != null ? ts.getTotalAmount() : BigDecimal.ZERO);
                totalHours = totalHours.add(ts.getHoursWorked() != null ? ts.getHoursWorked() : BigDecimal.ZERO);
            }
            
            breakdown.put("laborCost", laborCost);
            breakdown.put("totalLaborHours", totalHours);
            
            BigDecimal totalExpenses = totalOutflow.add(totalPOValue).add(laborCost).add(totalInventoryValue);
            breakdown.put("totalExpenses", totalExpenses);
            breakdown.put("profitLoss", totalInflow.subtract(totalExpenses));
            
            projectBreakdowns.add(breakdown);
        }
        
        report.put("projectBreakdowns", projectBreakdowns);
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        
        return report;
    }
}