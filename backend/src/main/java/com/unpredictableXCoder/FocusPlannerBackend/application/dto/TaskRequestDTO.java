package com.unpredictableXCoder.FocusPlannerBackend.application.dto;

import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaskRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 300, message = "Description cannot exceed 300 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "ForWhen is required")
    private ForWhen forWhen;
}
