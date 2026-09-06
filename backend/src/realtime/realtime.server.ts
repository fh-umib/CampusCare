import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import { tokenUtils } from '../utils/token.js';
import { logger } from '../utils/logger.js';
import { supportService } from '../modules/support/support.service.js';
import { conversationRoom, registerRealtimeServer, roleRoom, userRoom } from './realtime.events.js';
import { AppError } from '../utils/httpError.js';
import type { PublicUser } from '../types/user.js';
import { requireUuid } from '../utils/moduleValidation.js';

type Ack=(result:{ok:true;data?:unknown}|{ok:false;code:string;message:string})=>void;
const safeFailure=(error:unknown)=>({ok:false as const,code:error&&typeof error==='object'&&'code'in error?String(error.code):'REALTIME_REQUEST_FAILED',message:error instanceof Error?error.message:'Unable to complete realtime request.'});
type RealtimeSocket={join:(room:string)=>void|Promise<unknown>;leave:(room:string)=>void|Promise<unknown>;to:(room:string)=>{emit:(event:string,payload:unknown)=>unknown}};

export function readRealtimeConversationId(payload:unknown){if(!payload||typeof payload!=='object'||!('conversationId'in payload))throw new AppError(400,'A valid conversation ID is required.',[],'REALTIME_INVALID_PAYLOAD');try{return requireUuid(payload.conversationId,'conversationId')}catch{throw new AppError(400,'A valid conversation ID is required.',[],'REALTIME_INVALID_PAYLOAD')}}
export function safeAcknowledgement(candidate:unknown):Ack|undefined{return typeof candidate==='function'?candidate as Ack:undefined}
export async function runRealtimeEvent(event:string,ackCandidate:unknown,operation:()=>Promise<unknown>){const ack=safeAcknowledgement(ackCandidate);try{const data=await operation();ack?.({ok:true,...(data===undefined?{}:{data})})}catch(error){const failure=safeFailure(error);if(ack)ack(failure);else logger.warn('realtime_event_rejected_without_ack',{socketEvent:event,code:failure.code})}}

export function createSupportRealtimeHandlers(socket:RealtimeSocket,user:PublicUser){let lastTyping=0;return{
  join:(payload:unknown,ack?:unknown)=>runRealtimeEvent('support:join',ack,async()=>{const id=readRealtimeConversationId(payload);const conversation=await supportService.join(id,user);await socket.join(conversationRoom(conversation.id));return conversation}),
  leave:(payload:unknown,ack?:unknown)=>runRealtimeEvent('support:leave',ack,async()=>{const id=readRealtimeConversationId(payload);await socket.leave(conversationRoom(id))}),
  message:(payload:unknown,ack?:unknown)=>runRealtimeEvent('support:message',ack,async()=>{const id=readRealtimeConversationId(payload);return supportService.send(id,payload,user)}),
  read:(payload:unknown,ack?:unknown)=>runRealtimeEvent('support:read',ack,async()=>{const id=readRealtimeConversationId(payload);return supportService.markRead(id,user)}),
  typing:(payload:unknown,ack?:unknown)=>runRealtimeEvent('support:typing',ack,async()=>{const id=readRealtimeConversationId(payload);const active='active'in(payload as Record<string,unknown>)?(payload as Record<string,unknown>).active:true;if(typeof active!=='boolean')throw new AppError(400,'Typing state must be a boolean.',[],'REALTIME_INVALID_PAYLOAD');const now=Date.now();if(now-lastTyping<500)return;lastTyping=now;const access=await supportService.authorize(id,user);socket.to(conversationRoom(access.conversation.id)).emit(active?'support:typing':'support:typing:stop',{conversationId:access.conversation.id,displayName:user.role==='student'?'Student':'Mentor'})}),
  typingStop:(payload:unknown,ack?:unknown)=>runRealtimeEvent('support:typing:stop',ack,async()=>{const id=readRealtimeConversationId(payload);const access=await supportService.authorize(id,user);socket.to(conversationRoom(access.conversation.id)).emit('support:typing:stop',{conversationId:access.conversation.id,displayName:user.role==='student'?'Student':'Mentor'})})
}}

export async function authenticateRealtimeToken(token:unknown,getUser=authService.getCurrentUser){if(typeof token!=='string'||!token.trim())throw Object.assign(new Error('Authentication is required.'),{data:{code:'REALTIME_AUTH_REQUIRED'}});const payload=tokenUtils.verify(token);return getUser(payload.userId)}

export function attachRealtimeServer(httpServer:HttpServer){
  const origins=[env.frontendUrl,...(env.nodeEnv==='development'?['http://localhost:5173']:[])].flatMap(value=>value.split(',')).map(value=>value.trim().replace(/\/$/,'')).filter(Boolean);
  const io=new Server(httpServer,{cors:{origin:origins,credentials:true},maxHttpBufferSize:20_000});
  registerRealtimeServer(io);
  io.use(async(socket,next)=>{try{socket.data.user=await authenticateRealtimeToken(socket.handshake.auth?.token);next()}catch(error){const authError=error instanceof Error?error:new Error('Invalid or expired authentication.');if(!('data'in authError))Object.assign(authError,{data:{code:'REALTIME_AUTH_INVALID'}});next(authError)}});
  io.on('connection',socket=>{const user=socket.data.user;void socket.join(userRoom(user.id));if(user.role==='mentor'||user.role==='admin')void socket.join(roleRoom(user.role));const handlers=createSupportRealtimeHandlers(socket,user);
    socket.on('support:join',handlers.join);socket.on('support:leave',handlers.leave);socket.on('support:message',handlers.message);socket.on('support:read',handlers.read);socket.on('support:typing',handlers.typing);socket.on('support:typing:stop',handlers.typingStop);
    logger.info('realtime_connected',{userId:user.id,role:user.role});
  });
  return io;
}
