import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function completionLevel(count) {
    if (count >= 5) return 5;
    return count;
}

const heatLevelClasses = {
    0: 'bg-[#edf1ed] dark:bg-[#29352c]',
    1: 'bg-[#d4ead7] dark:bg-[#365a3e]',
    2: 'bg-[#a9d5b0] dark:bg-[#4c8757]',
    3: 'bg-[#73b681] dark:bg-[#65a970]',
    4: 'bg-[#419354] dark:bg-[#81c18a]',
    5: 'bg-[#24713e] dark:bg-[#a0d5a5]',
};

export default function CompletionHeatmap({ tasks }) {
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    const firstDay = new Date(yearStart);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    const lastDay = new Date(yearEnd);
    lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    const weekCount = Math.ceil((lastDay - firstDay + 1) / (7 * 24 * 60 * 60 * 1000));

    const completedByDay = new Map();
    tasks.forEach((task) => {
        if (task.status !== 'COMPLETED' || !task.finishedAt) return;
        const finishedAt = new Date(task.finishedAt);
        if (Number.isNaN(finishedAt.valueOf())) return;
        const finishedDay = new Date(finishedAt.getFullYear(), finishedAt.getMonth(), finishedAt.getDate());
        const key = dateKey(finishedDay);
        if (finishedDay.getFullYear() !== selectedYear) return;
        completedByDay.set(key, (completedByDay.get(key) || 0) + 1);
    });

    const weeks = Array.from({ length: weekCount }, (_, weekIndex) => (
        Array.from({ length: 7 }, (_, dayIndex) => {
            const date = new Date(firstDay);
            date.setDate(firstDay.getDate() + weekIndex * 7 + dayIndex);
            const key = dateKey(date);
            const inSelectedYear = date.getFullYear() === selectedYear;
            return { date, key, count: inSelectedYear ? completedByDay.get(key) || 0 : 0, outsideYear: !inSelectedYear };
        })
    ));

    const dailyTotals = [...completedByDay.entries()].map(([key, count]) => ({ key, count }));
    const totalCompleted = dailyTotals.reduce((total, day) => total + day.count, 0);
    const mostProductiveDay = dailyTotals.reduce((best, day) => day.count > (best?.count || 0) ? day : best, null);
    const bestDayLabel = mostProductiveDay
        ? new Date(`${mostProductiveDay.key}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : 'No completions yet';
    const activeDates = [...new Set(dailyTotals.map((day) => day.key))].sort();
    const longestStreak = activeDates.reduce((best, key, index) => {
        if (index === 0) return { value: 1, label: key };
        const previous = new Date(`${activeDates[index - 1]}T12:00:00`);
        const current = new Date(`${key}T12:00:00`);
        const offset = Math.round((current - previous) / (1000 * 60 * 60 * 24));
        if (offset === 1) {
            const nextValue = best.value + 1;
            return { value: nextValue, label: key };
        }
        return best.value > 1 ? best : { value: 1, label: key };
    }, { value: 0, label: '' });
    const monthLabels = Array.from({ length: 12 }, (_, month) => ({
        month,
        index: weeks.findIndex((week) => week.some((day) => day.date.getMonth() === month && day.date.getDate() === 1)),
    }));

    return (
        <section className="mb-5 border-y border-[#e2e8e2] py-[17px] dark:border-[#303b33]" aria-labelledby="completion-title">
            <div className="mb-[14px] flex items-center justify-between gap-3">
                <div>
                    <span className="text-[9px] font-bold tracking-[1px] text-[#94a097] dark:text-[#96a49a]">DAILY RHYTHM</span>
                    <h2 id="completion-title" className="mb-0 mt-1 font-display text-xl font-normal text-[#334239] dark:text-[#dce5dd]">Completed work</h2>
                </div>
                <div className="flex items-center gap-[5px] rounded-[7px] border border-[#e2e8e2] bg-white p-[3px] dark:border-[#3a473d] dark:bg-[#202a23]" aria-label="Choose heatmap year">
                    <button className="grid size-[26px] place-items-center rounded border-0 bg-transparent text-[#63766a] hover:bg-[#edf3ed] hover:text-[#315c4b] dark:text-[#b5c6b7] dark:hover:bg-[#303b33] dark:hover:text-white" type="button" aria-label="Previous year" onClick={() => setSelectedYear((year) => year - 1)}><ChevronLeft size={15} /></button>
                    <span className="min-w-[42px] text-center text-[11px] font-semibold tabular-nums text-[#45584a] dark:text-[#d6e0d7]" aria-live="polite">{selectedYear}</span>
                    <button className="grid size-[26px] place-items-center rounded border-0 bg-transparent text-[#63766a] hover:bg-[#edf3ed] hover:text-[#315c4b] disabled:cursor-not-allowed disabled:text-[#c0c9c1] dark:text-[#b5c6b7] dark:hover:bg-[#303b33] dark:hover:text-white dark:disabled:text-[#647067]" type="button" aria-label="Next year" onClick={() => setSelectedYear((year) => Math.min(currentYear, year + 1))} disabled={selectedYear >= currentYear}><ChevronRight size={15} /></button>
                </div>
            </div>
            <div className="grid grid-cols-[40%_60%] items-center gap-[22px] max-[800px]:gap-[14px] max-[560px]:grid-cols-1 max-[560px]:gap-[13px]">
                <div className="min-w-0 order-2 md:order-2">
                    <div className="max-w-full overflow-x-auto [scrollbar-color:#cbd8cc_transparent] [scrollbar-width:thin]">
                        <div className="flex w-max items-start gap-2">
                            <div className="grid grid-rows-[repeat(7,11px)] gap-[3px] pt-[18px] text-right text-[8px] leading-[11px] text-[#839087] dark:text-[#9ba89e]" aria-hidden="true">
                                {DAY_LABELS.map((label, index) => <span key={index}>{label}</span>)}
                            </div>
                            <div className="w-max">
                                <div className="grid h-[18px] grid-cols-[repeat(53,11px)] gap-x-[3px] text-[9px] leading-3 text-[#839087] dark:text-[#9ba89e]" aria-hidden="true">
                                    {monthLabels.map(({ month, index }) => <span className="whitespace-nowrap" key={month} style={{ gridColumn: index + 1 }}>{new Date(selectedYear, month, 1).toLocaleDateString(undefined, { month: 'short' })}</span>)}
                                </div>
                                <div className="flex gap-[3px]" role="grid" aria-label={`Completed tasks for each day in ${selectedYear}`}>
                                    {weeks.map((week) => (
                                        <div className="grid grid-rows-[repeat(7,11px)] gap-[3px]" role="row" key={week[0].key}>
                                            {week.map(({ date, key, count, outsideYear }) => {
                                                const label = `${count} ${count === 1 ? 'task' : 'tasks'} completed ${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
                                                return <span key={key} className={`inline-block size-[11px] rounded-[2px] border border-[#1f4d2c0a] ${heatLevelClasses[completionLevel(count)]} ${outsideYear ? 'border-transparent !bg-transparent' : ''}`} role={outsideYear ? undefined : 'gridcell'} aria-label={outsideYear ? undefined : label} title={outsideYear ? undefined : label} aria-hidden={outsideYear ? 'true' : undefined} />;
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-[10px] flex items-center justify-end gap-1 text-[9px] text-[#839087] dark:text-[#9ba89e]" aria-label="Completion count color scale">
                        <span className="mr-0.5">Less</span>
                        {[0, 1, 2, 3, 4, 5].map((level) => <i key={level} className={`inline-block size-[11px] rounded-[2px] border border-[#1f4d2c0a] ${heatLevelClasses[level]}`} aria-hidden="true" />)}
                        <span className="ml-0.5">More</span>
                    </div>
                </div>
                <aside className="order-1 flex min-h-[106px] flex-col justify-center gap-3 border-l border-[#e2e8e2] py-[5px] pl-[18px] pr-[3px] dark:border-[#303b33] max-[560px]:grid max-[560px]:min-h-0 max-[560px]:grid-cols-[auto_1fr_auto_1fr] max-[560px]:items-baseline max-[560px]:gap-x-[7px] max-[560px]:border-l-0 max-[560px]:border-t max-[560px]:pt-[10px] max-[560px]:pl-0 max-[560px]:pr-0" aria-label="Completion summary">
                    <div className="rounded-[14px] border border-[#e9efe8] bg-[#f7faf7] p-[11px] dark:border-[#324036] dark:bg-[#1f2b25]">
                        <span className="text-[9px] font-bold tracking-[1px] text-[#8a978e] dark:text-[#96a49a]">THIS YEAR</span>
                        <div className="mt-[6px] flex items-end gap-[7px]"><span className="font-display text-[37px] leading-none text-[#2d4735] dark:text-[#c5e2c6] max-[560px]:text-[25px]">{totalCompleted}</span><span className="pb-[4px] text-[10px] text-[#7f8b82] dark:text-[#a4b0a6]">tasks</span></div>
                    </div>
                    <div className="grid gap-[7px] rounded-[14px] border border-[#e9efe8] bg-[#f7faf7] p-[10px] dark:border-[#324036] dark:bg-[#1f2b25]">
                        <div className="flex items-center justify-between gap-[5px] text-[9px] leading-[1.5] text-[#849087] dark:text-[#a4b0a6]"><span>Active days</span><strong className="text-right text-[9px] font-semibold text-[#485c4d] dark:text-[#c0cec2]">{dailyTotals.length}</strong></div>
                        <div className="flex items-center justify-between gap-[5px] text-[9px] leading-[1.5] text-[#849087] dark:text-[#a4b0a6]"><span>Best day</span><strong className="text-right text-[9px] font-semibold text-[#485c4d] dark:text-[#c0cec2]">{mostProductiveDay ? `${mostProductiveDay.count} · ${bestDayLabel}` : '—'}</strong></div>
                        <div className="flex items-center justify-between gap-[5px] text-[9px] leading-[1.5] text-[#849087] dark:text-[#a4b0a6]"><span>Focus streak</span><strong className="text-right text-[9px] font-semibold text-[#485c4d] dark:text-[#c0cec2]">{longestStreak.value ? `${longestStreak.value} days` : '—'}</strong></div>
                    </div>
                </aside>
            </div>
        </section>
    );
}