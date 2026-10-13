package com.unpredictableXCoder.FocusPlannerBackend.application.dto;

import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Priority;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskFilterRequest {
    private Status status;
    private Priority priority;
    private ForWhen forWhen;
}
