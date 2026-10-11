import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Empty, Input, message, Modal, Select, Spin, Tooltip } from 'antd';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Focus, LayoutDashboard, ListFilter, ListTodo, LogOut, Menu, Moon, Plus, Search, Sparkles, Sun, X } from 'lucide-react';
import dayjs from 'dayjs';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import FocusModal from './components/FocusModal.jsx';
import TaskCard from './components/TaskCard.jsx';
import TaskEditor from './components/TaskEditor.jsx';
import { api, setUnauthorizedHandler } from './services/api.js';

const viewMeta = {
    TODAY: { title: 'Today', subtitle: 'The next right thing, at your pace.', when: 'TODAY' },
    TOMORROW: { title: 'Tomorrow', subtitle: 'Give tomorrow a gentler beginning.', when: 'TOMORROW' },
    ALL: { title: 'All tasks', subtitle: 'Every commitment, in one clear view.' },
};

function readSession() {
    try {
        const accessToken = localStorage.getItem('fp_token');
        const user = JSON.parse(localStorage.getItem('fp_user') || 'null');
        return accessToken && user ? { accessToken, user } : null;
    } catch {
        return null;
    }
}

function readTheme() {
    try {
        return localStorage.getItem('fp_theme') === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export default function App() {
    const [session, setSession] = useState(readSession);
    const [theme, setTheme] = useState(readTheme);
    const [view, setView] = useState('DASHBOARD');
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [dueFilter, setDueFilter] = useState('');
    const [createdDateFilter, setCreatedDateFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [focusTask, setFocusTask] = useState(null);
    const [noteTask, setNoteTask] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [messageApi, messageContext] = message.useMessage();

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('fp_theme', theme);
    }, [theme]);

    useEffect(() => {
        const shouldLockScroll = mobileNavOpen && window.innerWidth <= 640;
        document.body.style.overflow = shouldLockScroll ? 'hidden' : '';
        document.body.style.touchAction = shouldLockScroll ? 'none' : '';
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [mobileNavOpen]);

    function toggleTheme() {
        setTheme((current) => current === 'light' ? 'dark' : 'light');
    }

    useEffect(() => {
        setUnauthorizedHandler(() => {
            localStorage.removeItem('fp_token');
            localStorage.removeItem('fp_user');
            setSession(null);
            setTasks([]);
            messageApi.error('Session expired. Please sign in again.');
        });
        return () => setUnauthorizedHandler(() => { });
    }, [messageApi]);

    useEffect(() => {
        if (!session?.accessToken) return undefined;
        let current = true;
        setLoading(true);

        const load = view === 'DASHBOARD'
            ? Promise.all([api.dashboard(session.accessToken), api.tasks(session.accessToken)]).then(([nextStats, nextTasks]) => {
                if (current) {
                    setStats(nextStats || {});
                    setTasks(Array.isArray(nextTasks) ? nextTasks : []);
                }
            })
            : api.tasks(session.accessToken).then((nextTasks) => {
                if (current) setTasks(Array.isArray(nextTasks) ? nextTasks : []);
            });

        load.catch((error) => {
            if (current && !/session expired/i.test(error.message)) messageApi.error(`Could not load tasks: ${error.message}`);
        }).finally(() => {
            if (current) setLoading(false);
        });

        return () => { current = false; };
    }, [session, view, refreshKey, messageApi]);

    const visibleTasks = useMemo(() => {
        let result = [...tasks];
        const currentView = viewMeta[view];
        if (currentView?.when) result = result.filter((task) => task.forWhen === currentView.when);
        if (statusFilter) result = result.filter((task) => task.status === statusFilter);
        if (priorityFilter) result = result.filter((task) => task.priority === priorityFilter);
        if (dueFilter === 'OVERDUE') result = result.filter((task) => task.status !== 'COMPLETED' && task.createdAt && dayjs(task.createdAt).isValid() && Date.now() - dayjs(task.createdAt).valueOf() >= 3 * 24 * 60 * 60 * 1000);
        if (createdDateFilter) result = result.filter((task) => task.createdAt && dayjs(task.createdAt).isValid() && dayjs(task.createdAt).format('YYYY-MM-DD') === createdDateFilter);
        if (searchTerm.trim()) {
            const search = searchTerm.trim().toLowerCase();
            result = result.filter((task) => `${task.title} ${task.description || ''}`.toLowerCase().includes(search));
        }
        return result;
    }, [tasks, view, statusFilter, priorityFilter, dueFilter, createdDateFilter, searchTerm]);

    async function authenticate(mode, values) {
        const data = mode === 'signin' ? await api.login(values) : await api.register(values);
        if (!data?.accessToken || !data?.user) throw new Error('The server returned an incomplete session.');
        localStorage.setItem('fp_token', data.accessToken);
        localStorage.setItem('fp_user', JSON.stringify(data.user));
        setSession({ accessToken: data.accessToken, user: data.user });
        setView('DASHBOARD');
        messageApi.success(mode === 'signin' ? 'Welcome back.' : 'Your workspace is ready.');
    }

    function signOut() {
        localStorage.removeItem('fp_token');
        localStorage.removeItem('fp_user');
        setSession(null);
        setTasks([]);
        setStats({});
        setView('DASHBOARD');
    }

    function navigate(nextView) {
        setView(nextView);
        setStatusFilter('');
        setPriorityFilter('');
        setDueFilter('');
        setCreatedDateFilter('');
        setSearchTerm('');
        setMobileNavOpen(false);
    }

    async function saveTask(values) {
        try {
            if (editingTask) {
                await api.deleteTask(session.accessToken, editingTask.id);
                await api.createTask(session.accessToken, values);
                messageApi.success('Task updated.');
            } else {
                await api.createTask(session.accessToken, values);
                messageApi.success('Task added to your plan.');
            }
            setEditorOpen(false);
            setEditingTask(null);
            setRefreshKey((key) => key + 1);
        } catch (error) {
            messageApi.error(editingTask ? `Could not replace task: ${error.message}` : `Could not create task: ${error.message}`);
            throw error;
        }
    }

    async function startFocus(task) {
        if (task.status === 'PENDING') {
            try {
                await api.startTask(session.accessToken, task.id);
                setTasks((items) => items.map((item) => item.id === task.id ? { ...item, status: 'IN_PROGRESS' } : item));
                messageApi.success('Focus session started.');
                setFocusTask({ ...task, status: 'IN_PROGRESS' });
                setRefreshKey((key) => key + 1);
            } catch (error) {
                messageApi.error(error.message);
            }
            return;
        }
        setFocusTask(task);
    }

    async function finishFocus(taskNote) {
        try {
            await api.finishTask(session.accessToken, focusTask.id, taskNote);
            setFocusTask(null);
            setRefreshKey((key) => key + 1);
            messageApi.success('Task finished. Nice work.');
        } catch (error) {
            messageApi.error(`Could not finish task: ${error.message}`);
            throw error;
        }
    }

    async function deleteTask(task) {
        try {
            await api.deleteTask(session.accessToken, task.id);
            setTasks((items) => items.filter((item) => item.id !== task.id));
            setRefreshKey((key) => key + 1);
            messageApi.success('Task deleted.');
        } catch (error) {
            messageApi.error(`Could not delete task: ${error.message}`);
        }
    }

    const userName = session?.user?.name || session?.user?.email || 'Your account';
    const viewInfo = viewMeta[view] || { title: 'Dashboard', subtitle: 'A little more focus, every day.' };

    if (!session) return <>{messageContext}<Helmet><title>FocusPlanner | Make room for focus</title></Helmet><AuthScreen theme={theme} onToggleTheme={toggleTheme} onAuthenticate={authenticate} /></>;

    const navigation = [
        { id: 'DASHBOARD', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'TODAY', label: 'Today', icon: <CalendarDays size={18} /> },
        { id: 'TOMORROW', label: 'Tomorrow', icon: <ChevronRight size={18} /> },
        { id: 'ALL', label: 'All tasks', icon: <ListTodo size={18} /> },
    ];

    return (
        <div className="min-h-screen p-10 max-[640px]:p-0 ">
            <div className="apple-shell flex h-[calc(100vh-5rem)] overflow-hidden rounded-md shadow-sm max-[640px]:h-auto max-[640px]:min-h-screen max-[640px]:overflow-visible max-[640px]:shadow-none">
                {messageContext}
                <Helmet><title>{viewInfo.title} | FocusPlanner</title><meta name="description" content="A calm, focused workspace for planning and finishing meaningful work." /></Helmet>
                {mobileNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-[4] border-0 bg-[#161f195e] min-[641px]:hidden" onClick={() => setMobileNavOpen(false)} />}
                <aside id="primary-navigation-panel" className={`rounded-2xl glass-panel z-[5] flex h-full shrink-0 flex-col overflow-hidden rounded-none border-y-0 border-l-0 border-r border-[#dfe6dd] bg-[#f5f7f2]/75 px-3 pb-[18px] pt-[27px] text-[#344239] shadow-none transition-[width,min-width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/20 dark:bg-[#202d27]/85 dark:text-[#edf3ed] dark:shadow-[0_20px_50px_rgba(22,39,28,0.18)] ${sidebarCollapsed ? 'w-[75px] min-w-[75px]' : 'w-[254px] min-w-[254px]'} max-[640px]:fixed max-[640px]:inset-y-0 max-[640px]:left-0 max-[640px]:z-10 max-[640px]:h-screen max-[640px]:w-[min(280px,82vw)] max-[640px]:min-w-0 max-[640px]:overflow-y-auto max-[640px]:-translate-x-full ${mobileNavOpen ? 'max-[640px]:translate-x-0' : ''}`}>
                    <div className="mb-[53px] flex h-[37px] shrink-0 items-center justify-start gap-2.5 px-2.5 text-[15px] font-bold max-[640px]:justify-between"><span className="flex min-w-0 items-center gap-2.5"><span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-[#b9d79e] text-[#243a30]"><Focus size={18} /></span><span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out ${sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'}`}>FocusPlanner</span></span><Button className="!hidden !text-[#607166] dark:!text-[#d7e2da] max-[640px]:!inline-flex" type="text" aria-label="Close navigation" aria-controls="primary-navigation-panel" aria-expanded={mobileNavOpen} aria-pressed={mobileNavOpen} icon={<X size={19} />} onClick={() => setMobileNavOpen(false)} /></div>
                    <span className={`mb-3 px-3 text-[10px] font-bold tracking-[1px] text-[#829087] ${sidebarCollapsed ? 'hidden' : ''}`}>WORKSPACE</span>
                    <nav className="grid flex-1 content-start gap-[5px]" aria-label="Main navigation">
                        {navigation.map((item) => <button key={item.id} className={`flex min-h-[43px] w-full items-center justify-start gap-3 rounded-[7px] border-0 px-3 text-left text-[13px] font-medium transition-colors ${view === item.id ? 'bg-[#34463c] text-[#f6f8f4]' : 'bg-transparent text-[#647369] hover:bg-[#e8eee6] hover:text-[#2d4635] dark:text-[#bac5bd] dark:hover:bg-white/[.07] dark:hover:text-white'}`} onClick={() => navigate(item.id)} title={sidebarCollapsed ? item.label : undefined}>{item.icon}<span className={`overflow-hidden transition-[max-width,opacity] duration-200 ease-in-out ${sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] whitespace-nowrap opacity-100'}`}>{item.label}</span>{item.id === 'ALL' && !sidebarCollapsed && <span className="ml-auto text-[11px] text-[#7d8c81] dark:text-[#a7b4aa]">{tasks.length}</span>}</button>)}
                    </nav>
                    <div className="mt-auto shrink-0">
                        <div className={`mb-[15px] flex gap-2.5 border-y border-[#dfe6dd] px-3 py-[13px] dark:border-[#39463e] ${sidebarCollapsed ? 'hidden' : ''}`}><span className="mt-0.5 text-[#739274] dark:text-[#c5dcae]"><Sparkles size={15} /></span><p className="m-0 text-[11px] leading-[1.65] text-[#718076] dark:text-[#a9b4ac]">Make space for<br /><strong className="font-medium text-[#415247] dark:text-[#e7eee7]">one thing at a time.</strong></p></div>
                        <div className={`flex min-w-0 items-center gap-[9px] px-[3px] py-[5px] ${sidebarCollapsed ? 'flex-wrap justify-center' : ''}`}><div className="grid size-[34px] shrink-0 place-items-center rounded-full border border-[#6a806e] bg-[#41584a] text-xs font-bold text-[#d9e6d6]">{userName.charAt(0).toUpperCase()}</div><div className={`grid min-w-0 flex-1 gap-[3px] overflow-hidden transition-[max-width,opacity] duration-200 ease-in-out ${sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[170px] opacity-100'}`}><strong className="truncate text-[11px] font-semibold text-[#344239] dark:text-[#edf3ed]">{userName}</strong><span className="truncate text-[10px] text-[#7c8c80] dark:text-[#91a096]">Personal workspace</span></div><Tooltip title="Sign out"><Button className="!text-[#65776a] dark:!text-[#a8b4ab]" aria-label="Sign out" type="text" icon={<LogOut size={17} />} onClick={signOut} /></Tooltip></div>
                        <button type="button" aria-pressed={sidebarCollapsed} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={`flex  w-full items-center p-3 rounded-md border-0 bg-transparent px-2.5 gap-3 pt-[14px] text-left text-[11px] text-[#728176] transition-colors hover:bg-[#e8eee6] hover:text-[#2d4635] dark:text-[#89968d] dark:hover:bg-white/[.07] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9d79e] max-[640px]:hidden ${sidebarCollapsed ? 'justify-center px-0 text-[#52775a] dark:text-[#b9d79e]' : ''}`} onClick={() => setSidebarCollapsed((value) => !value)}><ChevronLeft className={`transition-transform duration-300 ease-in-out ${sidebarCollapsed ? 'rotate-180' : ''}`} size={16} /><span className={`overflow-hidden transition-[max-width,opacity] duration-200 ease-in-out ${sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] whitespace-nowrap opacity-100'}`}>{sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span></button>
                    </div>
                </aside>
                <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-none bg-[#f5f7f2]/40 transition-colors dark:bg-[#141a16]/30">
                    <header className="glass-panel flex h-[72px] shrink-0 items-center justify-between rounded-t-md border-b border-white/40 bg-white/50 px-[42px] shadow-[0_3px_5px_rgba(31,46,39,0.11)] transition-colors dark:border-[#303b33] dark:bg-[#1a221d]/70 dark:shadow-[0_3px_5px_rgba(0,0,0,0.2)] max-[1050px]:px-7 max-[800px]:h-16 max-[800px]:px-[18px] max-[560px]:px-[13px] max-[640px]:rounded-none">
                        <div className="flex items-center"><Button className="!mr-2 !hidden !text-[#526258] dark:!text-[#c3d0c6] max-[640px]:!inline-flex" type="text" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} aria-controls="primary-navigation-panel" aria-expanded={mobileNavOpen} aria-pressed={mobileNavOpen} icon={mobileNavOpen ? <X size={20} /> : <Menu size={20} />} onClick={() => setMobileNavOpen((open) => !open)} /><div className="flex items-center gap-2.5 text-xs text-[#9aa49d] dark:text-[#9eaaa1] max-[560px]:gap-1.5 max-[560px]:text-[10px]"><span>Workspace</span><ChevronRight size={14} /><strong className="font-semibold text-[#3d4b42] dark:text-[#e0e7e1]">{viewInfo.title}</strong></div></div>
                        <div className="flex items-center gap-3 max-[800px]:gap-1"><Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}><Button className="!grid !size-9 !place-items-center !text-[#526258] dark:!text-[#c3d0c6]" type="text" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'} icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} onClick={toggleTheme} /></Tooltip><span className="flex items-center gap-2 text-[11px] text-[#758279] max-[800px]:hidden"><span className="size-[7px] rounded-full bg-[#7ca885] shadow-[0_0_0_3px_#e7f0e6]" />Your focus space</span><Button className="!h-[39px] !min-w-[119px] max-[560px]:!h-[37px] max-[560px]:!min-w-0 max-[560px]:!px-[10px] max-[560px]:!text-[11px]" type="primary" icon={<Plus size={17} />} onClick={() => { setEditingTask(null); setEditorOpen(true); }}>New task</Button></div>
                    </header>
                    <div className="mx-auto min-h-0 w-full max-w-[1450px] flex-1 overflow-y-auto overscroll-y-contain px-[42px] pb-5 pt-[38px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[1050px]:px-7 max-[640px]:min-h-screen max-[640px]:flex-none max-[640px]:overflow-visible max-[640px]:px-5 max-[640px]:pt-7 max-[560px]:px-[14px] max-[560px]:pt-6">
                        <section className="soft-float mb-[30px] flex items-end justify-between max-[560px]:mb-[21px]"><div><p className="mb-[9px] text-[10px] font-bold tracking-[1px] text-[#8a978e] dark:text-[#8f9d92]">FOCUSPLANNER / {view}</p><h1 className="m-0 font-display text-[38px] font-normal leading-[1.14] text-[#202b25] dark:text-[#e8eee9] max-[560px]:text-[33px]">{viewInfo.title}</h1><p className="mb-0 mt-[7px] max-w-[250px] text-[13px] text-[#7d8981] dark:text-[#a4afa6] max-[560px]:text-[11px]">{viewInfo.subtitle}</p></div>{view !== 'DASHBOARD' && <div className="flex items-baseline gap-[7px] pb-[3px] text-xs text-[#89958d] dark:text-[#a4afa6]"><strong className="font-display text-[25px] font-normal text-[#344a3c] dark:text-[#d3e0d5]">{visibleTasks.length}</strong><span>{visibleTasks.length === 1 ? 'task' : 'tasks'}</span></div>}</section>
                        {view === 'DASHBOARD' ? (
                            loading && !tasks.length ? <div className="grid min-h-[360px] place-items-center"><Spin size="large" /></div> : <Dashboard stats={stats} tasks={tasks} onViewAll={() => navigate('ALL')} onFocus={startFocus} onNote={setNoteTask} />
                        ) : (
                            <section className="min-h-[425px]">
                                <div className="mb-[14px] flex items-center justify-between gap-3 rounded-[7px] border border-[#e1e7e1] bg-white p-2 transition-colors dark:border-[#354138] dark:bg-[#202a23] max-[560px]:items-stretch max-[560px]:flex-col"><div className="flex min-h-[34px] min-w-[160px] flex-1 items-center gap-2 pl-[5px] text-[#94a098] dark:text-[#a8b4aa]"><Search size={17} /><Input className="!text-[11px]" aria-label="Search tasks" variant="borderless" placeholder="Find a task..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div><div className="flex items-center gap-2 text-[#849087] dark:text-[#a8b4aa] max-[560px]:grid max-[560px]:grid-cols-2"><ListFilter className="max-[560px]:hidden" size={16} /><Select className="!w-[135px] !text-[11px] max-[560px]:!w-full" aria-label="Filter by status" value={statusFilter || undefined} placeholder="Any status" allowClear onChange={(value) => setStatusFilter(value || '')} options={[{ value: 'PENDING', label: 'Pending' }, { value: 'IN_PROGRESS', label: 'In progress' }, { value: 'COMPLETED', label: 'Completed' }]} /><Select className="!w-[135px] !text-[11px] max-[560px]:!w-full" aria-label="Filter by priority" value={priorityFilter || undefined} placeholder="Any priority" allowClear onChange={(value) => setPriorityFilter(value || '')} options={[{ value: 'HIGH', label: 'High priority' }, { value: 'MEDIUM', label: 'Medium priority' }, { value: 'LOW', label: 'Low priority' }]} /><Select className="!w-[140px] !text-[11px] max-[560px]:!w-full" aria-label="Filter by due status" value={dueFilter || undefined} placeholder="Any due status" allowClear onChange={(value) => setDueFilter(value || '')} options={[{ value: 'OVERDUE', label: 'Overdue (3+ days)' }]} /><DatePicker className="!w-[140px] !text-[11px] max-[560px]:!w-full" aria-label="Filter by created date" placeholder="Added date" format="MMM D, YYYY" allowClear value={createdDateFilter ? dayjs(createdDateFilter) : null} onChange={(date) => setCreatedDateFilter(date?.format('YYYY-MM-DD') || '')} /></div></div>
                                {loading ? <div className="grid min-h-[360px] place-items-center"><Spin size="large" /></div> : visibleTasks.length ? <div className="grid gap-[9px]">{visibleTasks.map((task) => <TaskCard key={task.id} task={task} onFocus={startFocus} onEdit={(selected) => { setEditingTask(selected); setEditorOpen(true); }} onDelete={deleteTask} onNote={setNoteTask} />)}</div> : <div className="grid min-h-[310px] place-items-center rounded-lg border border-dashed border-[#dce4dc] bg-white/45 dark:border-[#354138] dark:bg-[#1d2720]"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-[11px] text-[#89958c] dark:text-[#9eaaa1]">{tasks.length ? 'No tasks match these filters.' : 'A little breathing room. Add a task when you’re ready.'}</span>}><Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditingTask(null); setEditorOpen(true); }}>Create a task</Button></Empty></div>}
                            </section>
                        )}
                        <footer className="mt-[31px] flex min-h-[52px] items-center justify-between border-t border-[#e4e9e3] text-[10px] text-[#929d94] dark:border-[#303b33] dark:text-[#a0aca3] max-[560px]:mt-[22px] max-[560px]:text-[9px]"><span className="flex items-center gap-1.5"><Check className="text-[#5e8b6e]" size={14} /> A thoughtful plan is a flexible one.</span><button className="flex items-center gap-1.5 border-0 bg-transparent text-[10px] text-[#7d8b80] dark:text-[#b1bdb4] max-[560px]:text-[9px]" onClick={() => messageApi.info('Your tasks are synced with your account.')}>Sync status <ArrowUpRight size={13} /></button></footer>
                    </div>
                </main>
                <TaskEditor open={editorOpen} task={editingTask} onCancel={() => { setEditorOpen(false); setEditingTask(null); }} onSave={saveTask} />
                <FocusModal task={focusTask} theme={theme} onClose={() => setFocusTask(null)} onFinish={finishFocus} />
                <Modal open={Boolean(noteTask)} title={<div><span className="text-[10px] font-bold tracking-[1px] text-[#89968d] dark:text-[#9eaaa1]">A NOTE TO YOURSELF</span><h2 className="mb-0 mt-[5px] font-display text-[23px] font-normal text-[#2c3b31] dark:text-[#e0e7e1]">{noteTask?.title}</h2></div>} onCancel={() => setNoteTask(null)} footer={<Button type="primary" onClick={() => setNoteTask(null)}>Done</Button>} width={500}>
                    <p className="min-h-[85px] whitespace-pre-wrap break-words rounded-md bg-[#f5f7f2] p-[15px] text-[13px] leading-[1.7] text-[#526056] dark:bg-[#202a23] dark:text-[#c2cdc4]">{noteTask?.taskNote || noteTask?.note || 'No note was added for this task.'}</p>
                </Modal>
            </div>
        </div>
    );
}