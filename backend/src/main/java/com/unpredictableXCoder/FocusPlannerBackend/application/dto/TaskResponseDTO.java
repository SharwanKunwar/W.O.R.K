package com.unpredictableXCoder.FocusPlannerBackend.application.dto;

import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Priority;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO
{
    private Long id;
    private String title;
    private String description;
    private String taskNote;
    private Priority priority;
    private Status status;
    private ForWhen forWhen;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
