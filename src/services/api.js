const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
let unauthorizedHandler = () => { };

export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

async function request(path, { method = 'GET', token, body } = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
            cache: 'no-store',
            signal: controller.signal,
        });
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('The backend did not respond in time.');
        throw error;
    } finally {
        window.clearTimeout(timeout);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && token) {
            unauthorizedHandler();
            throw new Error('Session expired. Please sign in again.');
        }
        throw new Error(data?.message || data?.error || text || `HTTP ${response.status}`);
    }

    return data;
}

export const api = {
    login: (body) => request('/api/auth/login', { method: 'POST', body }),
    register: (body) => request('/api/auth/register', { method: 'POST', body }),
    dashboard: (token) => request('/api/dashboard', { token }),
    tasks: (token) => request('/api/tasks', { token }),
    createTask: (token, body) => request('/api/tasks', { method: 'POST', token, body }),
    deleteTask: (token, id) => request(`/api/tasks/${id}`, { method: 'DELETE', token }),
    startTask: (token, id) => request(`/api/tasks/${id}/start`, { method: 'PATCH', token }),
    finishTask: (token, id, taskNote) => request(`/api/tasks/${id}/finish`, {
        method: 'PATCH',
        token,
        body: { taskNote },
    }),
};