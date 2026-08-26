import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { aiError } from './ai.errors.js';
import { modeInstruction, SYSTEM_INSTRUCTIONS } from './ai.prompts.js';
import type { AiAnswer, AiProvider, AiProviderResult } from './ai.types.js';
import { logger } from '../../utils/logger.js';

const schema = { type:'object', additionalProperties:false, required:['answer','summary','keyPoints','nextSteps','practiceQuestions','disclaimer'], properties:{ answer:{type:'string'}, summary:{type:'string'}, keyPoints:{type:'array',items:{type:'string'}}, nextSteps:{type:'array',items:{type:'string'}}, practiceQuestions:{type:'array',items:{type:'string'}}, disclaimer:{type:'string'} } } as const;
const QUOTA_UNAVAILABLE_MESSAGE = 'AI Study Assistant is currently unavailable because the AI service is not enabled for this deployment. Your CampusCare account and saved study sessions are still available.';

function providerErrorCode(error: unknown) {
  if (!error || typeof error !== 'object') return undefined;
  if ('code' in error && error.code) return String(error.code);
  if ('error' in error && error.error && typeof error.error === 'object' && 'code' in error.error) return String(error.error.code);
  return undefined;
}

export class OpenAiResponsesProvider implements AiProvider {
  private client: OpenAI;
  constructor(apiKey = env.openAiApiKey) {
    if (!apiKey) throw aiError(503,'AI_ASSISTANT_UNAVAILABLE','The AI Study Assistant is temporarily unavailable.');
    this.client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 });
  }
  async generate(input: Parameters<AiProvider['generate']>[0]): Promise<AiProviderResult> {
    const started = Date.now();
    try {
      const response = await this.client.responses.create({ model: env.openAiModel, instructions: SYSTEM_INSTRUCTIONS, input: [...input.history.slice(-8).map((item) => ({ role: item.role === 'student' ? 'user' as const : 'assistant' as const, content: item.content })), { role:'user', content:`Study mode: ${modeInstruction(input.mode)}\n\nStudent message:\n${input.message}` }], max_output_tokens: env.aiMaxOutputTokens, text:{ format:{ type:'json_schema', name:'study_assistant_response', strict:true, schema } } }, { signal: input.signal });
      if (!response.output_text) throw aiError(502,'AI_RESPONSE_INVALID','The AI response could not be prepared.');
      let parsed: AiAnswer;
      try { parsed = JSON.parse(response.output_text) as AiAnswer; } catch { throw aiError(502,'AI_RESPONSE_INVALID','The AI response could not be prepared.'); }
      return { response: parsed, responseId: response.id, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 };
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : undefined;
      const providerCode = providerErrorCode(error);
      logger.error('ai_provider_request_failed', { requestId: input.requestId, status, type: error instanceof Error ? error.name : 'UnknownError', code: providerCode, durationMs: Date.now() - started });
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'APIConnectionTimeoutError')) throw aiError(504,'AI_REQUEST_TIMEOUT','The AI request timed out. Please try again.');
      if (error && typeof error === 'object' && 'code' in error && String(error.code).startsWith('AI_')) throw error;
      if (providerCode === 'insufficient_quota') throw aiError(503,'AI_PROVIDER_QUOTA_UNAVAILABLE',QUOTA_UNAVAILABLE_MESSAGE);
      if (status === 429) throw aiError(429,'AI_PROVIDER_RATE_LIMITED','The AI provider is busy. Please try again shortly.');
      if (status === 401 || status === 403) throw aiError(503,'AI_PROVIDER_CONFIGURATION_ERROR','The AI Study Assistant is temporarily unavailable.');
      throw aiError(503,'AI_PROVIDER_UNAVAILABLE','The AI Study Assistant is temporarily unavailable.');
    }
  }
}

export const createAiProvider = (): AiProvider => new OpenAiResponsesProvider();
