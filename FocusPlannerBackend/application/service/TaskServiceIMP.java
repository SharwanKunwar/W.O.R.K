package com.unpredictableXCoder.FocusPlannerBackend.application.service;

import com.unpredictableXCoder.FocusPlannerBackend.application.dto.CompleteTaskNoteAdd;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.DashboardResponse;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskFilterRequest;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskRequestDTO;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskResponseDTO;
import com.unpredictableXCoder.FocusPlannerBackend.application.entity.TaskEntity;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;
import com.unpredictableXCoder.FocusPlannerBackend.application.mapper.TaskMapper;
import com.unpredictableXCoder.FocusPlannerBackend.application.repository.TaskRepository;
import com.unpredictableXCoder.FocusPlannerBackend.application.repository.TaskSpecification;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import com.unpredictableXCoder.FocusPlannerBackend.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskServiceIMP implements TaskServiceHelper {

    private final TaskRepository repository;
    private final UserRepository userRepository;
    private final TaskMapper mapper;

    private User getAuthenticatedUser()
    {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("Not authenticated");
    }

    private TaskEntity getTaskOwnedByUser(Long id, User user) {
        return repository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task with id " + id + " not found or access denied"));
    }

    @Override
    public TaskResponseDTO createTask(TaskRequestDTO request) {
        User user = getAuthenticatedUser();
        TaskEntity task = mapper.mapToEntity(request);
        task.setUser(user);
        TaskEntity savedTask = repository.save(task);
        return mapper.mapToResponse(savedTask);
    }

    @Override
    public List<TaskResponseDTO> getAllTasks() {
        User user = getAuthenticatedUser();
        List<TaskEntity> tasks = repository.findByUser_Id(user.getId());
        return tasks.stream().map(mapper::mapToResponse).toList();
    }

    @Override
    public List<TaskResponseDTO> getAllTasksByForWhen(ForWhen forWhen) {
        TaskFilterRequest request = new TaskFilterRequest();
        request.setForWhen(forWhen);
        return filterTasks(request);
    }

    @Override
    public TaskResponseDTO getTaskById(Long id) {
        User user = getAuthenticatedUser();
        return mapper.mapToResponse(getTaskOwnedByUser(id, user));
    }

    @Override
    public TaskResponseDTO startTask(Long id) {
        User user = getAuthenticatedUser();
        TaskEntity task = getTaskOwnedByUser(id, user);

        if (task.getStatus() == Status.COMPLETED) {
            throw new IllegalStateException("Completed tasks cannot be started.");
        }

        task.setStatus(Status.IN_PROGRESS);
        task.setStartedAt(LocalDateTime.now());

        return mapper.mapToResponse(repository.save(task));
    }

    @Override
    public TaskResponseDTO completeTask(Long id, CompleteTaskNoteAdd taskNote) {
        User user = getAuthenticatedUser();
        TaskEntity task = getTaskOwnedByUser(id, user);

        if (task.getStatus() == Status.COMPLETED) {
            throw new IllegalStateException("Task is already completed.");
        }
        if (task.getStatus() == Status.PENDING) {
            throw new IllegalStateException("Task is in pending state you cannot complete task at this moment.");
        }

        task.setStatus(Status.COMPLETED);
        task.setFinishedAt(LocalDateTime.now());

        if (taskNote != null && taskNote.getTaskNote() != null && !taskNote.getTaskNote().isBlank()) {
            task.setTaskNote(taskNote.getTaskNote().trim());
        }

        return mapper.mapToResponse(repository.save(task));
    }

    @Override
    public void deleteTaskById(Long id) {
        User user = getAuthenticatedUser();
        TaskEntity task = getTaskOwnedByUser(id, user);
        repository.delete(task);
    }

    @Override
    public List<TaskResponseDTO> filterTasks(TaskFilterRequest filter) {
        User user = getAuthenticatedUser();
        List<TaskEntity> tasks = repository.findAll(TaskSpecification.filterBy(filter, user.getId()));
        return tasks.stream().map(mapper::mapToResponse).toList();
    }

    @Override
    public DashboardResponse getDashboardStats() {
        User user = getAuthenticatedUser();
        UUID userId = user.getId();
        return DashboardResponse.builder()
                .totalTasks(repository.countByUser_Id(userId))
                .pendingTasks(repository.countByUser_IdAndStatus(userId, Status.PENDING))
                .inProgressTasks(repository.countByUser_IdAndStatus(userId, Status.IN_PROGRESS))
                .completedTasks(repository.countByUser_IdAndStatus(userId, Status.COMPLETED))
                .todayTasks(repository.countByUser_IdAndForWhen(userId, ForWhen.TODAY))
                .tomorrowTasks(repository.countByUser_IdAndForWhen(userId, ForWhen.TOMORROW))
                .build();
    }
}
