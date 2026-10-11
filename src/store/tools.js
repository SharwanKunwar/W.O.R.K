
import {
    BrainCircuit,
    Sparkles,
    Globe,
    Search,
    GraduationCap,
    BookOpen,
    Code2,
    FileText,
    Calculator,
    LibraryBig,
    Youtube,
    Languages,
} from 'lucide-react';

const tools = [
    {
        name: 'ChatGPT',
        description: 'AI assistant for explanations, brainstorming, and coding help.',
        url: 'https://chatgpt.com/',
        icon: BrainCircuit,
    },
    {
        name: 'Claude',
        description: 'AI assistant for writing, reasoning, and understanding documents.',
        url: 'https://claude.ai/',
        icon: Sparkles,
    },
    {
        name: 'Gemini',
        description: 'Google AI assistant for learning, ideas, and problem solving.',
        url: 'https://gemini.google.com/',
        icon: Globe,
    },
    {
        name: 'Perplexity',
        description: 'Research assistant that helps find answers with web sources.',
        url: 'https://www.perplexity.ai/',
        icon: Search,
    },
    {
        name: 'Khan Academy',
        description: 'Free lessons and practice in math, science, and other subjects.',
        url: 'https://www.khanacademy.org/',
        icon: GraduationCap,
    },
    {
        name: 'Coursera',
        description: 'Online courses and professional learning from universities.',
        url: 'https://www.coursera.org/',
        icon: BookOpen,
    },
    {
        name: 'freeCodeCamp',
        description: 'Free coding lessons, programming projects, and certifications.',
        url: 'https://www.freecodecamp.org/',
        icon: Code2,
    },
    {
        name: 'MDN Web Docs',
        description: 'Reliable web development documentation and tutorials.',
        url: 'https://developer.mozilla.org/',
        icon: FileText,
    },
    {
        name: 'Wolfram Alpha',
        description: 'Explore math, equations, calculations, and scientific problems.',
        url: 'https://www.wolframalpha.com/',
        icon: Calculator,
    },
    {
        name: 'Google Scholar',
        description: 'Search academic papers, citations, and scholarly publications.',
        url: 'https://scholar.google.com/',
        icon: LibraryBig,
    },
    {
        name: 'YouTube',
        description: 'Find educational videos, lectures, and visual tutorials.',
        url: 'https://www.youtube.com/',
        icon: Youtube,
    },
    {
        name: 'Duolingo',
        description: 'Practice languages through short interactive lessons.',
        url: 'https://www.duolingo.com/',
        icon: Languages,
    },
];

export default tools;
