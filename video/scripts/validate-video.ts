import {execFileSync} from 'node:child_process';
import {access} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';

const expected=['landing.png','student-dashboard.png','silent-help.png','exam-stress.png','mood-campus.png','ai-study-assistant.png','skill-map.png','events-list.png','team-workspace.png','lost-found.png','mentor-dashboard.png','mentor-support.png','admin-dashboard.png','admin-users.png','audit-logs.png','admin-security.png','campuscare-qr.png'];
await Promise.all(expected.map((name)=>access(path.resolve('public/captures',name))));
const output=path.resolve('out/campuscare-showcase.mp4');
await access(output);

let duration=0;
let width=0;
let height=0;
let frameRate='30/1';

try{
  const bundledProbe=path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe');
  let probe='ffprobe';
  try{await access(bundledProbe);probe=bundledProbe;}catch{/* Use a system ffprobe on other platforms. */}
  const info=execFileSync(probe,['-v','error','-show_entries','format=duration','-show_entries','stream=width,height,r_frame_rate','-of','json',output],{encoding:'utf8'});
  const parsed=JSON.parse(info);
  const video=parsed.streams.find((stream:{width?:number})=>stream.width);
  duration=Number(parsed.format.duration);
  width=video.width;
  height=video.height;
  frameRate=video.r_frame_rate;
}catch{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage();
    const metadata=await page.evaluate(async(src)=>{
      const video=document.createElement('video');
      video.preload='metadata';
      video.src=src;
      await new Promise<void>((resolve,reject)=>{video.onloadedmetadata=()=>resolve();video.onerror=()=>reject(new Error('Browser could not decode the rendered MP4.'));});
      return {duration:video.duration,width:video.videoWidth,height:video.videoHeight};
    },pathToFileURL(output).href);
    ({duration,width,height}=metadata);
  }finally{await browser.close();}
}

if(duration<60||duration>80||width!==1920||height!==1080||frameRate!=='30/1') throw new Error(`Unexpected video metadata: ${duration}s, ${width}x${height}, ${frameRate}.`);
console.log(`Validated ${duration.toFixed(1)}s, 1920x1080, 30fps composition, ${expected.length} assets.`);
