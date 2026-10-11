import { Quote } from 'lucide-react';

const dailyQuotes = [
    'Make the next step small enough to begin.',
    'Clarity is often what remains after you remove one thing.',
    'Attention is a resource; spend it on what matters.',
    'A good plan leaves room for being human.',
    'Progress gets quieter when the process gets clearer.',
    'Build for the person who will use this on a busy day.',
    'Start with the need, then let the interface follow.',
    'Useful beats impressive when someone is trying to get things done.',
    'Good design makes the important action feel obvious.',
    'A little less friction can give a lot of time back.',
    'The best next step is one you can actually take.',
    'Make space for the work that deserves your attention.',
    'Consistency is a collection of small returns.',
    'A thoughtful pause can be part of the work.',
    'Solve the real problem before polishing the surface.',
    'Every screen is a conversation with its user.',
    'Good tools respect both time and attention.',
    'A clear choice is a kind choice.',
    'Let the details support the intention.',
    'Small improvements compound into calmer days.',
    'The first draft is a direction, not a destination.',
    'Make it understandable before making it clever.',
    'Useful feedback is a gift to the next iteration.',
    'Focus grows when distractions have somewhere else to go.',
    'A system should help you recover, not demand perfection.',
    'Care is visible in the moments nobody has to think about.',
    'Choose progress you can repeat tomorrow.',
    'Design for the edge cases; people live there too.',
    'A calm experience is built from many considered choices.',
    'Finish one meaningful thing, then choose what comes next.',
];

const wordColors = [
    'text-[#3f7553] dark:text-[#a8d0a9]',
    'text-[#287f86] dark:text-[#82c9c8]',
    'text-[#5276a6] dark:text-[#a0bce2]',
    'text-[#9a7332] dark:text-[#dfc27e]',
    'text-[#ad634f] dark:text-[#e5a391]',
    'text-[#7966a5] dark:text-[#c0b1ed]',
];

function ColorfulQuote({ quote, className }) {
    return (
        <blockquote className={className}>
            {quote.split(/(\s+)/).map((part, index) => /\s+/.test(part)
                ? part
                : <span className={`font-medium ${wordColors[index % wordColors.length]}`} key={`${part}-${index}`}>{part}</span>)}
        </blockquote>
    );
}

function quoteIndexForToday(date = new Date()) {
    const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
    return ((Math.floor(localDay) % dailyQuotes.length) + dailyQuotes.length) % dailyQuotes.length;
}

export default function QuoteOfDay({ variant = 'dashboard' }) {
    const quote = dailyQuotes[quoteIndexForToday()];

    if (variant === 'login') {
        return (
            <section aria-label="Quote of the day" className="mt-7 border-t border-[#e5ebe3] pt-4 dark:border-[#354138]">
                <div className="flex items-start gap-2.5">
                    <Quote className="mt-0.5 shrink-0 text-[#78917b] dark:text-[#9db79e]" size={15} />
                    <div>
                        <p className="mb-1 text-[9px] font-bold tracking-[1px] text-[#8b988e] dark:text-[#9eaaa1]">QUOTE OF THE DAY</p>
                        <ColorfulQuote quote={quote} className="m-0 text-[14px] leading-[1.65]" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section aria-label="Quote of the day" className="flex items-center justify-between gap-5 border-y border-[#e3e9e2] py-3 dark:border-[#303b33] max-[560px]:items-start">
            <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#e9f0e7] text-[#6a886e] dark:bg-[#29392d] dark:text-[#a9c7a9]"><Quote size={14} /></span>
                <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-bold tracking-[1px] text-[#89968d] dark:text-[#9eaaa1]">QUOTE OF THE DAY</p>
                    <ColorfulQuote quote={quote} className="m-0 text-[15px] leading-[1.6] max-[560px]:text-[13px]" />
                </div>
            </div>
            <span className="shrink-0 pt-0.5 text-[9px] font-semibold tracking-[.7px] text-[#98a49a] dark:text-[#89968d] max-[560px]:hidden">A DAILY REMINDER</span>
        </section>
    );
}
