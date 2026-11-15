import {chromium, type Locator, type Page} from 'playwright';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const videoEnvPath=path.resolve('.env.video.local');
const envResult=dotenv.config({path:videoEnvPath,override:false});
if(envResult.error) throw new Error('Unable to load the root .env.video.local file.');

const captures=path.resolve('public/captures');
const base=(process.env.CAMPUSCARE_BASE_URL ?? 'http://localhost:5173').replace(/\/$/,'');
const production=(process.env.CAMPUSCARE_PRODUCTION_URL ?? 'https://campuscare-platform.vercel.app').replace(/\/$/,'');
const required=['CAMPUSCARE_STUDENT_EMAIL','CAMPUSCARE_STUDENT_PASSWORD','CAMPUSCARE_MENTOR_EMAIL','CAMPUSCARE_MENTOR_PASSWORD','CAMPUSCARE_ADMIN_EMAIL','CAMPUSCARE_ADMIN_PASSWORD'] as const;
const missing=required.filter((key)=>!process.env[key]);
if(missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}. Values are never logged.`);
if(process.argv.includes('--validate-env')) {
  console.log(`Environment validation passed: all ${required.length} required CampusCare video variables are detected.`);
  console.log('CAMPUSCARE_BASE_URL is available from .env.video.local, the shell, or the safe localhost default.');
  process.exit(0);
}

const credentials={
  student:{email:process.env.CAMPUSCARE_STUDENT_EMAIL!,password:process.env.CAMPUSCARE_STUDENT_PASSWORD!},
  mentor:{email:process.env.CAMPUSCARE_MENTOR_EMAIL!,password:process.env.CAMPUSCARE_MENTOR_PASSWORD!},
  admin:{email:process.env.CAMPUSCARE_ADMIN_EMAIL!,password:process.env.CAMPUSCARE_ADMIN_PASSWORD!},
};

async function ensureThemePreference(page:Page){
  const lightMode=page.getByRole('button',{name:/continue in light mode/i});
  if(await lightMode.isVisible().catch(()=>false)) {
    await lightMode.click();
    await page.locator('.cc-theme-welcome').waitFor({state:'detached',timeout:5000}).catch(()=>undefined);
  }
}
async function ready(page:Page){await page.waitForLoadState('domcontentloaded');await ensureThemePreference(page);await page.waitForTimeout(900);}
async function waitForHeading(page:Page,name:RegExp){
  await page.getByRole('heading',{name}).first().waitFor({state:'visible',timeout:15000});
  await page.waitForTimeout(500);
}
async function assertCaptureContent(page:Page,name:string){
  const visibleText=(await page.locator('body').innerText()).replace(/\s+/g,' ').trim();
  if(visibleText.length<120) throw new Error(`CampusCare video capture ${name} was rejected because the page content is blank or incomplete.`);
}
async function firstVisible(locators:Locator[],description:string){
  for(const locator of locators){
    const candidate=locator.first();
    if(await candidate.isVisible().catch(()=>false)) return candidate;
  }
  throw new Error(`Required login ${description} was not found.`);
}
async function redact(page:Page){
  await page.evaluate(()=>{const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const value=node.textContent??'';if(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(value))node.textContent=value.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'Private account');if(/discord\.gg\/|discord\.com\/invite\//i.test(value))node.textContent='Private collaboration link';}});
}
async function shot(page:Page,name:string){await assertCaptureContent(page,name);await redact(page);await page.screenshot({path:path.join(captures,name),fullPage:false});console.log(`Captured ${name}`);}
async function gotoShot(page:Page,url:string,name:string,heading:RegExp){await page.goto(`${base}${url}`,{waitUntil:'domcontentloaded'});await ready(page);await waitForHeading(page,heading);await shot(page,name);}
async function login(page:Page,role:keyof typeof credentials){
  await page.goto(`${base}/login?role=${role}`,{waitUntil:'domcontentloaded'});await ready(page);
  if(role==='student') await shot(page,'student-login.png');
  const email=await firstVisible([
    page.getByLabel(/email/i),
    page.getByPlaceholder(/email/i),
    page.locator('input[type="email"]'),
    page.locator('input[name="email"]'),
  ],'email field');
  const password=await firstVisible([
    page.getByLabel(/password/i),
    page.getByPlaceholder(/password/i),
    page.locator('input[type="password"]'),
    page.locator('input[name="password"]'),
  ],'password field');
  const submit=await firstVisible([
    page.getByRole('button',{name:/sign in|login/i}),
    page.locator('button[type="submit"]'),
  ],'submit button');
  await email.fill(credentials[role].email);
  await password.fill(credentials[role].password);
  await submit.click();
  const code=page.getByLabel(/verification code/i).first();
  const outcome=await Promise.any([
    page.waitForURL(/\/dashboard(?:\/|$|\?)/,{timeout:20000}).then(()=> 'dashboard' as const),
    code.waitFor({state:'visible',timeout:20000}).then(()=> 'two-factor' as const),
  ]).catch(()=>null);
  if(outcome==='two-factor'){
    const totp=process.env.CAMPUSCARE_ADMIN_TOTP;
    if(!totp) throw new Error('Admin account requires 2FA. Supply CAMPUSCARE_ADMIN_TOTP from the test authenticator; automation will not bypass it.');
    await code.fill(totp);
    await page.getByRole('button',{name:/verify and continue/i}).click();
    await page.waitForURL(/\/dashboard(?:\/|$|\?)/,{timeout:20000}).catch(()=>undefined);
  }
  if(!/\/dashboard(?:\/|$|\?)/.test(new URL(page.url()).pathname)) throw new Error(`${role[0].toUpperCase()}${role.slice(1)} login failed: dashboard was not reached.`);
  await ready(page);
}
async function reset(page:Page){await page.evaluate(()=>localStorage.clear());await page.context().clearCookies();}

await mkdir(captures,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,colorScheme:'light'});
const page=await context.newPage();
try{
  const missingOnly=process.argv.includes('--missing-only');
  if(!missingOnly) await gotoShot(page,'/','landing.png',/supporting students/i);
  await login(page,'student');
  if(!missingOnly){await waitForHeading(page,/your student workspace/i);await shot(page,'student-dashboard.png');}
  await gotoShot(page,'/silent-help','silent-help.png',/silent help/i);
  if(!missingOnly) await gotoShot(page,'/stress-tracker','exam-stress.png',/exam pressure|examstress/i);
  if(!missingOnly) await gotoShot(page,'/mood-campus','mood-campus.png',/mood|wellbeing/i);
  await gotoShot(page,'/ai-study-assistant','ai-study-assistant.png',/ai study assistant/i);
  if(!missingOnly) await gotoShot(page,'/skill-map','skill-map.png',/skillmap|skills/i);
  await page.goto(`${base}/opportunities`,{waitUntil:'domcontentloaded'});await ready(page);
  await waitForHeading(page,/hackathons.*events/i);
  await page.getByRole('link',{name:'View opportunity'}).nth(1).waitFor({state:'visible',timeout:15000});
  await page.evaluate(()=>{document.body.style.zoom='0.72';});await page.waitForTimeout(500);await shot(page,'events-list.png');
  await page.evaluate(()=>{document.body.style.zoom='';});
  const opportunity=page.getByRole('link',{name:'View opportunity'}).first();
  if(await opportunity.isVisible().catch(()=>false)){await opportunity.click();await ready(page);}
  const teamWorkspace=page.locator('a[href*="/teams/"]').first();
  if(await teamWorkspace.count()){
    await teamWorkspace.click();await ready(page);
    await page.getByRole('heading',{name:/team overview/i}).waitFor({state:'visible',timeout:15000});
    await page.waitForTimeout(500);
  }
  await shot(page,'team-workspace.png');
  await gotoShot(page,'/lost-found','lost-found.png',/lost.*found|campus items/i);
  if(missingOnly){console.log('Missing and replacement Student captures complete.');await browser.close();process.exit(0);}
  await reset(page);await login(page,'mentor');await waitForHeading(page,/mentor|support workspace/i);await shot(page,'mentor-dashboard.png');await gotoShot(page,'/silent-help','mentor-support.png',/silent help/i);
  await reset(page);await login(page,'admin');await shot(page,'admin-dashboard.png');
  await page.goto(`${base}/admin/users`,{waitUntil:'domcontentloaded'});await ready(page);
  const usersText=await page.locator('body').innerText();
  if(!/\b23\b/.test(usersText)) throw new Error('Registered Users does not visibly confirm the approved 23 real users claim. Capture stopped.');
  await shot(page,'admin-users.png');
  await gotoShot(page,'/audit-logs','audit-logs.png',/audit logs/i);await gotoShot(page,'/profile','admin-security.png',/profile|admin console identity/i);
  const qr=await QRCode.toDataURL(production,{width:720,margin:2,errorCorrectionLevel:'H'});await writeFile(path.join(captures,'campuscare-qr.png'),Buffer.from(qr.split(',')[1],'base64'));
  console.log('Capture complete. Credentials and tokens were not logged.');
}finally{await browser.close();}
