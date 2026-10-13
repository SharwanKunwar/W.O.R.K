package com.unpredictableXCoder.FocusPlannerBackend.application.repository;

import com.unpredictableXCoder.FocusPlannerBackend.application.entity.TaskEntity;
import com.unpredictableXCoder.FocusPlannerBackend.application.dto.TaskFilterRequest;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class TaskRepository {
    @PersistenceContext
    private EntityManager entityManager;

    // Query all tasks owned by a user.
    @Transactional(readOnly = true)
    public List<TaskEntity> findByUser_Id(UUID userId) {
        return entityManager.createQuery(
                        "SELECT task FROM TaskEntity task WHERE task.user.id = :userId", TaskEntity.class)
                .setParameter("userId", userId)
                .getResultList();
    }

    // Query a task by ID while enforcing user ownership.
    @Transactional(readOnly = true)
    public Optional<TaskEntity> findByIdAndUser_Id(Long id, UUID userId) {
        return entityManager.createQuery(
                        "SELECT task FROM TaskEntity task WHERE task.id = :id AND task.user.id = :userId", TaskEntity.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultStream()
                .findFirst();
    }

    // Query a user's tasks using the supplied optional filters.
    @Transactional(readOnly = true)
    public List<TaskEntity> findAllForUser(TaskFilterRequest filter, UUID userId) {
        StringBuilder jpql = new StringBuilder("SELECT task FROM TaskEntity task WHERE task.user.id = :userId");
        if (filter.getStatus() != null) {
            jpql.append(" AND task.status = :status");
        }
        if (filter.getPriority() != null) {
            jpql.append(" AND task.priority = :priority");
        }
        if (filter.getForWhen() != null) {
            jpql.append(" AND task.forWhen = :forWhen");
        }

        TypedQuery<TaskEntity> query = entityManager.createQuery(jpql.toString(), TaskEntity.class)
                .setParameter("userId", userId);
        if (filter.getStatus() != null) {
            query.setParameter("status", filter.getStatus());
        }
        if (filter.getPriority() != null) {
            query.setParameter("priority", filter.getPriority());
        }
        if (filter.getForWhen() != null) {
            query.setParameter("forWhen", filter.getForWhen());
        }
        return query.getResultList();
    }

    // Count all tasks owned by a user.
    @Transactional(readOnly = true)
    public long countByUser_Id(UUID userId) {
        return entityManager.createQuery(
                        "SELECT COUNT(task) FROM TaskEntity task WHERE task.user.id = :userId", Long.class)
                .setParameter("userId", userId)
                .getSingleResult();
    }

    // Count a user's tasks by status.
    @Transactional(readOnly = true)
    public long countByUser_IdAndStatus(UUID userId, Status status) {
        return entityManager.createQuery(
                        "SELECT COUNT(task) FROM TaskEntity task WHERE task.user.id = :userId AND task.status = :status",
                        Long.class)
                .setParameter("userId", userId)
                .setParameter("status", status)
                .getSingleResult();
    }

    // Count a user's tasks by schedule.
    @Transactional(readOnly = true)
    public long countByUser_IdAndForWhen(UUID userId, ForWhen forWhen) {
        return entityManager.createQuery(
                        "SELECT COUNT(task) FROM TaskEntity task WHERE task.user.id = :userId AND task.forWhen = :forWhen",
                        Long.class)
                .setParameter("userId", userId)
                .setParameter("forWhen", forWhen)
                .getSingleResult();
    }

    // Create a task or update an existing task.
    @Transactional
    public TaskEntity save(TaskEntity task) {
        if (task.getId() == null) {
            entityManager.persist(task);
            return task;
        }
        return entityManager.merge(task);
    }

    // Delete a task.
    @Transactional
    public void delete(TaskEntity task) {
        TaskEntity managedTask = entityManager.contains(task) ? task : entityManager.merge(task);
        entityManager.remove(managedTask);
    }
}


