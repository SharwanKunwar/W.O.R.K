# Focus Planner — Backend Documentation

A task-management REST API built with Java and Spring Boot. Supports user registration, JWT authentication, and full task management, with strict per-user data isolation: every user can only ever see, modify, or delete their own tasks.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Package Structure](#package-structure)
5. [Data Model](#data-model)
6. [Authentication](#authentication)
7. [API Reference](#api-reference)
8. [Task Ownership & Security](#task-ownership--security)
9. [Task Lifecycle](#task-lifecycle)
10. [Design Principles](#design-principles)
11. [Glossary](#glossary)

---

## Overview

Focus Planner's backend provides REST APIs for:

- User registration & login
- JWT-based stateless authentication
- Task creation, retrieval, filtering, starting, completing, deletion
- Dashboard statistics
- Strict user-specific task ownership

**Core security guarantee:** each authenticated user can access only their own tasks — never another user's.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Java | Programming language |
| Spring Boot | Application framework |
| Spring Web | REST API development |
| Spring Data JPA | Database access |
| Hibernate | ORM implementation |
| Spring Security | Authentication & authorization |
| JWT (JJWT) | Stateless authentication tokens |
| PostgreSQL | Persistent storage |
| Lombok | Boilerplate reduction |
| ModelMapper | DTO ↔ entity mapping |
| Jakarta Validation | Request validation |
| Maven | Build & dependency management |

---

## Architecture

Layered architecture:

```
Client / Frontend
       │  HTTP Request
       ▼
Controller Layer
       ▼
Service Layer
       ▼
Repository Layer
       ▼
Database
```

Authentication flow layered on top:

```
Client
   │ Authorization: Bearer <JWT>
   ▼
JwtAuthFilter
   │ extract username/email
   ▼
UserDetailsService
   ▼
UserRepository
   ▼
Authenticated User
```

---

## Package Structure

```
com.unpredictableXCoder.FocusPlannerBackend
├── application          # Task functionality
│   ├── controller
│   ├── entity
│   ├── repository
│   ├── service
│   ├── dto
│   ├── mapper
│   └── enums
├── login                # Users & authentication
│   ├── controller
│   ├── entities
│   ├── repository
│   ├── service
│   ├── security
│   ├── dtos
│   └── config
└── exceptions
```

---

## Data Model

### User Entity

```java
@Entity
@Table(name = "users")
public class User implements UserDetails
```

Fields: `id` (UUID), `name`, `email` (unique), `password`, `image`, `enabled`, `createdAT`, `updatedAT`, `provider`, `tasks`.

- `id` uses `GenerationType.UUID`
- `email` is `unique = true` — prevents duplicate registrations

### Task Entity

```java
@Entity
@Table(name = "task_table")
public class TaskEntity
```

Fields: `id` (Long, `IDENTITY`), `title` (max 100 chars, not null), `description` (max 300 chars, not null), `taskNote` (max 1000 chars — used for completion notes), `priority`, `status`, `forWhen`, `createdAt`, `startedAt`, `finishedAt`, `user`.

### Relationship: User ↔ Task (One-to-Many)

```java
// User entity
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private List<TaskEntity> tasks = new ArrayList<>();

// TaskEntity
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;
```

Each task row stores its owner's `user_id`.

### Enums

**Priority:** `LOW`, `MEDIUM`, `HIGH`
**Status:** `PENDING` → `IN_PROGRESS` → `COMPLETED`
**ForWhen:** `TODAY`, `TOMORROW`, `LATER`

### Auto-Initialization

```java
@PrePersist
public void prePersist() {
    createdAt = LocalDateTime.now();
    if (status == null) status = Status.PENDING;
}
```

Runs before insert: sets `createdAt` automatically and defaults `status` to `PENDING` if unset.

### DTOs

Task: `TaskRequestDTO`, `TaskResponseDTO`, `TaskFilterRequest`, `CompleteTaskNoteAdd`, `DashboardResponse`
Auth: `LoginRequest`, `RegisterRequest`, `AuthResponse`, `UserDTO`

DTOs decouple the API contract from the database entity structure:

```
Database Model → Entity → Mapper → Response DTO → Frontend
```

---

## Authentication

JWT-based, fully stateless (`SessionCreationPolicy.STATELESS`).

```
Register/Login → Verify credentials → Generate JWT → Frontend stores JWT
→ Frontend sends JWT with requests → JwtAuthFilter validates JWT
→ Spring Security identifies user → Operation performed
```

### Registration — `POST /api/auth/register`

Request:
```json
{ "name": "User A", "email": "usera@example.com", "password": "password" }
```

- Password encoded via `BCryptPasswordEncoder` before storage
- Legacy plaintext passwords are upgraded automatically on login
- Response includes `accessToken`, `refreshToken` (currently the same JWT value), and `user`

### Login — `POST /api/auth/login`

Request:
```json
{ "email": "usera@example.com", "password": "password" }
```

Verified via:
```java
authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(email, password)
);
```

### UserDetails Integration

`User implements UserDetails` and overrides:
```java
@Override
public String getUsername() { return this.email; }
```
So **email is the Spring Security username**.

### CustomUserDetailService

Implements `loadUserByUsername(String username)`, backed by `userRepository.findByEmail(username)`.

### JWT Generation (`JwtUtil`)

- Subject = user's email
- Expiration: `1000 * 60 * 60 * 24` ms = **24 hours**

### Request-Time Authentication (`JwtAuthFilter`)

```
Authorization header → check "Bearer " → extract JWT → extract email
→ load UserDetails → validate JWT → build Authentication
→ SecurityContextHolder.getContext().setAuthentication(authToken)
```

### Security Config

- Public: `/api/auth/register`, `/api/auth/login`
- Everything else: `.anyRequest().authenticated()`
- CORS allows `GET, POST, PUT, PATCH, DELETE, OPTIONS` and custom headers for cross-origin frontend dev

---

## API Reference

| HTTP | Endpoint | Purpose | Success Status |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | 201 |
| POST | `/api/auth/login` | Login | 200 |
| POST | `/api/tasks` | Create task | 201 |
| GET | `/api/tasks` | Get all of your tasks | 200 |
| GET | `/api/tasks/id/{id}` | Get one owned task | 200 |
| GET | `/api/tasks/filter` | Filter tasks (status/priority/forWhen) | 200 |
| GET | `/api/tasks/filter/forWhen/{forWhen}` | Get tasks by time category | 200 |
| PATCH | `/api/tasks/{id}/start` | Start a task | 200 |
| PATCH | `/api/tasks/{id}/finish` | Complete a task | 200 |
| DELETE | `/api/tasks/{id}` | Delete owned task | 204 |
| GET | `/api/dashboard` | User's dashboard stats | 200 |

### Task Creation

```
POST /api/tasks
{ "title": "Study Spring Boot", "description": "Learn Spring Security", "priority": "HIGH", "forWhen": "TODAY" }
```

The frontend is **never** trusted to specify the owner:

```java
User user = getAuthenticatedUser();
TaskEntity task = mapper.mapToEntity(request);
task.setUser(user);
```

### Filtering

`GET /api/tasks/filter?status=PENDING` builds a query dynamically via `TaskSpecification`, which always injects a `user_id = authenticated_user_id` predicate before adding any other filter (`status`, `priority`, `forWhen`).

### Dashboard

`GET /api/dashboard` returns per-user stats using methods such as:

```java
countByUser_Id(userId)
countByUser_IdAndStatus(userId, Status.PENDING)
countByUser_IdAndStatus(userId, Status.IN_PROGRESS)
countByUser_IdAndStatus(userId, Status.COMPLETED)
countByUser_IdAndForWhen(userId, ForWhen.TODAY)
```

Example — User A (3 tasks: 1 pending, 1 in-progress, 1 completed) and User B (2 tasks: 1 pending, 1 completed) get **independent** dashboards; stats never mix.

---

## Task Ownership & Security

This is the system's most important property: **User A can never see, modify, complete, or delete User B's tasks.**

### How it's enforced

1. **On create** — owner comes from the JWT-derived `SecurityContext`, never from the request body.
2. **On list** — `TaskRepository.findByUser_Id(UUID userId)` scopes every list query to the caller.
3. **On single-item operations** (get/start/finish/delete) — `findByIdAndUser_Id(Long id, UUID userId)` requires **both** the task ID and the caller's ID to match. Knowing another user's task ID is not enough to access it.
4. **On filtering** — `TaskSpecification` always adds a `user.id = userId` predicate before any other filter, so filtered queries can't leak across users either.
5. **On dashboards** — every count query is parameterized by `userId`.

### `getAuthenticatedUser()`

The linchpin method used by the service layer:

```java
JWT → SecurityContextHolder → principal (UserDetails) → email
    → userRepository.findByEmail(email) → User
```

### Why the frontend is never trusted

The frontend sends the JWT but is never relied on to enforce ownership (e.g. client-side filtering like `tasks.filter(t => t.userId === currentUser.id)` is not a security mechanism). All ownership checks happen server-side, in the service and repository layers.

---

## Task Lifecycle

```
CREATE → PENDING → START → IN_PROGRESS → FINISH → COMPLETED
```

Rules:
- A completed task cannot be started again.
- A pending task cannot be completed directly — it must be started first.
- `startedAt` / `finishedAt` timestamps let the frontend compute duration (`finishedAt - startedAt`).
- An optional completion note is saved to `taskNote` on finish.

---

## Design Principles

- **Separation of concerns** — Controller (HTTP) / Service (business logic) / Repository (DB) / Entity (model) / DTO (transfer) / Mapper (conversion) / Security (auth).
- **Dependency injection** — via Lombok's `@RequiredArgsConstructor` on `final` fields.
- **Data isolation** — enforced at the query level, not the application-response level.
- **Stateless scalability** — JWT auth requires no server-side session store.
- **Validation** — Jakarta Validation on incoming DTOs.
- **Custom exceptions** — `BadRequestException`, `ResourceNotFoundException`, `UserAlreadyExistsException`, handled globally.

---

## Glossary

| Term | Meaning |
|---|---|
| JPA | Java Persistence API — standard for mapping Java objects to DB tables |
| Hibernate | The ORM implementation underneath Spring Data JPA |
| Entity | A Java class mapped to a database table |
| Repository | Layer responsible for database operations |
| DTO | Data Transfer Object — used to move data across layers/API without exposing entities |
| JWT | JSON Web Token — used for stateless user authentication |
| UserDetails | Spring Security interface representing an authenticated principal |
| SecurityContext | Holds authentication info for the current request |
| Dependency Injection | Spring supplies required objects rather than classes constructing them manually |
| REST API | HTTP-based interface for frontend–backend communication |
