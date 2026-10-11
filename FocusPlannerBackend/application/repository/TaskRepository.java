package com.unpredictableXCoder.FocusPlannerBackend.application.repository;

import com.unpredictableXCoder.FocusPlannerBackend.application.entity.TaskEntity;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;

public interface TaskRepository extends JpaRepository<TaskEntity, Long>, JpaSpecificationExecutor<TaskEntity>
{
    List<TaskEntity> findByUser_Id(UUID userId);
    Optional<TaskEntity> findByIdAndUser_Id(Long id, UUID userId);
    
    long countByUser_Id(UUID userId);
    long countByUser_IdAndStatus(UUID userId, Status status);
    long countByUser_IdAndForWhen(UUID userId, ForWhen forWhen);
}
