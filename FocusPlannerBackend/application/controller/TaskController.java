package com.unpredictableXCoder.FocusPlannerBackend.application.controller;

import com.unpredictableXCoder.FocusPlannerBackend.application.dto.CompleteTaskNoteAdd;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskFilterRequest;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskRequestDTO;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskResponseDTO;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Priority;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;
import com.unpredictableXCoder.FocusPlannerBackend.application.service.TaskServiceHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskServiceHelper taskService;

    // Create a new task and save it to the database
    @PostMapping
    public ResponseEntity<TaskResponseDTO> addTask(@Valid @RequestBody TaskRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(request));
    }

    // Retrieve all tasks from the database
    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Retrieve tasks filtered by "forWhen" category (e.g., TODAY, TOMORROW, LATER)
    @GetMapping("/filter/forWhen/{forWhen}")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByForWhen(@PathVariable ForWhen forWhen) {
        return ResponseEntity.ok(taskService.getAllTasksByForWhen(forWhen));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TaskResponseDTO>> filterTasks(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) ForWhen forWhen) {
        TaskFilterRequest filter = new TaskFilterRequest(status, priority, forWhen);
        return ResponseEntity.ok(taskService.filterTasks(filter));
    }

    // Retrieve a single task by its unique ID
    @GetMapping("/id/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // Mark a task as "in progress" or started
    @PatchMapping("/{id}/start")
    public ResponseEntity<TaskResponseDTO> startTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.startTask(id));
    }

    // Mark a task as completed and save the note of that task
    @PatchMapping("/{id}/finish")
    public ResponseEntity<TaskResponseDTO> completeTask(@PathVariable Long id, @RequestBody CompleteTaskNoteAdd taskNoteRequest) {
        return ResponseEntity.ok(taskService.completeTask(id, taskNoteRequest));
    }

    // Delete a task permanently by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTaskById(id);
        return ResponseEntity.noContent().build();
    }
}