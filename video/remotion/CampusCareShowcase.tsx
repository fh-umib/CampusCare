import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile} from 'remotion';
import {CampusCareLogo, FocusArea, RoleTransition, ScreenScene, StatCounter, colors} from './components';

const fps=30;
export const showcaseDurationInFrames=70*fps;
const S=({from,duration,children}:{from:number;duration:number;children:React.ReactNode})=><Sequence from={from*fps} durationInFrames={duration*fps}>{children}</Sequence>;

export const CampusCareShowcase:React.FC=()=> <AbsoluteFill style={{background:colors.navy}}>
  <S from={0} duration={4}><ScreenScene image="landing.png" caption="One platform. One connected student experience." focus={{scale:1.04}}/></S>
  <S from={4} duration={2}><RoleTransition role="Student Workspace" subtitle="One connected experience"/></S>
  <S from={6} duration={4}><ScreenScene image="student-dashboard.png" caption="One connected student workspace." focus={{scale:1.05}}><FocusArea left={1050} top={205} width={650} height={285}/></ScreenScene></S>
  <S from={10} duration={4}><ScreenScene image="silent-help.png" caption="Ask safely. Get support without pressure." pan="center" focus={{scale:1.08,x:-35}}/></S>
  <S from={14} duration={3}><ScreenScene image="exam-stress.png" caption="Track exam pressure early." focus={{scale:1.07}}/></S>
  <S from={17} duration={3}><ScreenScene image="mood-campus.png" caption="Understand wellbeing patterns." focus={{scale:1.07}}/></S>
  <S from={20} duration={3}><ScreenScene image="ai-study-assistant.png" caption="Study support when you need it." pan="center" focus={{scale:1.11,y:-90}}/></S>
  <S from={23} duration={3}><ScreenScene image="skill-map.png" caption="Turn skills into opportunities." focus={{scale:1.07}}/></S>
  <S from={26} duration={3.5}><ScreenScene image="events-list.png" caption="Discover. Build teams. Collaborate." pan="center" focus={{scale:1.04,panY:-45}}/></S>
  <S from={29.5} duration={2.5}><ScreenScene image="team-workspace.png" caption="Opportunities become collaboration." pan="center" focus={{scale:1.08}}/></S>
  <S from={32} duration={3}><ScreenScene image="lost-found.png" caption="Practical campus support in one place." focus={{scale:1.06}}/></S>
  <S from={35} duration={4}><ScreenScene image="mentor-dashboard.png" caption="Support reaches the right person." focus={{scale:1.05}}/></S>
  <S from={39} duration={5}><ScreenScene image="mentor-support.png" caption="Support reaches the right person." pan="center" focus={{scale:1.08,x:-25}}/></S>
  <S from={44} duration={4}><ScreenScene image="admin-dashboard.png" caption="A responsible view of the whole platform." focus={{scale:1.05}}/></S>
  <S from={48} duration={5}><ScreenScene image="admin-users.png" caption="" focus={{scale:1.1,y:-20}}><StatCounter/></ScreenScene></S>
  <S from={53} duration={3}><ScreenScene image="audit-logs.png" caption="Meaningful actions. Protected details." focus={{scale:1.07}}/></S>
  <S from={56} duration={3}><ScreenScene image="admin-security.png" caption="Security is visible by design." pan="center" focus={{scale:1.08}}/></S>
  <S from={59} duration={5}><AbsoluteFill style={{display:'grid',placeContent:'center',textAlign:'center',padding:120,background:colors.navy,color:'#fff',fontFamily:'Inter, Arial'}}><div style={{fontSize:50,lineHeight:1.3}}>CampusCare does not replace<br/>the university management system.</div><div style={{marginTop:26,fontSize:56,fontWeight:800,color:colors.cyan}}>It complements it.</div><div style={{marginTop:18,fontSize:26,color:'#b8cbd7'}}>Flexible enough to grow with university needs.</div></AbsoluteFill></S>
  <S from={64} duration={6}><AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',gap:100,background:`radial-gradient(circle at 25% 15%,rgba(103,227,214,.2),transparent 35%),linear-gradient(140deg,${colors.navy},#0f3045)`,color:'#fff',fontFamily:'Inter, Arial'}}><div><CampusCareLogo size={112}/><div style={{marginTop:24,fontSize:70,fontWeight:850}}>CampusCare</div><div style={{marginTop:16,fontSize:27,color:colors.cyan}}>Wellbeing • Support • Collaboration</div></div><div style={{padding:22,borderRadius:28,background:'#fff',textAlign:'center'}}><Img src={staticFile('captures/campuscare-qr.png')} style={{width:300,height:300}}/><div style={{marginTop:10,fontSize:25,fontWeight:800,color:colors.navy}}>CampusCare</div></div></AbsoluteFill></S>
</AbsoluteFill>;
