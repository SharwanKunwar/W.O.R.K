import { Button, Popconfirm, Tag, Tooltip } from 'antd';
import { Check, FileText, Pencil, Play, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

const statusLabels = { PENDING: 'Pending', IN_PROGRESS: 'In progress', COMPLETED: 'Complete' };
const whenLabels = { TODAY: 'Today', TOMORROW: 'Tomorrow', LATER: 'Unscheduled' };
const priorityColors = { HIGH: 'volcano', MEDIUM: 'gold', LOW: 'cyan' };

function durationFor(task) {
    if (!task.startedAt || !task.finishedAt) return null;
    const seconds = Math.max(0, Math.floor((new Date(task.finishedAt) - new Date(task.startedAt)) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours ? `${hours}h ` : ''}${minutes}m`;
}

export default function TaskCard({ task, compact = false, onFocus, onEdit, onDelete, onNote }) {
    const created = task.createdAt ? new Date(task.createdAt) : null;
    const overdue = task.status !== 'COMPLETED'
        && created
        && !Number.isNaN(created.valueOf())
        && Date.now() - created.getTime() >= 3 * 24 * 60 * 60 * 1000;
    const duration = durationFor(task);

    return (
        <motion.article className={`glass-card relative flex min-w-0 items-center gap-[14px] overflow-hidden rounded-[18px] border border-white/60 bg-white/65 py-[15px] pl-[17px] pr-3 transition hover:border-[#cbd8cb] hover:shadow-[0_4px_6px_rgba(35,58,43,.09)] dark:border-[#354138] dark:bg-[#202a23]/75 dark:hover:border-[#536957] ${compact ? 'gap-2 py-[11px] pr-[7px]' : ''}`} layout whileHover={{ y: -2 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className={`absolute bottom-0 left-0 top-0 w-[3px] ${task.priority === 'HIGH' ? 'bg-[#cb775d]' : task.priority === 'MEDIUM' ? 'bg-[#d2ae62]' : 'bg-[#79a18b]'}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-[7px]"><h3 className="m-0 min-w-0 break-words text-xs font-semibold leading-[1.5] text-[#344239] dark:text-[#dce5dd] max-[560px]:text-[11px]">{task.title}</h3><Tag className="!m-0 !rounded !border-0 !px-[5px] !text-[9px] !leading-[17px]" color={priorityColors[task.priority]}>{task.priority}</Tag></div>
                {!compact && task.description && <p className="mb-0 mt-[5px] break-words text-[11px] leading-[1.55] text-[#7f8b82] dark:text-[#a4afa6]">{task.description}</p>}
                <div className={`mt-[7px] flex flex-wrap items-center gap-[5px] ${compact ? '!mt-1' : ''}`}>
                    <Tag className={`!m-0 !rounded !border-0 !px-[6px] !text-[9px] !leading-[18px] ${task.status === 'PENDING' ? '!bg-[#f8f2df] !text-[#947331] dark:!bg-[#3a3425] dark:!text-[#dfc17c]' : task.status === 'IN_PROGRESS' ? '!bg-[#eaf1f7] !text-[#4e7290] dark:!bg-[#253646] dark:!text-[#a7c9e3]' : '!bg-[#e8f1e8] !text-[#477456] dark:!bg-[#263b2e] dark:!text-[#b2d3b2]'}`}>{statusLabels[task.status] || task.status}</Tag>
                    <Tag className="!m-0 !rounded !border-0 !bg-[#f0f3ef] !px-[6px] !text-[9px] !leading-[18px] !text-[#748178] dark:!bg-[#303b33] dark:!text-[#bcc8be]">{whenLabels[task.forWhen] || task.forWhen}</Tag>
                    {overdue && <Tag title="Incomplete for at least 3 days" className="!m-0 !rounded !border-0 !bg-[#fae7e1] !px-[6px] !text-[9px] !leading-[18px] !text-[#a64e39] dark:!bg-[#432d28] dark:!text-[#efad9c]">Overdue</Tag>}
                    {created && !Number.isNaN(created.valueOf()) && <span className="text-[9px] text-[#98a29a] dark:text-[#9aa79d]">Added {created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                    {duration && <span className="text-[9px] text-[#98a29a] dark:text-[#9aa79d]">Focus {duration}</span>}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-0">
                {task.status === 'COMPLETED' ? (
                    <Tooltip title="View task note"><Button aria-label="View task note" type="text" icon={<FileText size={17} />} onClick={() => onNote(task)} /></Tooltip>
                ) : <Tooltip title={task.status === 'IN_PROGRESS' ? 'Return to focus' : 'Start focus session'}><Button aria-label="Start focus session" type="text" icon={task.status === 'IN_PROGRESS' ? <Check size={17} /> : <Play size={16} />} onClick={() => onFocus(task)} /></Tooltip>}
                {!compact && task.status !== 'COMPLETED' && <Tooltip title="Edit task"><Button aria-label="Edit task" type="text" icon={<Pencil size={16} />} onClick={() => onEdit(task)} /></Tooltip>}
                {!compact && <Popconfirm title="Delete this task?" description="This action cannot be undone." okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onDelete(task)}><Tooltip title="Delete task"><Button aria-label="Delete task" type="text" danger icon={<Trash2 size={16} />} /></Tooltip></Popconfirm>}
            </div>
        </motion.article>
    );
}