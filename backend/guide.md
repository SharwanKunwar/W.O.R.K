# Focus Planner — Final Defense / Viva Guide

Everything you need to confidently present and defend the backend. Read `README.md` first for the technical reference — this file is about *how to talk about it* under questioning.

---

## 1. The One Idea to Never Lose

If you remember nothing else, remember this sentence:

> **"Ownership is enforced by the backend, using the authenticated user's ID from the JWT — never by trusting anything the client sends."**

Almost every viva question loops back to this. If you get stuck, steer your answer back to it.

---

## 2. Your One-Minute Pitch (memorize this)

> "My Focus Planner backend is built using Spring Boot with a layered architecture — controllers, services, repositories, entities, DTOs, and security components. I use Spring Security and JWT for authentication. After login, the JWT identifies the user by email. For every protected request, the JWT filter validates the token and places the authenticated user into the SecurityContext.
>
> Tasks have a Many-to-One relationship with users. When a task is created, the backend gets the authenticated user and assigns that user as the task owner. When retrieving tasks, the repository queries by the authenticated user's ID, so each user receives only their own tasks. Individual operations also check both task ID and user ID, preventing users from accessing or modifying another user's tasks. The backend also supports task status management, filtering, deletion, completion notes, and user-specific dashboard statistics."

Practice saying this out loud until it takes about 60 seconds and feels natural, not recited.

---

## 3. Your Longer Defense Statement (if given more time)

> "My project is a Focus Planner backend developed using Spring Boot. It provides REST APIs for authentication, user management, task management, filtering, and dashboard statistics. I use Spring Security with JWT for stateless authentication. The User entity implements UserDetails, and the user's email is used as the security username. When a request arrives with a JWT, the JWT filter validates the token, extracts the user's email, loads the user from the database, and stores the authentication in the SecurityContext.
>
> For task ownership, each TaskEntity has a Many-to-One relationship with User through the user_id column. When creating a task, I don't accept the owner from the frontend. Instead, I get the authenticated user from the SecurityContext and assign that user to the task. When retrieving tasks, I use findByUser_Id with the authenticated user's UUID. For individual operations such as getting, starting, completing, and deleting a task, I use findByIdAndUser_Id, which checks both the task ID and the authenticated user's ID.
>
> Therefore, User A can only access User A's tasks, while User B can only access User B's tasks. The same user-specific restriction is applied to task filtering and dashboard statistics. This ensures data isolation between users at the backend level rather than relying on the frontend."

---

## 4. Diagrams to Have Ready in Your Head

You should be able to draw these on a whiteboard from memory.

### A. Layered architecture
```
Frontend → Controller → Service → Repository → Database
```

### B. Authentication flow
```
Login → AuthenticationManager → UserDetailsService → UserRepository
 → User found → Generate JWT → Frontend stores it
```

### C. Per-request authentication
```
Authorization: Bearer JWT → JwtAuthFilter → extract email
 → load UserDetails → SecurityContext → getAuthenticatedUser()
```

### D. Ownership enforcement (the core diagram — draw this first if asked "how does security work?")
```
AUTHENTICATED USER
        ↓
      USER ID
        ↓
  ┌─────┴─────┐
  ↓           ↓
GET TASKS   MODIFY TASK
  ↓           ↓
user_id=ID  user_id=ID
  ↓           ↓
OWN TASKS ONLY (both sides)
```

---

## 5. Anticipated Questions & Model Answers

Read through these once, then try answering from the question alone before checking the model answer.

**Q: How do you ensure User A cannot see User B's tasks?**
> Each task has a relationship with a User through the `user_id` foreign key. The JWT filter authenticates the request and stores the user in the SecurityContext. The service uses that user's UUID when querying — `findByUser_Id(user.getId())` for lists, `findByIdAndUser_Id(id, user.getId())` for single tasks — so a user can't access another user's task even if they know its ID.

**Q: Why don't you send `userId` from the frontend when creating a task?**
> Because the client shouldn't be trusted to decide ownership. The backend takes the authenticated user from the JWT and calls `task.setUser(user)` itself, which prevents a malicious client from assigning a task to someone else.

**Q: How does JWT identify the user?**
> The JWT's subject is the user's email. `JwtAuthFilter` extracts it, loads the user via `UserDetailsService`, validates the token, and stores the authenticated user in `SecurityContext`.

**Q: Why does `User` implement `UserDetails`?**
> So the database `User` entity can be used directly as the Spring Security principal, without a separate wrapper class. `getUsername()` is overridden to return the email.

