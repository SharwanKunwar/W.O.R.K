const ASSISTANT_BASE_URL = (
    import.meta.env.VITE_ASSISTANT_API_BASE_URL || 'http://localhost:8081'
).replace(/\/$/, '');

export async function sendAssistantMessage(prompt, { signal } = {}) {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 45000);
    const abortFromCaller = () => controller.abort();
    signal?.addEventListener('abort', abortFromCaller, { once: true });
    let response;
    let reply;
    try {
        response = await fetch(`${ASSISTANT_BASE_URL}/api/assistant/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: prompt,
            signal: controller.signal,
            cache: 'no-store',
        });
        reply = await response.text();
    } catch (error) {
        if (signal?.aborted) throw new DOMException('Chat request was cancelled.', 'AbortError');
        if (controller.signal.aborted) throw new Error('The assistant did not respond within 45 seconds. Check that the backend is available and try again.');
        throw new Error(`Unable to connect to the assistant at ${ASSISTANT_BASE_URL}. Check that the backend is running and allows this frontend origin through CORS.`);
    } finally {
        globalThis.clearTimeout(timeout);
        signal?.removeEventListener('abort', abortFromCaller);
    }
    if (!response.ok) {
        throw new Error(reply.trim() || `Assistant request failed (HTTP ${response.status}).`);
    }

    if (!reply.trim()) {
        throw new Error('The assistant returned an empty response.');
    }

    return reply;
}