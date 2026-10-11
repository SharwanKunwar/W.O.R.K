import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Input, Tooltip } from 'antd';
import { ArrowUp, Bot, Eraser, LoaderCircle, MessageCircle, UserRound } from 'lucide-react';
import { sendAssistantMessage } from '../services/assistant.js';

const { TextArea } = Input;

export default function AssistantChat({ task, active = true }) {
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastPrompt, setLastPrompt] = useState('');
    const transcriptEnd = useRef(null);
    const requestLock = useRef(false);
    const activeRequest = useRef(null);

    useEffect(() => {
        setMessages([]);
        setDraft('');
        setError('');
        setLastPrompt('');
        setLoading(false);
        requestLock.current = false;
        activeRequest.current?.abort();
        activeRequest.current = null;
        return () => activeRequest.current?.abort();
    }, [task?.id]);

    useEffect(() => {
        transcriptEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, loading, active]);

    const suggestions = [
        `Break “${task.title}” into 3 small steps.`,
        'Help me decide what to focus on first.',
        'Ask me a few questions to get unstuck.',
    ];

    async function submitPrompt(prompt, addUserMessage = true) {
        const messageText = prompt.trim();
        if (!messageText || requestLock.current) return;

        requestLock.current = true;
        setLoading(true);
        setError('');
        setLastPrompt(messageText);
        if (addUserMessage) {
            setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: messageText }]);
        }

        const controller = new AbortController();
        activeRequest.current = controller;
        try {
            const reply = await sendAssistantMessage(messageText, { signal: controller.signal });
            setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
        } catch (requestError) {
            if (requestError.name !== 'AbortError') {
                setError(requestError.message || 'Could not reach the assistant. Check that the backend is running and try again.');
            }
        } finally {
            if (activeRequest.current === controller) activeRequest.current = null;
            requestLock.current = false;
            setLoading(false);
        }
    }

    function submit(event) {
        event.preventDefault();
        const prompt = draft.trim();
        if (!prompt || loading) return;
        setDraft('');
        submitPrompt(prompt);
    }

    function onComposerKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }
    }

    function clearChat() {
        if (loading) return;
        setMessages([]);
        setError('');
        setLastPrompt('');
        setDraft('');
    }

    return (
        <div className={`${active ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 flex-col`} aria-label={`AI assistant for ${task.title}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[#e8f0e8] text-[#4d7256] dark:bg-[#2b3c2f] dark:text-[#b7d6b8]"><Bot size={17} /></span>
                    <div className="min-w-0">
                        <h3 className="m-0 truncate text-xs font-semibold text-[#344239] dark:text-[#dce5dd]">Focus assistant</h3>
                        <span className="text-[10px] text-[#87948a] dark:text-[#9eaaa1]">A.N.T.I.O.N.Y.X.</span>
                    </div>
                </div>
                <Tooltip title="Clear conversation">
                    <Button aria-label="Clear chat" type="text" disabled={loading || messages.length === 0} icon={<Eraser size={15} />} onClick={clearChat} />
                </Tooltip>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#e1e8e0] bg-white dark:border-[#354138] dark:bg-[#1c251f]">
                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3" role="log" aria-label="Assistant conversation" aria-live="polite" aria-relevant="additions text">
                    {messages.length === 0 ? (
                        <div className="flex min-h-full flex-col items-center justify-center px-2 py-4 text-center">
                            <span className="mb-3 grid size-10 place-items-center rounded-full bg-[#edf3ed] text-[#55775c] dark:bg-[#2a382d] dark:text-[#b7d6b8]"><MessageCircle size={18} /></span>
                            <h4 className="mb-1 mt-0 font-display text-lg font-normal text-[#344239] dark:text-[#dce5dd]">What are you working through?</h4>
                            <p className="mb-4 mt-0 max-w-[270px] text-[10px] leading-[1.6] text-[#87948a] dark:text-[#9eaaa1]">Ask a question or start with a prompt for this task.</p>
                            <div className="flex max-w-[340px] flex-wrap justify-center gap-1.5">
                                {suggestions.map((suggestion) => <button key={suggestion} type="button" disabled={loading} className="rounded-full border border-[#dfe7de] bg-[#f7f9f6] px-2.5 py-1.5 text-[10px] text-[#58705d] transition hover:border-[#a9c2ab] hover:bg-[#edf3ed] disabled:cursor-not-allowed dark:border-[#3b493e] dark:bg-[#242e27] dark:text-[#c1d2c2] dark:hover:bg-[#303d32]" onClick={() => submitPrompt(suggestion)}>{suggestion}</button>)}
                            </div>
                        </div>
                    ) : <div className="grid gap-3">
                        {messages.map((chatMessage) => <div className={`flex items-start gap-2 ${chatMessage.role === 'user' ? 'flex-row-reverse' : ''}`} key={chatMessage.id}>
                            <span className={`grid size-6 shrink-0 place-items-center rounded-full ${chatMessage.role === 'user' ? 'bg-[#e9eee9] text-[#596b5c] dark:bg-[#354138] dark:text-[#c2d0c4]' : 'bg-[#e8f0e8] text-[#4d7256] dark:bg-[#2b3c2f] dark:text-[#b7d6b8]'}`} aria-hidden="true">{chatMessage.role === 'user' ? <UserRound size={13} /> : <Bot size={13} />}</span>
                            <p className={`m-0 max-w-[86%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-[11px] leading-[1.6] ${chatMessage.role === 'user' ? 'rounded-tr-sm bg-[#315c4b] text-white dark:bg-[#3c6747]' : 'rounded-tl-sm bg-[#f0f4ef] text-[#45564a] dark:bg-[#29342c] dark:text-[#d0dbd1]'}`}>{chatMessage.content}</p>
                        </div>)}
                        {loading && <div className="flex items-center gap-2 text-[10px] text-[#87948a] dark:text-[#9eaaa1]" role="status"><span className="grid size-6 place-items-center rounded-full bg-[#e8f0e8] text-[#4d7256] dark:bg-[#2b3c2f] dark:text-[#b7d6b8]"><Bot size={13} /></span><span className="flex items-center gap-1"><LoaderCircle className="animate-spin" size={13} /> Thinking</span></div>}
                        <div ref={transcriptEnd} />
                    </div>}
                    {messages.length === 0 && <div ref={transcriptEnd} />}
                </div>

                {error && <Alert
                    className="mx-3 mb-2"
                    type="error"
                    showIcon
                    message="Assistant unavailable"
                    description={<span>{error}{lastPrompt && <Button className="!ml-2 !px-1" type="link" size="small" onClick={() => submitPrompt(lastPrompt, false)}>Retry</Button>}</span>}
                />}

                <form className="flex items-end gap-2 border-t border-[#e8ede7] p-2.5 dark:border-[#354138]" onSubmit={submit}>
                    <TextArea
                        aria-label="Message the assistant"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onComposerKeyDown}
                        placeholder="Ask a question..."
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        maxLength={4000}
                        disabled={loading}
                    />
                    <Tooltip title="Send message">
                        <Button aria-label="Send message" type="primary" htmlType="submit" disabled={!draft.trim() || loading} icon={<ArrowUp size={16} />} />
                    </Tooltip>
                </form>
                <div className="px-3 pb-2 text-right text-[9px] text-[#9aa59b] dark:text-[#89968d]">Enter to send · Shift+Enter for a new line</div>
            </div>
        </div>
    );
}