**Q: What happens if User B tries to access User A's task?**
> The service looks up the task using User B's ID *and* the task ID together via `findByIdAndUser_Id()`. Since the task belongs to User A, no match is found, and an exception is thrown — access is denied.

**Q: Why use `findByUser_Id()` specifically?**
> Task has a Many-to-One relationship with User. Spring Data JPA interprets `findByUser_Id` as "find tasks where `task.user.id` equals the given UUID," navigating the relationship automatically.

**Q: Why JWT instead of sessions?**
> The app is stateless — no server-side session storage per user. The client sends the JWT with every protected request, and the backend validates it fresh each time. This scales better for REST APIs.

**Q: What is the purpose of the service layer?**
> Business logic: resolving the authenticated user, verifying ownership, enforcing task status transitions, and coordinating with the repository.

**Q: What is the purpose of the repository layer?**
> Database access. Spring Data JPA auto-implements standard methods; custom methods like `findByUser_Id()` and `findByIdAndUser_Id()` add user-scoped queries.

**Q: What is the purpose of DTOs?**
> They decouple the API contract from the database entity, so you control exactly what's accepted from and returned to the client instead of exposing the raw entity.

**Q: Why `@ManyToOne` on Task?**
> Many tasks can belong to one user, so each task stores a reference to its owner via `user_id`.

**Q: What does `@PrePersist` do?**
> Runs before a new entity is saved. Here it sets `createdAt` automatically and defaults `status` to `PENDING` if none was given, so no task is ever created without a valid status.

**Q: What's the difference between authentication and authorization?**
> Authentication answers "who are you?" (the JWT identifies User A). Authorization answers "what can you access?" (User A can access only User A's tasks).

**Q: Is task ownership enforced by the frontend?**
> No — the frontend sends the JWT, but the backend enforces ownership by including the authenticated user's ID in every relevant query. Frontend code is never trusted for security decisions.

**Q: What happens if someone changes the task ID in the URL, e.g. `DELETE /api/tasks/15`?**
> The backend doesn't delete by ID alone — it calls `findByIdAndUser_Id(15, user.getId())`. If task 15 belongs to a different user, it isn't found for this user, and the delete is rejected.

**Q: What is the task status lifecycle?**
> `PENDING → IN_PROGRESS → COMPLETED`. A task starts pending, moves to in-progress on start, and completed on finish; it can't skip states or move backward.

**Q: How does the dashboard avoid mixing users?**
> Every stat is computed with the authenticated user's ID baked into the query — `countByUser_Id()`, `countByUser_IdAndStatus()`, etc. — so results are scoped per user by construction.

**Q: How does filtering avoid mixing users?**
> `TaskSpecification` always adds a `user.id = authenticated_user_id` predicate first, then layers on any requested filters (status, priority, forWhen) on top of that.

---

## 6. If You Get a Question Not Listed Here

Fall back on the pattern behind every answer above:

1. **Identify the layer** involved (Controller / Service / Repository / Security).
2. **Name the specific method** that does the work (`getAuthenticatedUser()`, `findByUser_Id()`, `findByIdAndUser_Id()`, `task.setUser(user)`).
3. **Trace it back to the JWT** — every piece of ownership logic ultimately depends on the authenticated user resolved from the token.

This pattern covers the vast majority of follow-up questions even if the exact phrasing is new.

---

## 7. Quick Terminology Cheat Sheet (say these correctly, don't fumble)

| Term | One-line definition |
|---|---|
| JPA | Standard for mapping Java objects to DB tables |
| Hibernate | The ORM implementation under Spring Data JPA |
| Entity | A class mapped to a DB table |
| Repository | Layer for DB operations |
| DTO | Object used to transfer data across the API boundary |
| JWT | Token used to authenticate users statelessly |
| UserDetails | Spring Security's representation of an authenticated principal |
| SecurityContext | Holds the current request's authentication info |
| Dependency Injection | Spring supplies dependencies instead of manual construction |
| REST API | HTTP interface between frontend and backend |

---

## 8. Day-of Checklist

- [ ] Can recite the one-minute pitch without notes
- [ ] Can draw the ownership-enforcement diagram from memory
- [ ] Can explain `findByUser_Id` vs `findByIdAndUser_Id` and *why* two different methods exist
- [ ] Can explain why `userId` is never accepted from the request body
- [ ] Can walk through the full User A / User B scenario end-to-end (register → login → create task → get tasks → confirm no mixing)
- [ ] Comfortable saying "the backend enforces it, not the frontend" as your default answer to any security question
