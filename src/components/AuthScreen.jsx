import { useEffect, useState } from 'react';
import { Button, Form, Input, Segmented, Typography } from 'antd';
import { ArrowRight, Eye, EyeOff, Focus, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import QuoteOfDay from './QuoteOfDay.jsx';

const { Paragraph, Text } = Typography;

const focusMessages = ['IDEAS IN MOTION', 'ONE THING AT A TIME', 'MAKE SPACE TO THINK'];

function TypewriterStatus() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const currentMessage = focusMessages[messageIndex];

    useEffect(() => {
        const finishedTyping = typedText === currentMessage;
        const timer = window.setTimeout(() => {
            if (deleting) {
                const nextText = typedText.slice(0, -1);
                setTypedText(nextText);
                if (!nextText) {
                    setDeleting(false);
                    setMessageIndex((index) => (index + 1) % focusMessages.length);
                }
            } else if (finishedTyping) {
                setDeleting(true);
            } else {
                setTypedText(currentMessage.slice(0, typedText.length + 1));
            }
        }, finishedTyping ? 1250 : deleting ? 28 : 62);

        return () => window.clearTimeout(timer);
    }, [currentMessage, deleting, typedText]);

    return (
        <span className="font-mono text-[10px] font-semibold tracking-[1px] text-[#d0e6c2]" aria-label={currentMessage}>
            <span aria-hidden="true">{typedText}</span><span className="ml-0.5 inline-block h-[13px] w-px translate-y-[2px] animate-pulse bg-[#b9d79e]" aria-hidden="true" />
        </span>
    );
}

