# FocusPlanner

A React frontend for organizing tasks, planning when to work on them, and recording focused sessions. The backend remains a separate service; this repository contains only the frontend.

UI styling uses Tailwind CSS v4 through the Vite plugin. Component layouts and visual styles are expressed as utility classes; `src/styles.css` contains the Tailwind entry point, font theme, base reset, and small Ant Design compatibility rules.

The interface supports light and dark themes. Use the sun/moon button in the sign-in screen or workspace header; the preference is saved in browser storage as `fp_theme`.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` in `.env.local` to the task backend origin (default `http://localhost:8080`) and `VITE_ASSISTANT_API_BASE_URL` to the Spring assistant origin (default `http://localhost:8081`). Restart Vite after changing either variable.

Run the Spring Boot/PostgreSQL assistant backend separately on port `8081` using its normal project command (for example, `./mvnw spring-boot:run` from that backend repository). The Focus workspace has an **Assistant** tool. It sends each prompt as the raw `text/plain;charset=UTF-8` request body to `POST /api/assistant/chat` and reads the response as plain text; it does not send JSON. The chat also includes an initial welcome with suggested prompts, user/assistant bubbles, loading and duplicate-send protection, retryable errors, clear chat, and automatic scroll to the latest message.

When Vite and the backend use different origins, configure the Spring app to allow the frontend origin, normally `http://localhost:5173`. For Spring MVC, a CORS mapping can be configured like this:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/assistant/**")
				.allowedOrigins("http://localhost:5173")
				.allowedMethods("POST", "OPTIONS")
				.allowedHeaders("Content-Type")
				.maxAge(3600);
	}
}
```

If Spring Security is enabled, ensure CORS is enabled in the security filter chain as well. If Vite selects a different port, allow that exact origin instead.

Create a production bundle with `npm run build`; use `npm run preview` to serve that bundle locally.

## Backend contract

The frontend preserves the API used by the previous version:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sign in with `{ email, password }` |
| `POST` | `/api/auth/register` | Register with `{ name, email, password }` |
| `GET` | `/api/dashboard` | Read task summary counts |
| `GET` | `/api/tasks` | Read the authenticated user's tasks |
| `POST` | `/api/tasks` | Create a task with `{ title, description, priority, forWhen }` |
| `PATCH` | `/api/tasks/:id/start` | Start a pending task |
| `PATCH` | `/api/tasks/:id/finish` | Complete a task with `{ taskNote }` |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Successful auth responses are expected to contain `{ accessToken, user }`. Protected requests send `Authorization: Bearer <accessToken>`. Task reads are expected to return an array with `id`, `title`, `description`, `priority`, `forWhen`, and `status`; optional fields used by the interface include `createdAt`, `startedAt`, `finishedAt`, and `taskNote`/`note`. Dashboard counts use `totalTasks`, `pendingTasks`, `inProgressTasks`, `completedTasks`, and `todayTasks`.

New tasks can be scheduled for today or tomorrow; filtering and search run client-side over `/api/tasks`. Existing tasks with the retired `LATER` value remain available under All tasks and display as unscheduled. The backend currently has no task update endpoint, so editing retains the previous delete-then-create behavior; if creation fails after deletion, the original task cannot be recovered from the frontend. A dedicated backend `PUT` or `PATCH /api/tasks/:id` endpoint is the recommended follow-up.