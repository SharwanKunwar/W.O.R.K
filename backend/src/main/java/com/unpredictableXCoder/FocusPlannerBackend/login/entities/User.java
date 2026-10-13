package com.unpredictableXCoder.FocusPlannerBackend.login.entities;

import com.unpredictableXCoder.FocusPlannerBackend.application.entity.TaskEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID id;

    @Column(name = "user_name", nullable = false)
    private String name;
    @Column(name = "user_email", nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    private String image;
    private boolean enabled = true;
    private Instant createdAT = Instant.now();
    private Instant updatedAT = Instant.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Provider provider = Provider.LOCAL;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TaskEntity> tasks = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if(createdAT == null) createdAT = now;
        else updatedAT = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAT = Instant.now();
    }



    //-------------------------------------------------------------------------------------------------------------



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities()
    {
        return Collections.singletonList(new SimpleGrantedAuthority("USER"));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
