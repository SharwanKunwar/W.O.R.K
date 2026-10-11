import { Button, Empty, Tag } from 'antd';
import { ArrowUpRight, Check, CircleDashed, ListTodo, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import TaskCard from './TaskCard.jsx';
import CompletionHeatmap from './CompletionHeatmap.jsx';
import QuoteOfDay from './QuoteOfDay.jsx';

const chartColors = { PENDING: '#d3a753', IN_PROGRESS: '#5c83aa', COMPLETED: '#4d8d72' };

export default function Dashboard({ stats, tasks, onViewAll, onFocus, onNote }) {
    const todayTasks = tasks.filter((task) => task.forWhen === 'TODAY' && task.status !== 'COMPLETED').slice(0, 4);
    const completedTasks = [...tasks].filter((task) => task.status === 'COMPLETED').sort((a, b) => new Date(b.finishedAt || 0) - new Date(a.finishedAt || 0)).slice(0, 3);
    const chartData = [
        { name: 'Pending', key: 'PENDING', value: Number(stats.pendingTasks || 0) },
        { name: 'In progress', key: 'IN_PROGRESS', value: Number(stats.inProgressTasks || 0) },
        { name: 'Completed', key: 'COMPLETED', value: Number(stats.completedTasks || 0) },
    ].filter((item) => item.value > 0);
    const progress = Number(stats.totalTasks) ? Math.round(Number(stats.completedTasks || 0) / Number(stats.totalTasks) * 100) : 0;

    return (
        <motion.div className="space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section className="glass-hero soft-float flex min-h-[155px] items-center justify-between overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-r from-[#edf3eb] via-[#f7f8f3] to-[#e5efe2] px-[29px] py-[25px] transition-colors dark:border-[#344237] dark:from-[#27352b] dark:via-[#222f27] dark:to-[#1f2c24] max-[560px]:min-h-[140px] max-[560px]:px-[17px] max-[560px]:py-[21px]">
                <div><span className="text-[10px] font-bold tracking-[1px] text-[#708574] dark:text-[#a8c1ab]">A CLEARER DAY STARTS HERE</span><h2 className="mb-1 mt-2 font-display text-[28px] font-normal text-[#27392e] dark:text-[#e2ebe2] max-[560px]:max-w-[255px] max-[560px]:text-[23px]">Small steps, <em className="font-normal text-[#507459] dark:text-[#a4c99e]">real progress.</em></h2><p className="m-0 text-xs text-[#748276] dark:text-[#adbaae] max-[560px]:max-w-[240px] max-[560px]:leading-[1.55]">Choose what matters, then give it your full attention.</p></div>
                <div className="flex flex-col items-center gap-2.5 pr-[21px] text-[#52745a] max-[560px]:pr-0"><Sparkles size={19} /><span className="text-[10px] max-[560px]:max-w-[70px] max-[560px]:text-center">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
            </section>
            <QuoteOfDay />
            <section className="mb-[25px] grid grid-cols-4 gap-[13px] max-[1050px]:gap-[9px] max-[560px]:mb-[23px] max-[560px]:grid-cols-2 max-[560px]:gap-2" aria-label="Task summary">
                <StatCard label="All tasks" value={stats.totalTasks ?? 0} icon={<ListTodo size={19} />} tint="green" />
                <StatCard label="To do" value={stats.pendingTasks ?? 0} icon={<CircleDashed size={19} />} tint="yellow" />
                <StatCard label="In focus" value={stats.inProgressTasks ?? 0} icon={<ArrowUpRight size={19} />} tint="blue" />
                <StatCard label="Finished" value={stats.completedTasks ?? 0} icon={<Check size={19} />} tint="coral" />
            </section>
            <CompletionHeatmap tasks={tasks} />
            <section className="grid grid-cols-[minmax(0,1.7fr)_minmax(245px,.8fr)] items-start gap-[31px] max-[1050px]:grid-cols-[minmax(0,1.55fr)_minmax(220px,.8fr)] max-[1050px]:gap-[23px] max-[800px]:grid-cols-1 max-[800px]:gap-[25px] max-[560px]:gap-5">
                <div className="min-w-0">
                    <div className="mb-[13px] mt-0.5 flex min-h-[46px] items-center justify-between"><div><span className="text-[9px] font-bold tracking-[1px] text-[#94a097] dark:text-[#96a49a]">ON YOUR PLATE</span><h2 className="mb-0 mt-[5px] flex items-center gap-2 font-display text-xl font-normal text-[#334239] dark:text-[#dce5dd] max-[560px]:text-lg">Today’s focus <Tag className="!m-0 !rounded-[9px] !border-0 !bg-[#e9f1e9] !font-sans !text-[10px] !text-[#577460] dark:!bg-[#304336] dark:!text-[#b7d5b7]">{stats.todayTasks ?? todayTasks.length}</Tag></h2></div><Button className="!inline-flex !items-center !gap-1 !text-[11px] !text-[#6e8073] dark:!text-[#aec1b0]" type="text" onClick={onViewAll}>View all <ArrowUpRight size={15} /></Button></div>
                    <div className="grid gap-2">{todayTasks.length ? todayTasks.map((task) => <TaskCard key={task.id} task={task} compact onFocus={onFocus} onNote={onNote} />) : <div className="grid min-h-[105px] place-items-center rounded-[7px] border border-dashed border-[#dfe6df] bg-white/50 dark:border-[#354138] dark:bg-[#1d2720]"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing pressing today" /></div>}</div>
                    <div className="mb-[13px] mt-7 flex min-h-[46px] items-center"><div><span className="text-[9px] font-bold tracking-[1px] text-[#94a097] dark:text-[#96a49a]">MILESTONES</span><h2 className="mb-0 mt-[5px] font-display text-xl font-normal text-[#334239] dark:text-[#dce5dd] max-[560px]:text-lg">Recently finished</h2></div></div>
                    <div className="grid gap-2">{completedTasks.length ? completedTasks.map((task) => <TaskCard key={task.id} task={task} compact onFocus={onFocus} onNote={onNote} />) : <div className="px-0.5 py-3 text-[11px] text-[#96a198] dark:text-[#9eaaa1]">Finish a task and it will find its way here.</div>}</div>
                </div>
                <aside className="glass-card sticky top-5 self-start rounded-[22px] border border-white/60 bg-white/45 p-[20px] pl-[25px] dark:border-[#303b33] dark:bg-[#202a23]/70 max-[1050px]:pl-[19px] max-[800px]:static max-[800px]:border-l-0 max-[800px]:border-t max-[800px]:px-0 max-[800px]:pt-[18px]">
                    <div className="mb-px mt-0.5 flex min-h-[46px] items-center"><div><span className="text-[9px] font-bold tracking-[1px] text-[#94a097] dark:text-[#96a49a]">THE BIG PICTURE</span><h2 className="mb-0 mt-[5px] font-display text-xl font-normal text-[#334239] dark:text-[#dce5dd] max-[560px]:text-lg">Your progress</h2></div></div>
                    <div className="relative h-[183px] w-full max-[800px]:mx-auto max-[800px]:max-w-[260px]">
                        {chartData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="92%" paddingAngle={4} stroke="none">{chartData.map((item) => <Cell key={item.key} fill={chartColors[item.key]} />)}</Pie><Tooltip formatter={(value, name) => [`${value} tasks`, name]} /></PieChart></ResponsiveContainer> : <div className="absolute inset-0 grid place-items-center text-[#a2afa4]"><ListTodo size={29} /></div>}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="font-display text-[29px] font-normal text-[#34483b] dark:text-[#dce7dc]">{progress}%</strong><span className="text-[10px] text-[#8a968d] dark:text-[#a1ada4]">complete</span></div>
                    </div>
                    <div className="grid gap-3 border-b border-[#e4e9e3] pb-[17px] pt-1 dark:border-[#303b33] max-[800px]:mx-auto max-[800px]:max-w-[350px]">{[
                        ['Pending', Number(stats.pendingTasks || 0), chartColors.PENDING],
                        ['In progress', Number(stats.inProgressTasks || 0), chartColors.IN_PROGRESS],
                        ['Completed', Number(stats.completedTasks || 0), chartColors.COMPLETED],
                    ].map(([label, value, color]) => <div className="flex items-center justify-between text-[10px] text-[#728077] dark:text-[#a4afa6]" key={label}><span className="flex items-center gap-2"><i className="size-[7px] rounded-full" style={{ background: color }} />{label}</span><strong className="text-[11px] font-semibold text-[#34443a] dark:text-[#d0dacf]">{value}</strong></div>)}</div>
                    <div className="flex justify-between pt-[13px] text-[9px] text-[#98a299] dark:text-[#9ca99f] max-[800px]:mx-auto max-[800px]:max-w-[350px]"><span>Keep showing up.</span><span>It adds up.</span></div>
                </aside>
            </section>
        </motion.div>
    );
}

function StatCard({ label, value, icon, tint }) {
    const tintClass = { green: 'bg-[#e9f2eb] text-[#43765d]', yellow: 'bg-[#f6f0df] text-[#967336]', blue: 'bg-[#eaf1f7] text-[#507899]', coral: 'bg-[#faece7] text-[#b76853]' }[tint];
    const darkTintClass = { green: 'dark:!bg-[#263b2e] dark:!text-[#b2d3b2]', yellow: 'dark:!bg-[#3a3425] dark:!text-[#dfc17c]', blue: 'dark:!bg-[#253646] dark:!text-[#a7c9e3]', coral: 'dark:!bg-[#422d29] dark:!text-[#e5ad9d]' }[tint];
    return <motion.article className="glass-card flex min-h-[86px] items-center gap-3 rounded-[18px] border border-white/60 bg-white/60 p-[15px] transition-colors dark:border-[#354138] dark:bg-[#202a23]/80 max-[1050px]:p-3 max-[560px]:min-h-[75px] max-[560px]:gap-[9px] max-[560px]:p-2" whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}><span className={`grid size-9 shrink-0 place-items-center rounded-[11px] max-[560px]:size-[31px] ${tintClass} ${darkTintClass}`}>{icon}</span><div className="grid gap-1"><span className="text-[10px] text-[#7b887f] dark:text-[#9eaaa1]">{label}</span><strong className="font-display text-2xl font-normal leading-none text-[#243129] dark:text-[#e0e8e1] max-[560px]:text-[21px]">{value}</strong></div></motion.article>;
}