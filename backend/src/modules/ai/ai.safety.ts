import { aiError } from './ai.errors.js';
const crisis = /\b(suicide|kill myself|self[- ]harm|want to die)\b/i;
const secrets = /\b(password|api key|jwt secret|database url)\b.*\b(show|give|reveal|steal|find)\b/i;
const injection = /\b(ignore (all|previous)|reveal (the )?system prompt|hidden instructions)\b/i;
const cheating = /\b(take (my|this) exam|cheat|write my graded|impersonate me)\b/i;
export function safetyResponse(message: string) {
  if (crisis.test(message)) return { answer:'I’m sorry you’re dealing with this. Please contact a trusted person now and use your local emergency or crisis support service if you may be in immediate danger. I am not a therapist and cannot provide crisis care.', summary:'Please seek immediate human support.', keyPoints:['Contact someone you trust','Use local emergency or crisis support if danger is immediate'], nextSteps:['Step away from studying and reach out now'], practiceQuestions:[], disclaimer:'CampusCare AI cannot provide medical or crisis care.' };
  if (secrets.test(message) || injection.test(message)) throw aiError(400,'AI_INPUT_INVALID','That request cannot be handled by the study assistant.');
  if (cheating.test(message)) return { answer:'I can help you learn the material, plan revision, or practice similar questions, but I cannot complete an exam or graded submission for you.', summary:'I can support learning, not academic dishonesty.', keyPoints:['Ask for an explanation or practice'], nextSteps:['Share the topic you want to understand'], practiceQuestions:[], disclaimer:'AI-generated study guidance should be verified.' };
  return null;
}
