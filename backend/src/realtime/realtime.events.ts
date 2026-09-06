import type { Server } from 'socket.io';

let io: Server | null = null;
export const userRoom=(id:string)=>`user:${id}`;
export const roleRoom=(role:string)=>`role:${role}`;
export const conversationRoom=(id:string)=>`support:${id}`;
export function registerRealtimeServer(server:Server){io=server}
export function emitToUser(userId:string,event:string,payload:unknown){io?.to(userRoom(userId)).emit(event,payload)}
export function emitToRole(role:string,event:string,payload:unknown){io?.to(roleRoom(role)).emit(event,payload)}
export function emitToConversation(id:string,event:string,payload:unknown){io?.to(conversationRoom(id)).emit(event,payload)}
