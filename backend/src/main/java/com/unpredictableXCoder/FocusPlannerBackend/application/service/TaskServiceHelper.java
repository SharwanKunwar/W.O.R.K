package com.unpredictableXCoder.FocusPlannerBackend.application.service;

import com.unpredictableXCoder.FocusPlannerBackend.application.dto.CompleteTaskNoteAdd;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskRequestDTO;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskResponseDTO;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;

import java.util.List;

public interface TaskServiceHelper {

    // This method will help to add a new task to the database
    TaskResponseDTO createTask(TaskRequestDTO request);

    // This method will retrieve all tasks from the database
    List<TaskResponseDTO> getAllTasks();

    // This method will retrieve all tasks based on the selected ForWhen category
    List<TaskResponseDTO> getAllTasksByForWhen(ForWhen forWhen);

    // This method will retrieve a task using its unique ID
    TaskResponseDTO getTaskById(Long id);

    // This method will start a task by updating its status and start time
    TaskResponseDTO startTask(Long id);

    // This method will mark a task as completed, record its completion time and task note if available
    TaskResponseDTO completeTask(Long id, CompleteTaskNoteAdd taskNote);

    // This method will delete a task from the database using its ID
    void deleteTaskById(Long id);
    
    // Filter tasks
    List<TaskResponseDTO> filterTasks(com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskFilterRequest filter);
    
    // Get dashboard stats
    com.unpredictableXCoder.FocusPlannerBackend.application.dto.DashboardResponse getDashboardStats();
}
