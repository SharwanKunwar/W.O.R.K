package com.unpredictableXCoder.FocusPlannerBackend.application.entity;

import com.unpredictableXCoder.FocusPlannerBackend.application.enums.ForWhen;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Priority;
import com.unpredictableXCoder.FocusPlannerBackend.application.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import com.unpredictableXCoder.FocusPlannerBackend.login.entities.User;
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "task_table")
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private  String title;

    @Column(nullable = false, length = 300)
    private String description;

    @Column(length = 1000)
    private String taskNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ForWhen forWhen;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    //This method will automatically set the createAT timestamp
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = Status.PENDING;
        }
    }

}
