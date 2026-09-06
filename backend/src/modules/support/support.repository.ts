import { queryDatabase } from '../../config/database.js';
import type { SupportActor } from './support.types.js';
type Row = Record<string, unknown>;

const conversationSelect = `SELECT sc.id,sc.help_request_id,sc.student_user_id,sc.mentor_user_id,sc.status,sc.created_at,sc.updated_at,sc.closed_at,
 hr.title,hr.category,hr.is_anonymous,u.full_name student_name,
 CASE WHEN $2='student' THEN COUNT(sm.id) FILTER(WHERE sm.sender_role='mentor' AND sm.created_at>COALESCE(sc.student_last_read_at,'epoch'))
      ELSE COUNT(sm.id) FILTER(WHERE sm.sender_role='student' AND sm.created_at>COALESCE(sc.mentor_last_read_at,'epoch')) END::int unread_count
 FROM support_conversations sc JOIN help_requests hr ON hr.id=sc.help_request_id LEFT JOIN users u ON u.id=sc.student_user_id
 LEFT JOIN support_messages sm ON sm.conversation_id=sc.id
 WHERE ($2='student' AND sc.student_user_id=$1) OR ($2='mentor' AND (sc.mentor_user_id=$1 OR sc.mentor_user_id IS NULL))
 GROUP BY sc.id,hr.id,u.full_name`;

function mapConversation(row: Row, actor: SupportActor) {
  const anonymous=Boolean(row.is_anonymous);
  return { id:String(row.id),helpRequestId:String(row.help_request_id),title:String(row.title),category:String(row.category),isAnonymous:anonymous,status:String(row.status),mentorUserId:row.mentor_user_id?String(row.mentor_user_id):null,
    participantLabel:actor.role==='mentor'?(anonymous?'Anonymous Student':String(row.student_name??'Student')):'CampusCare Mentor',unreadCount:Number(row.unread_count??0),createdAt:row.created_at,updatedAt:row.updated_at,closedAt:row.closed_at??null };
}

export function mapSupportMessage(row:Row,actor:SupportActor){return{id:String(row.id),conversationId:String(row.conversation_id),sender:{role:String(row.sender_role),displayName:row.sender_role==='student'&&Boolean(row.is_anonymous)&&actor.role==='mentor'?'Anonymous Student':String(row.full_name??(row.sender_role==='mentor'?'CampusCare Mentor':'Student'))},message:String(row.message),createdAt:row.created_at}}

export const supportRepository={
  list:async(actor:SupportActor)=>(await queryDatabase<Row>(`${conversationSelect} ORDER BY sc.updated_at DESC`,[actor.id,actor.role])).rows.map(row=>mapConversation(row,actor)),
  find:async(id:string,actor:SupportActor)=>{const row=(await queryDatabase<Row>(`SELECT * FROM (${conversationSelect}) authorized WHERE id=$3`,[actor.id,actor.role,id])).rows[0];return row?mapConversation(row,actor):null},
  findByHelpRequest:async(helpRequestId:string,actor:SupportActor)=>{const row=(await queryDatabase<Row>(`SELECT * FROM (${conversationSelect}) authorized WHERE help_request_id=$3`,[actor.id,actor.role,helpRequestId])).rows[0];return row?mapConversation(row,actor):null},
  claim:async(id:string,mentorId:string)=>(await queryDatabase<Row>(`UPDATE support_conversations SET mentor_user_id=$2 WHERE id=$1 AND status='open' AND (mentor_user_id IS NULL OR mentor_user_id=$2) RETURNING id`,[id,mentorId])).rows[0]??null,
  messages:async(id:string,actor:SupportActor)=>{const rows=(await queryDatabase<Row>(`SELECT history.* FROM (SELECT sm.id,sm.conversation_id,sm.sender_user_id,sm.sender_role,sm.message,sm.created_at,hr.is_anonymous,u.full_name FROM support_messages sm JOIN support_conversations sc ON sc.id=sm.conversation_id JOIN help_requests hr ON hr.id=sc.help_request_id LEFT JOIN users u ON u.id=sm.sender_user_id WHERE sm.conversation_id=$1 AND sm.deleted_at IS NULL UNION ALL SELECT hp.id,sc.id conversation_id,hp.user_id sender_user_id,u.role sender_role,hp.message,hp.created_at,hr.is_anonymous,u.full_name FROM help_replies hp JOIN support_conversations sc ON sc.help_request_id=hp.help_request_id JOIN help_requests hr ON hr.id=hp.help_request_id LEFT JOIN users u ON u.id=hp.user_id WHERE sc.id=$1) history WHERE history.sender_role IN ('student','mentor') ORDER BY history.created_at LIMIT 200`,[id])).rows;return rows.map(row=>mapSupportMessage(row,actor))},
  addMessage:async(id:string,actor:SupportActor,message:string,clientId:string|null)=>{const row=(await queryDatabase<Row>(`INSERT INTO support_messages(conversation_id,sender_user_id,sender_role,message,client_message_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(conversation_id,sender_user_id,client_message_id) DO UPDATE SET message=support_messages.message RETURNING id,conversation_id,sender_role,message,created_at,(xmax=0) inserted`,[id,actor.id,actor.role,message,clientId])).rows[0];if(row.inserted)await queryDatabase('UPDATE support_conversations SET updated_at=NOW() WHERE id=$1',[id]);return row},
  markRead:(id:string,actor:SupportActor)=>queryDatabase(`UPDATE support_conversations SET ${actor.role==='student'?'student_last_read_at':'mentor_last_read_at'}=NOW() WHERE id=$1`,[id]),
  close:async(id:string,mentorId:string)=>(await queryDatabase<Row>(`UPDATE support_conversations SET status='closed',closed_at=NOW() WHERE id=$1 AND mentor_user_id=$2 RETURNING id,status,closed_at`,[id,mentorId])).rows[0]??null,
  participants:async(id:string)=>(await queryDatabase<Row>('SELECT student_user_id,mentor_user_id FROM support_conversations WHERE id=$1',[id])).rows[0]??null,
  metrics:async(start:Date,end:Date)=>(await queryDatabase<Row>(`SELECT COUNT(*) FILTER(WHERE status='open')::int open_support_conversations,COUNT(*) FILTER(WHERE updated_at >= $1 AND updated_at < $2)::int active_support_chats,(SELECT COUNT(*)::int FROM support_messages WHERE created_at >= $1 AND created_at < $2) messages_sent,(SELECT COUNT(*)::int FROM support_conversations WHERE status='open') unresolved_conversations,COUNT(DISTINCT mentor_user_id) FILTER(WHERE mentor_user_id IS NOT NULL)::int active_support_mentors FROM support_conversations`,[start,end])).rows[0]
};
