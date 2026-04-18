package com.service;

import com.entity.*;
import com.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubgroupRepository subgroupRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;

    public TaskService(TaskRepository taskRepository,
                       SubgroupRepository subgroupRepository,
                       UserRepository userRepository,
                       AttachmentRepository attachmentRepository) {
        this.taskRepository = taskRepository;
        this.subgroupRepository = subgroupRepository;
        this.userRepository = userRepository;
        this.attachmentRepository = attachmentRepository;
    }
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;
    @Transactional
    public Attachment addAttachment(Long taskId, MultipartFile file) throws IOException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        String originalFileName = file.getOriginalFilename();
        String safeFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        Path targetPath = Paths.get(uploadDir, safeFileName);
        Files.createDirectories(targetPath.getParent());
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        Attachment attachment = new Attachment();
        attachment.setFileName(originalFileName);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setStoragePath(targetPath.toString());
        attachment.setTask(task);
        return attachmentRepository.save(attachment);
    }

    public byte[] getAttachmentContent(Long attachmentId) throws IOException {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        Path path = Paths.get(attachment.getStoragePath());
        return Files.readAllBytes(path);
    }

    public Attachment getAttachmentById(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) throws IOException {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        Files.deleteIfExists(Paths.get(attachment.getStoragePath()));
        attachmentRepository.delete(attachment);
    }

    public List<Attachment> getAttachmentsByTask(Long taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }

    @Transactional
    public Task createTask(Long subgroupId, Long createdByUserId, String title,
                           String description, OffsetDateTime dueDate, Integer value,
                           TaskStatus status, List<Long> assigneeIds) {
        Subgroup subgroup = subgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Subgroup not found"));
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("Creator user not found"));

        Task task = new Task(title, description, subgroup, createdBy);
        task.setDueDate(dueDate);
        task.setValue(value);
        task.setStatus(status != null ? status.getCode() : TaskStatus.TODO.getCode());
        if (assigneeIds != null && !assigneeIds.isEmpty()) {
            List<User> assignees = userRepository.findAllById(assigneeIds);
            task.getAssignees().addAll(assignees);
        }
        return taskRepository.save(task);
    }


    @Transactional
    public Task updateTask(Long id, Long subgroupId, String title, String description,
                           OffsetDateTime dueDate, Integer value, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (subgroupId != null) {
            Subgroup subgroup = subgroupRepository.findById(subgroupId)
                    .orElseThrow(() -> new RuntimeException("Subgroup not found"));
            task.setSubgroup(subgroup);
        }
        if (title != null) task.setTitle(title);
        if (description != null) task.setDescription(description);
        if (dueDate != null) task.setDueDate(dueDate);
        if (value != null) task.setValue(value);
        if (status != null) task.setStatus(status.getCode());
        // удалён вызов task.setUpdatedAt(...)
        return taskRepository.save(task);
    }

    @Transactional
    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> findTasksBySubgroup(Long subgroupId) {
        return taskRepository.findBySubgroupId(subgroupId);
    }

    public List<Task> findTasksByAssignee(Long userId) {
        return taskRepository.findByAssigneesId(userId);
    }

    public List<Task> findTasksByCreator(Long createdByUserId) {
        return taskRepository.findByCreatedByUserId(createdByUserId);
    }

    @Transactional
    public Task assignUserToTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.getAssignees().add(user);
        // удалён вызов task.setUpdatedAt(...)
        return taskRepository.save(task);
    }

    @Transactional
    public Task unassignUserFromTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.getAssignees().remove(user);
        // удалён вызов task.setUpdatedAt(...)
        return taskRepository.save(task);
    }

    @Transactional
    public Task setTaskAssignees(Long taskId, List<Long> userIds) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        List<User> assignees = userRepository.findAllById(userIds);
        task.setAssignees(assignees);
        // удалён вызов task.setUpdatedAt(...)
        return taskRepository.save(task);
    }
}