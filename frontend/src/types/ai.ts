export type AiMode='question'|'explain'|'study-plan'|'summarize'|'practice'|'code-help'|'revision';
export type AiAnswer={answer:string;summary:string;keyPoints:string[];nextSteps:string[];practiceQuestions:string[];disclaimer:string};
export type AiConversation={id:string;title:string;mode:AiMode;created_at:string;updated_at:string;message_count?:number};
export type AiMessage={id:string;role:'student'|'assistant';content:string;structured_content?:AiAnswer|null;created_at:string};
