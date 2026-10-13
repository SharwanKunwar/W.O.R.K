package com.unpredictableXCoder.FocusPlannerBackend.login.repository;

import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepository {
    @PersistenceContext
    private EntityManager entityManager;

    // Query all users.
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return entityManager.createQuery("SELECT user FROM User user", User.class)
                .getResultList();
    }

    // Query a user by ID.
    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return entityManager.createQuery("SELECT user FROM User user WHERE user.id = :id", User.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst();
    }

    // Query a user by email.
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return entityManager.createQuery("SELECT user FROM User user WHERE user.email = :email", User.class)
                .setParameter("email", email)
                .getResultStream()
                .findFirst();
    }

    // Check whether an email is already registered.
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        Long count = entityManager.createQuery(
                "SELECT COUNT(user) FROM User user WHERE user.email = :email", Long.class)
                .setParameter("email", email)
                .getSingleResult();
        return count > 0;
    }

    // Create a user or update an existing user.
    @Transactional
    public User save(User user) {
        if (user.getId() == null) {
            entityManager.persist(user);
            return user;
        }
        return entityManager.merge(user);
    }

    // Delete a user and its dependent records.
    @Transactional
    public void delete(User user) {
        User managedUser = entityManager.contains(user) ? user : entityManager.merge(user);
        entityManager.remove(managedUser);
    }
}