export default function AuthScreen({ onAuthenticate, theme, onToggleTheme }) {
    const [mode, setMode] = useState('signin');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function submit(values) {
        setBusy(true);
        setError('');
        try {
            await onAuthenticate(mode, values);
        } catch (requestError) {
            setError(requestError.message || 'Unable to continue. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="grid min-h-screen grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-0 overflow-y-auto bg-[#e8ede6] p-[60px] max-[700px]:grid-cols-1">
            <motion.section className="relative flex min-h-[calc(100dvh-120px)] flex-col overflow-hidden rounded-l-md bg-[#202d27] px-[45px] py-9 text-[#f0f5ed] max-[700px]:hidden" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                <motion.div className="pointer-events-none absolute -right-[150px] bottom-16 size-[470px] rounded-full border border-[#d3e6c71f]" animate={{ rotate: 360 }} transition={{ duration: 75, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="pointer-events-none absolute -right-[74px] bottom-[140px] size-[318px] rounded-full border border-[#d3e6c71f]" animate={{ rotate: -360 }} transition={{ duration: 58, repeat: Infinity, ease: 'linear' }} />
                <div className="z-10 flex items-center gap-2.5 text-sm font-bold"><span className="grid size-[30px] place-items-center rounded-[9px] bg-[#b9d79e] text-[#243a30]"><Focus size={19} /></span><span>FocusPlanner</span></div>
                <div className="z-10 my-auto w-full max-w-[760px] py-5 pb-[50px]">
                    <motion.div className="relative mb-8 h-[210px] max-w-[540px] overflow-hidden rounded-[22px] border border-white/15 bg-white/[.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.13),0_22px_55px_rgba(5,15,10,.2)] backdrop-blur-xl max-[900px]:h-[185px] max-[900px]:p-4" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(210,230,210,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(210,230,210,.08) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(135deg, black, transparent 80%)' }} />
                        <div className="relative z-10 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[9px] font-semibold tracking-[1px] text-[#b8c7ba]"><span className="size-[6px] rounded-full bg-[#b9d79e] shadow-[0_0_12px_rgba(185,215,158,.8)]" />FOCUS CONSOLE</span>
                            <span className="rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1 text-[8px] font-medium tracking-[.8px] text-[#9eafa1]">LIVE / 01</span>
                        </div>
                        <div className="absolute inset-x-5 bottom-5 top-[58px] max-[900px]:inset-x-4">
                            <motion.div className="absolute left-[8%] top-[20%] size-[58px] rounded-full border border-[#b9d79e]/70 bg-[#b9d79e]/15 shadow-[0_0_32px_rgba(185,215,158,.15)] backdrop-blur-sm" animate={{ x: [0, 12, -4, 0], y: [0, -7, 8, 0], scale: [1, 1.08, .96, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
                            <motion.div className="absolute left-[34%] top-[8%] size-[34px] rotate-45 border border-[#75c8bc]/80 bg-[#75c8bc]/20 shadow-[0_0_28px_rgba(117,200,188,.2)] backdrop-blur-sm" animate={{ rotate: [45, 135, 225, 405], y: [0, 8, -5, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
                            <motion.div className="absolute left-[55%] top-[40%] size-[46px] rounded-[14px] border border-[#e39c79]/75 bg-[#e39c79]/20 shadow-[0_0_30px_rgba(227,156,121,.18)] backdrop-blur-sm" animate={{ rotate: [0, 18, -12, 0], x: [0, -8, 5, 0], y: [0, -8, 5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
                            <motion.div className="absolute right-[9%] top-[4%] size-0 border-x-[17px] border-b-[30px] border-x-transparent border-b-[#d5bd72]/80 drop-shadow-[0_0_14px_rgba(213,189,114,.25)]" animate={{ y: [0, 9, -4, 0], rotate: [0, -14, 12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                            <motion.div className="absolute right-[31%] bottom-[4%] size-[10px] rounded-full bg-[#a9a3e4] shadow-[0_0_18px_rgba(169,163,228,.8)]" animate={{ scale: [1, 1.5, .8, 1], opacity: [.55, 1, .65, .55] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
                            <div className="absolute bottom-0 left-0 flex items-center gap-2 border-t border-white/10 pt-2.5"><span className="font-mono text-[9px] text-[#7f9885]">&gt;_</span><TypewriterStatus /></div>
                            <span className="absolute bottom-1 right-1 font-mono text-[8px] text-white/30">SYS.READY</span>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                        <p className="mb-4 text-[10px] font-bold tracking-[1px] text-[#b9d79e]">LESS NOISE. MORE MEANING.</p>
                        <h1 className="mb-4 mt-[17px] font-display text-[clamp(43px,5vw,64px)] leading-[1.05] text-[#f4f5ed]">Make room<br />for your best work.</h1>
                        <p className="max-w-[345px] text-[13px] leading-[1.8] text-[#b8c4ba]">A thoughtful place to plan your day, protect your attention, and see good work through.</p>
                    </motion.div>
                </div>
                <div className="z-10 flex items-center gap-[11px] text-[10px] text-[#9daa9e]"><span className="h-px w-6 bg-[#b9d79e]" />A little more focus, every day.</div>
            </motion.section>
            <motion.section className="relative grid min-h-[calc(100dvh-120px)] place-items-center rounded-r-md bg-[#fbfcf9] px-[35px] py-[50px] transition-colors max-[700px]:flex max-[700px]:flex-col max-[700px]:justify-start max-[560px]:px-[23px] max-[560px]:py-[25px] max-[700px]:rounded-md dark:bg-[#151d18]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Button className="!absolute !right-8 !top-8 !grid !size-9 !place-items-center !text-[#526258] dark:!text-[#c3d0c6] max-[560px]:!right-[18px] max-[560px]:!top-[18px]" type="text" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'} icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} onClick={onToggleTheme} />
                <div className="mb-auto hidden w-full items-center gap-[9px] text-[13px] font-bold text-[#314638] max-[700px]:flex max-[560px]:mb-auto"><span className="grid size-[30px] place-items-center rounded-[9px] bg-[#b9d79e] text-[#243a30]"><Focus size={18} /></span> FocusPlanner</div>
                <div className="w-full max-w-[370px] max-[700px]:my-auto max-[560px]:mt-[55px]">
                    <p className="text-[10px] font-bold tracking-[1px] text-[#8b988e] dark:text-[#a2afa4]">YOUR WORKSPACE</p>
                    <h2 className="mb-1 mt-[10px] font-display text-[32px] font-normal text-[#26362c] dark:text-[#e3ebe4] max-[560px]:text-[29px]">{mode === 'signin' ? 'Welcome back' : 'Start with a clean slate'}</h2>
                    <Paragraph className="!mb-[23px] !text-[12px] !text-[#839087] dark:!text-[#a8b4aa]">{mode === 'signin' ? 'Sign in to pick up where you left off.' : 'Create an account and make today count.'}</Paragraph>
                    <Segmented
                        className="!mb-6 !bg-[#edf1eb] !p-1 dark:!bg-[#26312a] [&_.ant-segmented-item]:!text-[11px] [&_.ant-segmented-item]:!text-[#718076] dark:[&_.ant-segmented-item]:!text-[#b1beb4] [&_.ant-segmented-item-selected]:!text-[#315c4b] dark:[&_.ant-segmented-item-selected]:!text-[#d4e8d5]"
                        block
                        value={mode}
                        onChange={(value) => { setMode(value); setError(''); }}
                        options={[{ label: 'Sign in', value: 'signin' }, { label: 'Create account', value: 'signup' }]}
                    />
                    <Form className="[&_.ant-form-item]:!mb-[15px] [&_.ant-form-item-label]:!pb-[5px]" layout="vertical" onFinish={submit} requiredMark={false} key={mode}>
                        {mode === 'signup' && <Form.Item label="Full name" name="name" rules={[{ required: true, message: 'Enter your name.' }]}><Input autoComplete="name" placeholder="Your name" /></Form.Item>}
                        <Form.Item label="Email address" name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email.' }]}><Input autoComplete="email" placeholder="you@example.com" /></Form.Item>
                        <Form.Item label="Password" name="password" rules={[{ required: true, min: mode === 'signup' ? 6 : 1, message: mode === 'signup' ? 'Use at least 6 characters.' : 'Enter your password.' }]}>
                            <Input.Password autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} iconRender={(visible) => visible ? <EyeOff size={16} /> : <Eye size={16} />} />
                        </Form.Item>
                        {error && <div className="mb-[15px] rounded-md border border-[#f1d8d0] bg-[#fff6f2] px-3 py-2.5 text-xs text-[#9a4f3e]" role="alert">{error}</div>}
                        <Button className="!mt-1 !flex !h-11 !items-center !justify-center !gap-[9px] !font-semibold" type="primary" htmlType="submit" loading={busy} block>
                            {mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={17} />
                        </Button>
                    </Form>
                    <Text className="!mt-[18px] !block !text-center !text-[10px] !text-[#9aa49b] dark:!text-[#9ca99f]">Your tasks stay connected to your FocusPlanner account.</Text>
                    <QuoteOfDay variant="login" />
                </div>
            </motion.section>
        </main>
    );
}