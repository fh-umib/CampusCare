import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const colors = {navy: '#071527', navy2: '#0b1d35', teal: '#0d9e8a', cyan: '#67e3d6', white: '#f8fbfd'};

export const CampusCareLogo: React.FC<{size?: number}> = ({size = 76}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-label="CampusCare logo">
    <defs><linearGradient id="ccg" x1="8" y1="8" x2="56" y2="56"><stop stopColor={colors.cyan}/><stop offset="1" stopColor={colors.teal}/></linearGradient></defs>
    <rect x="3" y="3" width="58" height="58" rx="18" fill="url(#ccg)"/>
    <path d="M18 26.5 32 18l14 8.5L32 35 18 26.5Z" fill="#071527" opacity=".92"/>
    <path d="M23 32v9c6 4 12 4 18 0v-9l-9 5.5L23 32Z" fill="#fff"/>
    <path d="M47 28v11" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

type SceneFocus={scale?:number;x?:number;y?:number;panY?:number};

export const BrowserFrame: React.FC<{src:string;pan?:'top'|'center'|'bottom';focus?:SceneFocus}> = ({src,pan='top',focus={}}) => {
  const frame = useCurrentFrame();
  const scale = (focus.scale??1.04)+interpolate(frame,[0,180],[0,.025],{extrapolateRight:'clamp'});
  const panY=interpolate(frame,[0,180],[0,focus.panY??0],{extrapolateRight:'clamp'});
  const objectPosition = pan === 'bottom' ? 'center bottom' : pan === 'center' ? 'center center' : 'center top';
  return <div style={{position:'absolute', inset:'64px 82px 84px', borderRadius:28, overflow:'hidden', background:colors.navy2, boxShadow:'0 38px 90px rgba(0,0,0,.36)', border:'1px solid rgba(103,227,214,.22)'}}>
    <div style={{height:54, display:'flex', alignItems:'center', gap:10, padding:'0 20px', background:'#e9f0f5', borderBottom:'1px solid #d4e0e8'}}>
      {['#ff6b6b','#ffd166','#55d6a6'].map((c) => <span key={c} style={{width:13,height:13,borderRadius:'50%',background:c}}/>)}
      <div style={{marginLeft:18, flex:1, maxWidth:620, borderRadius:10, padding:'8px 18px', background:'#fff', color:'#526174', fontSize:18}}>campuscare-platform.vercel.app</div>
    </div>
    <div style={{height:'calc(100% - 54px)',overflow:'hidden',background:colors.navy2}}><Img src={staticFile(`captures/${src}`)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition,transform:`translate3d(${focus.x??0}px,${(focus.y??0)+panY}px,0) scale(${scale})`}}/></div>
  </div>;
};

export const Caption: React.FC<{children: React.ReactNode; align?: 'left'|'center'}> = ({children, align='left'}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const y=spring({frame,fps,config:{damping:18,stiffness:90}});
  return <div style={{position:'absolute',left:align==='center'?220:150,right:align==='center'?220:'auto',bottom:42,transform:`translateY(${(1-y)*18}px)`,opacity:y,textAlign:align,color:'#fff',fontSize:34,fontWeight:700,lineHeight:1.18,textShadow:'0 4px 20px rgba(0,0,0,.6)'}}>{children}</div>;
};

export const FocusArea: React.FC<{left:number;top:number;width:number;height:number}> = (p) => {
  const frame=useCurrentFrame(); const alpha=interpolate(frame,[0,12,120,145],[0,.9,.9,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <div style={{position:'absolute',...p,border:`4px solid ${colors.cyan}`,borderRadius:18,boxShadow:`0 0 0 9999px rgba(7,21,39,${.2*alpha}), 0 0 28px rgba(103,227,214,.55)`,opacity:alpha}}/>;
};

export const ScreenScene: React.FC<{image:string;caption:string;children?:React.ReactNode;pan?:'top'|'center'|'bottom';focus?:SceneFocus}> = ({image,caption,children,pan,focus}) => {
  const frame=useCurrentFrame();const opacity=interpolate(frame,[0,8],[.72,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{opacity,background:`radial-gradient(circle at 85% 5%, rgba(103,227,214,.18), transparent 36%), linear-gradient(145deg,${colors.navy},${colors.navy2})`,fontFamily:'Inter, Arial, sans-serif'}}>
    <BrowserFrame src={image} pan={pan} focus={focus}/><Caption>{caption}</Caption>{children}
  </AbsoluteFill>;
};

export const RoleTransition: React.FC<{role:string;subtitle:string}> = ({role,subtitle}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const enter=spring({frame,fps,config:{damping:16}});
  return <AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg,${colors.navy},#0f3045)`,color:'#fff',fontFamily:'Inter, Arial'}}><div style={{textAlign:'center',opacity:enter,transform:`scale(${.96+.04*enter})`}}><CampusCareLogo size={92}/><div style={{marginTop:26,fontSize:22,letterSpacing:6,textTransform:'uppercase',color:colors.cyan}}>{role}</div><div style={{marginTop:12,fontSize:52,fontWeight:750}}>{subtitle}</div></div></AbsoluteFill>;
};

export const StatCounter: React.FC = () => {const f=useCurrentFrame(); const n=Math.round(interpolate(f,[0,35],[0,23],{extrapolateRight:'clamp'})); return <div style={{position:'absolute',inset:0,display:'grid',placeContent:'center',textAlign:'center',pointerEvents:'none'}}><div style={{fontSize:180,fontWeight:850,color:'#fff',lineHeight:.9,textShadow:'0 8px 38px rgba(0,0,0,.65)'}}>{n}</div><div style={{marginTop:20,fontSize:35,fontWeight:800,letterSpacing:9,color:colors.cyan}}>REAL USERS</div></div>};
