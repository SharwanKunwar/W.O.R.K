package com.unpredictableXCoder.FocusPlannerBackend.application.service;

import com.unpredictableXCoder.FocusPlannerBackend.login.entities.Provider;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
import com.unpredictableXCoder.FocusPlannerBackend.login.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LegacyDataMigrationRunner implements ApplicationRunner {

    private static final String LEGACY_EMAIL = "unpredictableXcoder@gmail.com";

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        ensureTaskUserColumn();
        User legacyOwner = ensureLegacyOwnerUser();
        backfillMissingTaskOwners(legacyOwner);
        enforceTaskUserNotNull();
        ensureTaskUserForeignKey();
    }

    private void ensureTaskUserColumn() {
        Integer columnExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE LOWER(table_name) = 'task_table' AND LOWER(column_name) = 'user_id'",
                Integer.class
        );

        if (columnExists != null && columnExists == 0) {
            try {
                jdbcTemplate.execute("ALTER TABLE task_table ADD COLUMN user_id UUID");
            } catch (DataAccessException ignored) {
                // Ignore if the column was already created by Hibernate or another migration step.
            }
        }
    }

    private User ensureLegacyOwnerUser() {
        return userRepository.findByEmail(LEGACY_EMAIL).orElseGet(() -> {
            User legacyUser = new User();
            legacyUser.setName("unpredictableXcoder");
            legacyUser.setEmail(LEGACY_EMAIL);
            legacyUser.setPassword(passwordEncoder.encode("hell"));
            legacyUser.setProvider(Provider.LOCAL);
            return userRepository.save(legacyUser);
        });
    }

    private void backfillMissingTaskOwners(User legacyOwner) {
        jdbcTemplate.update("UPDATE task_table SET user_id = ? WHERE user_id IS NULL", legacyOwner.getId());
    }

    private void enforceTaskUserNotNull() {
        try {
            jdbcTemplate.execute("ALTER TABLE task_table ALTER COLUMN user_id SET NOT NULL");
        } catch (DataAccessException ignored) {
            // The column may already be non-null or the database may not support this change in the current state.
        }
    }

    private void ensureTaskUserForeignKey() {
        Integer constraintExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.table_constraints tc " +
                        "JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name " +
                        "WHERE LOWER(tc.table_name) = 'task_table' AND tc.constraint_type = 'FOREIGN KEY' AND LOWER(kcu.column_name) = 'user_id'",
                Integer.class
        );

        if (constraintExists != null && constraintExists == 0) {
            try {
                jdbcTemplate.execute("ALTER TABLE task_table ADD CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(user_id)");
            } catch (DataAccessException ignored) {
                // Ignore if the constraint already exists or the schema is already in the desired state.
            }
        }
    }
}
