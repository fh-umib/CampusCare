export const aiModes = ['question','explain','study-plan','summarize','practice','code-help','revision'] as const;
export type AiMode = typeof aiModes[number];
export type AiAnswer = { answer: string; summary: string; keyPoints: string[]; nextSteps: string[]; practiceQuestions: string[]; disclaimer: string };
export type AiProviderResult = { response: AiAnswer; responseId?: string; inputTokens: number; outputTokens: number };
export interface AiProvider { generate(input: { mode: AiMode; message: string; history: Array<{ role: 'student'|'assistant'; content: string }>; requestId?: string; signal?: AbortSignal }): Promise<AiProviderResult>; }
