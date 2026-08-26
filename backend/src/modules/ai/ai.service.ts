import { env } from '../../config/env.js';
import type { PublicUser } from '../../types/user.js';
import { requireCurrentUser, requireUuid } from '../../utils/moduleValidation.js';
import { aiError } from './ai.errors.js';
import { createAiProvider } from './ai.provider.js';
import { aiRepository } from './ai.repository.js';
import { safetyResponse } from './ai.safety.js';
import type { AiProvider } from './ai.types.js';
import { readConversationInput, readConversationUpdate, readMessage, readMode } from './ai.validation.js';

const bursts = new Map<string, number>();
function student(user?: PublicUser) { const current = requireCurrentUser(user); if (current.role !== 'student') throw aiError(403, 'AI_FORBIDDEN', 'The AI Study Assistant is currently available to students only.'); return current; }
async function owned(id: string, userId: string) { requireUuid(id); const conversation = await aiRepository.findOwned(id, userId); if (!conversation) throw aiError(404, 'AI_CONVERSATION_NOT_FOUND', 'Conversation not found.'); return conversation; }

export function deriveTitle(message: string, mode: string) {
  const scrubbed = message.replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '').replace(/https?:\/\/\S+/g, '').replace(/[^\p{L}\p{N}#+. -]/gu, ' ').replace(/\s+/g, ' ').trim();
  const words = scrubbed.split(' ').filter(Boolean).slice(0, 7).join(' ');
  const suffix = mode === 'study-plan' ? ' Plan' : mode === 'practice' ? ' Practice' : mode === 'revision' ? ' Revision' : mode === 'explain' || mode === 'code-help' ? ' Explanation' : '';
  return `${words || 'Study session'}${suffix}`.slice(0, 60).trim();
}

export const aiService = {
  create: async (payload: unknown, user?: PublicUser) => { const u = student(user); const input = readConversationInput(payload); return (await aiRepository.findEmptyConversation(u.id)) ?? aiRepository.createConversation(u.id, input.title, input.mode); },
  list: (user?: PublicUser) => aiRepository.listConversations(student(user).id),
  get: async (id: string, user?: PublicUser) => { const u = student(user); const conversation = await owned(id, u.id); return { conversation, messages: await aiRepository.messages(id) }; },
  update: async (id: string, payload: unknown, user?: PublicUser) => { const u = student(user); await owned(id, u.id); const input = readConversationUpdate(payload); return aiRepository.updateConversation(id, u.id, input.title, input.archived); },
  archive: async (id: string, user?: PublicUser) => { const u = student(user); await owned(id, u.id); await aiRepository.archive(id, u.id); return { archived: true }; },
  message: async (id: string, payload: unknown, user: PublicUser | undefined, provider?: AiProvider, requestId?: string) => {
    const u = student(user); const conversation = await owned(id, u.id); const message = readMessage(payload); const mode = readMode((payload as { mode?: unknown }).mode ?? conversation.mode);
    const now = Date.now(); if (now - (bursts.get(u.id) ?? 0) < 2000) throw aiError(429, 'AI_RATE_LIMITED', 'Please wait a moment before sending another message.'); bursts.set(u.id, now);
    const usage = await aiRepository.reserveDaily(u.id, env.aiDailyMessageLimit); if (!usage) throw aiError(429, 'AI_DAILY_LIMIT_REACHED', 'You have reached today’s AI Study Assistant limit.');
    const safe = safetyResponse(message); const last = await aiRepository.lastMessage(id); const isRetry = last?.role === 'student' && last.content === message;
    const history = await aiRepository.history(id); if (isRetry && history.at(-1)?.role === 'student') history.pop();
    if (!isRetry) await aiRepository.addStudentMessage(id, safe ? '[Sensitive message withheld after safety redirect]' : message, safe ? 'redirected' : 'allowed');
    await aiRepository.setModeAndTitle(id, mode, conversation.title === 'New study session' ? deriveTitle(message, mode) : undefined);
    const started = Date.now();
    try {
      const result = safe ? { response: safe, inputTokens: 0, outputTokens: 0 } : await (provider ?? createAiProvider()).generate({ mode, message, history, requestId });
      const duration = Date.now() - started; await aiRepository.addAssistantMessage(id, result.response, { ...result, duration, safety: safe ? 'redirected' : 'allowed' });
      await Promise.all([aiRepository.recordUsage(u.id, true, result.inputTokens, result.outputTokens, duration), aiRepository.touch(id)]);
      return { message: result.response, remainingToday: env.aiDailyMessageLimit - Number(usage.request_count) };
    } catch (error) { await aiRepository.recordUsage(u.id, false, 0, 0, Date.now() - started); throw error; }
  }
};
