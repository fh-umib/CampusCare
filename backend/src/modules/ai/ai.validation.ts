import { env } from '../../config/env.js';
import { optionalBoolean, requireObject, requireString } from '../../utils/moduleValidation.js';
import { aiError } from './ai.errors.js';
import { aiModes, type AiMode } from './ai.types.js';

export function readMode(value: unknown): AiMode {
  if (typeof value !== 'string' || !aiModes.includes(value as AiMode)) throw aiError(400, 'AI_INPUT_INVALID', 'Select a valid study mode.');
  return value as AiMode;
}
export function readMessage(payload: unknown) {
  const value = requireString(requireObject(payload).message, 'message');
  if (value.length > env.aiMaxInputLength) throw aiError(400, 'AI_MESSAGE_TOO_LONG', `Message must be ${env.aiMaxInputLength} characters or fewer.`);
  return value;
}
export function readConversationInput(payload: unknown) {
  const data = requireObject(payload);
  return { title: requireString(data.title ?? 'New study session', 'title', 100), mode: readMode(data.mode ?? 'question') };
}
export function readConversationUpdate(payload: unknown) {
  const data = requireObject(payload);
  return { title: data.title === undefined ? undefined : requireString(data.title, 'title', 100), archived: data.archived === undefined ? undefined : optionalBoolean(data.archived, 'archived', false) };
}
