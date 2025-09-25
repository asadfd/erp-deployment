package org.erp.service;

import org.erp.entity.Notification;
import org.erp.entity.User;
import org.erp.repository.NotificationRepository;
import org.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByRecipientAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndIsRead(user, false);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotifications(user);
        LocalDateTime now = LocalDateTime.now();
        
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(now);
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }
    
    public void createNotification(String username, String message) {
        User recipient = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle("Inventory Request Update");
        notification.setMessage(message);
        notification.setType(Notification.NotificationType.EMPLOYEE_REQUEST_APPROVED);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
    
    public void createPurchaseOrderApprovalNotification(String recipientUsername, String poNumber, String requesterUsername) {
        User recipient = userRepository.findByUsername(recipientUsername)
            .orElseThrow(() -> new RuntimeException("User not found: " + recipientUsername));
        
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle("Purchase Order Approval Required");
        notification.setMessage("Purchase Order " + poNumber + " created by " + requesterUsername + " requires your approval.");
        notification.setType(Notification.NotificationType.EMPLOYEE_REQUEST_APPROVAL);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
    
    public void notifyAllSuperAdminsForPOApproval(String poNumber, String requesterUsername) {
        List<User> superAdmins = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                    .anyMatch(role -> "SUPER_ADMIN".equals(role.getName())))
                .toList();
        
        superAdmins.forEach(superAdmin -> 
            createPurchaseOrderApprovalNotification(superAdmin.getUsername(), poNumber, requesterUsername));
    }
}