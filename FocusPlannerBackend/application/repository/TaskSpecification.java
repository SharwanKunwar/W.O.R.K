package com.unpredictableXCoder.FocusPlannerBackend.application.repository;

import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskFilterRequest;
import com.unpredictableXCoder.FocusPlannerBackend.application.entity.TaskEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class TaskSpecification {

    public static Specification<TaskEntity> filterBy(TaskFilterRequest filter, UUID userId) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            
            // Always filter by userId
            predicates.getExpressions().add(cb.equal(root.get("user").get("id"), userId));
            
            if (filter.getStatus() != null) {
                predicates.getExpressions().add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getPriority() != null) {
                predicates.getExpressions().add(cb.equal(root.get("priority"), filter.getPriority()));
            }
            if (filter.getForWhen() != null) {
                predicates.getExpressions().add(cb.equal(root.get("forWhen"), filter.getForWhen()));
            }
            
            return predicates;
        };
    }
}
