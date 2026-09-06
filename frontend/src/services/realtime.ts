import { io, type Socket } from 'socket.io-client';

const API_URL=import.meta.env.VITE_API_URL??import.meta.env.VITE_API_BASE_URL??'http://localhost:5000/api';
const SOCKET_URL=import.meta.env.VITE_SOCKET_URL??API_URL.replace(/\/api\/?$/,'');
let socket:Socket|null=null;
const listeners=new Map<string,Set<(payload:unknown)=>void>>();

export const realtimeService={
  connect(token:string){if(socket?.connected)return socket;if(socket)socket.disconnect();socket=io(SOCKET_URL,{autoConnect:true,auth:{token},transports:['websocket','polling']});for(const[event,callbacks]of listeners)for(const callback of callbacks)socket.on(event,callback);return socket},
  disconnect(){socket?.removeAllListeners();socket?.disconnect();socket=null},
  on<T>(event:string,listener:(payload:T)=>void){const callback=listener as (payload:unknown)=>void;const callbacks=listeners.get(event)??new Set();callbacks.add(callback);listeners.set(event,callbacks);socket?.on(event,callback);return()=>{socket?.off(event,callback);callbacks.delete(callback);if(!callbacks.size)listeners.delete(event)}},
  emit<T>(event:string,payload:unknown,ack?:(response:T)=>void){if(ack)socket?.timeout(5000).emit(event,payload,ack);else socket?.emit(event,payload)},
  connected(){return Boolean(socket?.connected)}
};
