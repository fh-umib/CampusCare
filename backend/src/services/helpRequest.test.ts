import assert from 'node:assert/strict';
import test from 'node:test';
import { helpRequestService } from './helpRequest.service.js';
import { helpRequestRepository } from '../repositories/helpRequest.repository.js';
import { notificationService } from './notification.service.js';
import { supportService } from '../modules/support/support.service.js';
import type { PublicUser } from '../types/user.js';

const student:PublicUser={id:'10000000-0000-4000-8000-000000000011',role:'student',fullName:'Private Student',email:'private@example.com',createdAt:new Date(),updatedAt:new Date()};
const request={id:'30000000-0000-4000-8000-000000000011',userId:student.id,title:'Need help',category:'subject',description:'Private context',isAnonymous:true,status:'open',studentName:'Anonymous Student',createdAt:new Date(),updatedAt:new Date(),replies:[]};

test('student creation sends queue notifications only to mentor and admin roles',async()=>{const repo=helpRequestRepository as unknown as Record<string,unknown>,notifications=notificationService as unknown as Record<string,unknown>;const originalCreate=repo.create,originalNotification=notifications.create;const sent:Array<Record<string,unknown>>=[];try{repo.create=async()=>request;notifications.create=async(input:Record<string,unknown>)=>{sent.push(input);return{}};await helpRequestService.create({title:'Need help',category:'subject',description:'Private context',isAnonymous:true},student);assert.deepEqual(sent.map(item=>item.role).sort(),['admin','mentor']);assert.equal(sent.some(item=>item.userId===student.id),false);assert.ok(sent.every(item=>String(item.link)===`/silent-help?request=${request.id}`));assert.equal(JSON.stringify(sent).includes(student.fullName),false)}finally{repo.create=originalCreate;notifications.create=originalNotification}});

test('legacy reply action delegates to the canonical persisted support conversation',async()=>{const repo=helpRequestRepository as unknown as Record<string,unknown>,support=supportService as unknown as Record<string,unknown>;const originalFind=repo.findById,originalSend=support.sendByHelpRequest;const mentor:PublicUser={...student,id:'10000000-0000-4000-8000-000000000012',role:'mentor',fullName:'Mentor',email:'mentor@example.com'};let delegated:Record<string,unknown>|null=null;try{repo.findById=async()=>request;support.sendByHelpRequest=async(id:string,payload:Record<string,unknown>)=>{delegated={id,...payload};return{message:payload.message}};await helpRequestService.reply(request.id,{message:'Reply'},mentor);assert.deepEqual(delegated,{id:request.id,message:'Reply'})}finally{repo.findById=originalFind;support.sendByHelpRequest=originalSend}});
