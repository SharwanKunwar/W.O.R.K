
import { Button, Input, Modal, Progress, Tooltip, Typography } from 'antd';

import {
    Check,
    CircleDot,
    Clock3,
    ListTodo,
    Pause,
    Play,
    Plus,
    Sparkles,
    StickyNote,
    X,
    Globe,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import AssistantChat from './AssistantChat.jsx';
import tools from '../store/tools.js';

const { TextArea } = Input;

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${remainder}`;
}

export default function FocusModal({
    task,
    theme,
    onClose,
    onFinish,
    sidebarWidth = 254,
}) {
    const [seconds, setSeconds] = useState(0);
    const [note, setNote] = useState('');
    const [intention, setIntention] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [checklistDraft, setChecklistDraft] = useState('');

    const [activeTool, setActiveTool] = useState('intention');
    const [activePanel, setActivePanel] = useState('notes');

    const [paused, setPaused] = useState(false);
    const [busy, setBusy] = useState(false);

    const elapsedBase = useRef(0);
    const intervalStartedAt = useRef(null);

    useEffect(() => {
        if (!task) return undefined;

        setSeconds(0);
        elapsedBase.current = 0;
        intervalStartedAt.current = Date.now();

        setNote('');
        setIntention('');
        setChecklist([]);
        setChecklistDraft('');

        setActiveTool('intention');
        setActivePanel('notes');
        setPaused(false);
    }, [task?.id]);

    useEffect(() => {
        if (!task || paused) return undefined;

        const timer = window.setInterval(() => {
            if (intervalStartedAt.current !== null) {
                setSeconds(
                    elapsedBase.current +
                    Math.floor(
                        (Date.now() - intervalStartedAt.current) / 1000
                    )
                );
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [task?.id, paused]);

    function togglePaused() {
        if (paused) {
            intervalStartedAt.current = Date.now();
            setPaused(false);
            return;
        }

        if (intervalStartedAt.current !== null) {
            elapsedBase.current += Math.floor(
                (Date.now() - intervalStartedAt.current) / 1000
            );

            intervalStartedAt.current = null;
            setSeconds(elapsedBase.current);
        }

        setPaused(true);
    }

    async function finish() {
        setBusy(true);

        try {
            const savedNote = [
                intention.trim()
                    ? `Session intention:\n  ${intention.trim()}`
                    : '',
                note.trim(),
            ]
                .filter(Boolean)
                .join('\n\n');

            await onFinish(savedNote);
        } finally {
            setBusy(false);
        }
    }

    function addChecklistItem(event) {
        event.preventDefault();

        const label = checklistDraft.trim();
        if (!label) return;

        setChecklist((items) => [
            ...items,
            {
                id: crypto.randomUUID(),
                label,
                done: false,
            },
        ]);

        setChecklistDraft('');
    }

    const cycleProgress = Math.round(
        ((seconds % 1500) / 1500) * 100
    );

    const cycleRemaining = 1500 - (seconds % 1500);

    const cycleRemainingLabel =
        `${Math.floor(cycleRemaining / 60).toString().padStart(2, '0')}:` +
        `${(cycleRemaining % 60).toString().padStart(2, '0')}`;

    const focusTools = [
        {
            id: 'intention',
            label: 'Intention',
            icon: <Sparkles size={15} />,
        },
        {
            id: 'checklist',
            label: 'Checklist',
            icon: <ListTodo size={15} />,
        },
    ];

    return (
        <Modal
            open={Boolean(task)}
            onCancel={onClose}
            footer={null}
            closable={false}
            destroyOnHidden
            centered={false}
            className="focus-modal"
            wrapClassName="focus-modal-wrap"
            width="calc(100vw - 80px)"
            style={{
                top: 40,
                left: 40,
                right: 40,
                margin: 0,
                paddingBottom: 0,
                maxWidth: 'none',
            }}
            styles={{
                mask: {
                    background: 'rgba(15, 22, 18, 0.18)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                },
                content: {
                    background: 'rgba(247, 250, 245, 0.52)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    boxShadow: '0 30px 90px rgba(18, 25, 20, 0.18)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    padding: 0,
                    borderRadius: 14,
                    height: 'calc(100dvh - 80px)',
                    maxHeight: 'calc(100dvh - 80px)',
                    overflowY: 'auto',
                },
            }}
        >
            {task && (
                <div className="focus-workspace grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-[#f2f5f0] text-left dark:bg-[#141a16]">

                    {/* Header */}
                    <header className="flex min-h-[94px] items-center justify-between gap-5 border-b border-[#dfe6dd] bg-white/70 px-8 py-4 backdrop-blur-xl dark:border-[#303b33] dark:bg-[#1a221d]/75 max-[640px]:min-h-0 max-[640px]:items-start max-[640px]:px-4 max-[640px]:py-4">
                        <div className="flex min-w-0 items-center gap-5 max-[640px]:gap-3">
                            <div className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#e8f0e6] text-[#55775c] dark:bg-[#2b3c2f] dark:text-[#b7d6b8] max-[640px]:hidden">
                                <CircleDot size={20} />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[9px] font-bold tracking-[1px] text-[#78907d] dark:text-[#a6bea8]">
                                    <span>FOCUS SESSION</span>
                                    <span
                                        className={`rounded-full px-2 py-1 tracking-normal ${paused
                                            ? 'bg-[#f4efdf] text-[#8b713d] dark:bg-[#3a3528] dark:text-[#d9c894]'
                                            : 'bg-[#e6f0e7] text-[#507459] dark:bg-[#2a3b2d] dark:text-[#b9d5bb]'
                                            }`}
                                    >
                                        {paused ? 'PAUSED' : 'IN FOCUS'}
                                    </span>
                                </div>

                                <Typography.Title
                                    level={2}
                                    className="!mb-0 !mt-0 !break-words !font-display !text-[23px] !font-normal !text-[#2c3b31] dark:!text-[#e0e7e1] max-[640px]:!text-[20px]"
                                >
                                    {task.title}
                                </Typography.Title>

                                {task.description && (
                                    <p className="mb-0 mt-1 max-w-[760px] truncate text-[11px] text-[#7f8d82] dark:text-[#aab6ac]">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full border border-[#dce5da] bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-[#637665] dark:border-[#39463d] dark:bg-[#222d25] dark:text-[#c2d2c3] max-[460px]:hidden">
                                {task.priority || 'FOCUS'}
                            </span>

                            <Button
                                type="text"
                                aria-label="Close focus session"
                                className="!grid !size-9 !place-items-center !text-[#68776b] dark:!text-[#c0cbc1]"
                                icon={<X size={18} />}
                                onClick={onClose}
                            />
                        </div>
                    </header>

                    {/* Main workspace */}
                    <div className="grid min-h-0 grid-cols-[minmax(0,1.9fr)_minmax(320px,.86fr)] max-[850px]:grid-cols-1 max-[850px]:grid-rows-[minmax(610px,1fr)_minmax(440px,.85fr)] max-[640px]:grid-rows-[minmax(720px,auto)_minmax(500px,auto)]">

                        <main className="grid min-h-0 min-w-0 grid-rows-[minmax(270px,.9fr)_minmax(240px,1.1fr)] border-r border-[#dfe6dd] dark:border-[#303b33] max-[700px]:grid-rows-[minmax(440px,auto)_minmax(260px,auto)] max-[520px]:grid-rows-[minmax(620px,auto)_minmax(280px,auto)]">

                            {/* Timer and focus tools */}
                            <section className="grid min-h-0 grid-cols-[minmax(250px,.8fr)_minmax(0,1.2fr)] border-b border-[#dfe6dd] dark:border-[#303b33] max-[700px]:grid-cols-1">

                                {/* Timer */}
                                <div className="flex min-w-0 flex-col items-center justify-center border-r border-[#dfe6dd] px-6 py-5 dark:border-[#303b33] max-[700px]:border-r-0 max-[700px]:border-b">
                                    <div className="mb-3 flex items-center gap-2 text-[9px] font-bold tracking-[1px] text-[#87958a] dark:text-[#9eaaa1]">
                                        <Clock3 size={13} />
                                        DEEP WORK
                                    </div>

                                    <div className="relative grid size-[210px] place-items-center max-[420px]:size-[190px]">
                                        <Progress
                                            type="circle"
                                            percent={cycleProgress}
                                            size={198}
                                            strokeWidth={3}
                                            showInfo={false}
                                            strokeColor={theme === 'dark' ? '#92c99b' : '#578866'}
                                            trailColor={theme === 'dark' ? '#303b33' : '#e2eae1'}
                                        />

                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="mb-2 text-[9px] font-semibold tracking-[1px] text-[#8d9a8f] dark:text-[#9eaaa1]">
                                                ELAPSED
                                            </span>

                                            <strong className="font-display text-[35px] font-normal tabular-nums text-[#2e4634] dark:text-[#d9e8da] max-[420px]:text-[30px]">
                                                {formatTime(seconds)}
                                            </strong>

                                            <span className="mt-2 text-[10px] text-[#8d9a8f] dark:text-[#9eaaa1]">
                                                Break in {cycleRemainingLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid w-full max-w-[230px] grid-cols-2 gap-2">
                                        <Button
                                            className="!h-[38px] !w-full !min-w-0 !justify-center !gap-1 !px-1 !text-[10px]"
                                            type={paused ? 'primary' : 'default'}
                                            aria-pressed={paused}
                                            icon={paused ? <Play size={14} /> : <Pause size={14} />}
                                            onClick={togglePaused}
                                        >
                                            {paused ? 'Resume' : 'Pause session'}
                                        </Button>

                                        <Button
                                            className="!h-[38px] !w-full !min-w-0 !justify-center !gap-1 !px-1 !text-[10px]"
                                            type="primary"
                                            icon={<Check size={14} />}
                                            loading={busy}
                                            onClick={finish}
                                        >
                                            Finish task
                                        </Button>
                                    </div>
                                </div>

                                {/* Intention and checklist */}
                                <section className="flex min-h-0 min-w-0 flex-col px-7 py-6 max-[640px]:px-4 max-[640px]:py-5">
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <span className="mb-1 block text-[9px] font-bold tracking-[1px] text-[#8a978e] dark:text-[#9eaaa1]">
                                                MAKE THIS SESSION COUNT
                                            </span>
                                            <h3 className="m-0 font-display text-[20px] font-normal text-[#334239] dark:text-[#dce5dd]">
                                                Your focus tools
                                            </h3>
                                        </div>

                                        <div
                                            className="flex shrink-0 gap-1 rounded-full border border-[#e2e9e0] bg-white/75 p-1 dark:border-[#354138] dark:bg-[#202a23]"
                                            role="tablist"
                                            aria-label="Focus tools"
                                        >
                                            {focusTools.map((tool) => (
                                                <button
                                                    key={tool.id}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={activeTool === tool.id}
                                                    aria-label={tool.label}
                                                    title={tool.label}
                                                    className={`grid size-8 place-items-center rounded-full border-0 transition-colors ${activeTool === tool.id
                                                        ? 'bg-[#315c4b] text-white shadow-sm'
                                                        : 'bg-transparent text-[#7d8a80] hover:bg-[#eff4ed] hover:text-[#365b40] dark:text-[#a5b1a7] dark:hover:bg-[#303b33] dark:hover:text-white'
                                                        }`}
                                                    onClick={() => setActiveTool(tool.id)}
                                                >
                                                    {tool.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {activeTool === 'intention' ? (
                                        <div className="flex min-h-0 flex-1 flex-col">
                                            <p className="mb-3 text-[11px] leading-[1.6] text-[#849087] dark:text-[#9eaaa1]">
                                                Choose one meaningful outcome. A clear intention makes it easier to return to the work.
                                            </p>

                                            <TextArea
                                                aria-label="Session intention"
                                                value={intention}
                                                onChange={(event) => setIntention(event.target.value)}
                                                placeholder="For this session, I will..."
                                                className="min-h-0 flex-1"
                                                autoSize={false}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            role="tabpanel"
                                            aria-label="Session checklist"
                                            className="flex min-h-0 flex-1 flex-col"
                                        >
                                            <form
                                                className="mb-3 flex gap-2"
                                                onSubmit={addChecklistItem}
                                            >
                                                <Input
                                                    aria-label="Add a focus step"
                                                    value={checklistDraft}
                                                    onChange={(event) => setChecklistDraft(event.target.value)}
                                                    placeholder="Add a small next step"
                                                    maxLength={120}
                                                />

                                                <Button
                                                    aria-label="Add focus step"
                                                    type="primary"
                                                    htmlType="submit"
                                                    disabled={!checklistDraft.trim()}
                                                    icon={<Plus size={16} />}
                                                />
                                            </form>

                                            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[#e2e9e0] bg-white/60 p-2 dark:border-[#354138] dark:bg-[#1c251f]/65">
                                                {checklist.length ? (
                                                    <ul className="m-0 grid list-none gap-1 p-0">
                                                        {checklist.map((item) => (
                                                            <li
                                                                key={item.id}
                                                                className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f2f5f0] dark:hover:bg-[#27322a]"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    role="checkbox"
                                                                    aria-checked={item.done}
                                                                    aria-label={`${item.done ? 'Mark incomplete' : 'Mark complete'}: ${item.label}`}
                                                                    className={`grid size-5 shrink-0 place-items-center rounded-full border ${item.done
                                                                        ? 'border-[#5c8866] bg-[#5c8866] text-white'
                                                                        : 'border-[#cbd7ca] text-transparent dark:border-[#566458]'
                                                                        }`}
                                                                    onClick={() =>
                                                                        setChecklist((items) =>
                                                                            items.map((entry) =>
                                                                                entry.id === item.id
                                                                                    ? { ...entry, done: !entry.done }
                                                                                    : entry
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    {item.done && <Check size={12} />}
                                                                </button>

                                                                <span
                                                                    className={`min-w-0 flex-1 break-words text-[11px] ${item.done
                                                                        ? 'text-[#929d94] line-through dark:text-[#89968d]'
                                                                        : 'text-[#4d5d51] dark:text-[#d0dbd1]'
                                                                        }`}
                                                                >
                                                                    {item.label}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="grid h-full min-h-[100px] place-items-center px-4 text-center text-[11px] text-[#8a968d] dark:text-[#9eaaa1]">
                                                        Break the task into a few small, doable steps.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            </section>

                            {/* Notes and learning tools */}
                            <section className="flex min-h-0 min-w-0 flex-col px-7 py-5 max-[640px]:px-4">

                                {/* Compact toggle in the top-right corner */}
                                <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                                    <h3 className="m-0 text-[13px] font-semibold text-[#435447] dark:text-[#d5dfd6]">
                                        {activePanel === 'notes' ? 'Working notes' : 'Learning resources'}
                                    </h3>

                                    <div
                                        className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e2e9e0] bg-white/65 p-1 dark:border-[#354138] dark:bg-[#202a23]"
                                        role="tablist"
                                        aria-label="Notes and tools"
                                    >
                                        <button
                                            type="button"
                                            role="tab"
                                            aria-selected={activePanel === 'notes'}
                                            onClick={() => setActivePanel('notes')}
                                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-colors ${activePanel === 'notes'
                                                ? 'bg-white text-[#315c4b] shadow-sm dark:bg-[#354138] dark:text-[#dce8dd]'
                                                : 'text-[#718075] hover:text-[#365b40] dark:text-[#a5b1a7] dark:hover:text-white'
                                                }`}
                                        >
                                            <StickyNote size={13} />
                                            Notes
                                            <span className="text-[9px] opacity-70">
                                                {note.length}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            role="tab"
                                            aria-selected={activePanel === 'tools'}
                                            onClick={() => setActivePanel('tools')}
                                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-colors ${activePanel === 'tools'
                                                ? 'bg-white text-[#315c4b] shadow-sm dark:bg-[#354138] dark:text-[#dce8dd]'
                                                : 'text-[#718075] hover:text-[#365b40] dark:text-[#a5b1a7] dark:hover:text-white'
                                                }`}
                                        >
                                            <Sparkles size={13} />
                                            Tools
                                        </button>
                                    </div>
                                </div>

                                {/* Notes content */}
                                {activePanel === 'notes' && (
                                    <div
                                        role="tabpanel"
                                        aria-label="Working notes"
                                        className="flex min-h-0 flex-1 flex-col"
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#e7efe5] text-[#55775c] dark:bg-[#2b3c2f] dark:text-[#b7d6b8]">
                                                    <StickyNote size={17} />
                                                </span>

                                                <div className="min-w-0">
                                                    <h3 className="m-0 font-display text-[19px] font-normal text-[#334239] dark:text-[#dce5dd]">
                                                        Working notes
                                                    </h3>
                                                    <p className="mb-0 mt-0.5 text-[10px] text-[#849087] dark:text-[#9eaaa1]">
                                                        Capture the useful bits. They’ll be saved when you finish.
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 text-[10px] tabular-nums text-[#9aa59b] dark:text-[#89968d]">
                                                {note.length} characters
                                            </span>
                                        </div>

                                        <TextArea
                                            id="focus-note"
                                            aria-label="Working notes"
                                            value={note}
                                            onChange={(event) => setNote(event.target.value)}
                                            placeholder="Decisions, questions, ideas..."
                                            className="min-h-0 flex-1"
                                            autoSize={false}
                                        />
                                    </div>
                                )}

                                {/* Tools content */}
                                {activePanel === 'tools' && (
                                    <div
                                        role="tabpanel"
                                        aria-label="Learning websites"
                                        className="flex min-h-0 flex-1 flex-col"
                                    >
                                        <div className="mb-3 flex items-center gap-3">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#e7efe5] text-[#55775c] dark:bg-[#2b3c2f] dark:text-[#b7d6b8]">
                                                <Globe size={17} />
                                            </span>

                                            <div>
                                                <p className="mb-0 text-[10px] text-[#849087] dark:text-[#9eaaa1]">
                                                    Click an icon to open a website. Hover for a short description.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-8 gap-3 overflow-y-auto pb-2 max-[1100px]:grid-cols-6 max-[850px]:grid-cols-4 max-[520px]:grid-cols-3">
                                            {tools.map((tool) => {
                                                const Icon = tool.icon;

                                                return (
                                                    <Tooltip
                                                        key={tool.name}
                                                        title={
                                                            <div className="max-w-[190px]">
                                                                <div className="mb-1 font-semibold">
                                                                    {tool.name}
                                                                </div>
                                                                <div>{tool.description}</div>
                                                                <div className="mt-1 text-[10px] opacity-70">
                                                                    Click to open website ↗
                                                                </div>
                                                            </div>
                                                        }
                                                        placement="top"
                                                        mouseEnterDelay={0.25}
                                                    >
                                                        <button
                                                            type="button"
                                                            aria-label={`${tool.name}: ${tool.description}`}
                                                            onClick={() =>
                                                                window.open(
                                                                    tool.url,
                                                                    '_blank',
                                                                    'noopener,noreferrer'
                                                                )
                                                            }
                                                            className="group flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-[#e0e7dd] bg-white/65 px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a5bea6] hover:bg-[#eaf2e8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73977a] dark:border-[#354138] dark:bg-[#202a23] dark:hover:border-[#58765d] dark:hover:bg-[#29382d] max-[520px]:py-3"
                                                        >
                                                            <span className="grid size-11 place-items-center rounded-[14px] bg-[#e7efe5] text-[#55775c] transition-colors group-hover:bg-[#d6e6d5] dark:bg-[#2b3c2f] dark:text-[#b7d6b8] dark:group-hover:bg-[#354b39]">
                                                                <Icon size={21} strokeWidth={1.8} />
                                                            </span>

                                                            <span className="w-full truncate text-[10px] font-medium text-[#435447] dark:text-[#d5dfd6]">
                                                                {tool.name}
                                                            </span>
                                                        </button>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>

                                        <p className="mb-0 mt-3 text-[10px] leading-5 text-[#849087] dark:text-[#9eaaa1]">
                                            External websites may require an account. Availability and free features vary by service.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </main>

                        {/* Assistant */}
                        <aside className="flex min-h-0 min-w-0 flex-col bg-[#eaf0e8]/60 p-5 dark:bg-[#1a221d]/65 max-[850px]:border-t max-[850px]:border-[#dfe6dd] max-[640px]:p-4">
                            <AssistantChat task={task} />
                        </aside>
                    </div>
                </div>
            )}
        </Modal>
    );
}
