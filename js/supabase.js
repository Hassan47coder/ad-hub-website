import { siteConfig, fallbackCategories, fallbackVideos } from './config.js';
const cfg = siteConfig.supabase;
export const isConfigured = () => Boolean(cfg.url && cfg.anonKey);
const baseUrl = () => cfg.url.replace(/\/+$/, '');
const headers = (token, extra={}) => ({apikey:cfg.anonKey,Authorization:`Bearer ${token || cfg.anonKey}`,'Content-Type':'application/json',...extra});
async function api(path, options={}) {
  const res = await fetch(`${baseUrl()}${path}`, options);
  const body = res.status === 204 ? null : await res.json().catch(()=>null);
  if (!res.ok) throw new Error(body?.message || body?.error_description || `Request failed (${res.status})`);
  return body;
}
export async function getPortfolio() {
  if (!isConfigured()) return {categories:fallbackCategories.map((name,i)=>({id:`local-${i}`,name})),videos:fallbackVideos,source:'demo'};
  try {
    const [categories,videos] = await Promise.all([
      api('/rest/v1/categories?select=*&order=sort_order.asc', {headers:headers()}),
      api('/rest/v1/videos?select=*&order=created_at.desc', {headers:headers()})
    ]);
    return {categories,videos,source:'supabase'};
  } catch (error) {
    console.warn('Supabase unavailable; showing local placeholders.', error);
    return {categories:fallbackCategories.map((name,i)=>({id:`local-${i}`,name})),videos:fallbackVideos,source:'demo'};
  }
}
export async function signIn(email,password){
  const data=await api('/auth/v1/token?grant_type=password',{method:'POST',headers:headers(),body:JSON.stringify({email,password})});
  data.expires_at = data.expires_at || Math.floor(Date.now()/1000) + Number(data.expires_in || 3600);
  localStorage.setItem('adhub_session',JSON.stringify(data)); return data;
}
export function getSession(){try{return JSON.parse(localStorage.getItem('adhub_session'))}catch{return null}}
export function signOut(){localStorage.removeItem('adhub_session')}
async function getValidSession(){
  const session=getSession();
  if(!session?.access_token) throw new Error('Please sign in.');
  if(Number(session.expires_at || 0) > Math.floor(Date.now()/1000) + 60) return session;
  if(!session.refresh_token){signOut();throw new Error('Your session expired. Please sign in again.')}
  try{
    const data=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:session.refresh_token})});
    data.expires_at = data.expires_at || Math.floor(Date.now()/1000) + Number(data.expires_in || 3600);
    localStorage.setItem('adhub_session',JSON.stringify(data));
    return data;
  }catch(error){signOut();throw new Error('Your session expired. Please sign in again.')}
}
async function authed(path,options={}){
  const session=await getValidSession();
  return api(path,{...options,headers:headers(session.access_token,options.headers)});
}
export const adminList = () => Promise.all([
  authed('/rest/v1/categories?select=*&order=sort_order.asc'),
  authed('/rest/v1/videos?select=*&order=created_at.desc')
]);
export const createCategory = name => authed('/rest/v1/categories',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({name})});
export const updateCategory = (id,name) => authed(`/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({name})});
export const deleteCategory = id => authed(`/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});
export const saveVideo = video => video.id
  ? authed(`/rest/v1/videos?id=eq.${encodeURIComponent(video.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...video,id:undefined})})
  : authed('/rest/v1/videos',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(video)});
export const deleteVideo = id => authed(`/rest/v1/videos?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});
export async function uploadFile(file,bucket){
  const session=await getValidSession();
  const isThumbnail=bucket===cfg.thumbnailBucket;
  const maxBytes=isThumbnail?5*1024*1024:50*1024*1024;
  if(file.size>maxBytes) throw new Error(`${isThumbnail?'Thumbnail':'Video'} exceeds the ${isThumbnail?'5 MB':'50 MB'} upload limit. Use a compressed file or external URL.`);
  if(isThumbnail&&!file.type.startsWith('image/')) throw new Error('Thumbnail must be an image file.');
  if(!isThumbnail&&!file.type.startsWith('video/')) throw new Error('Video upload must be a video file.');
  const safe=`${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi,'-')}`;
  const res=await fetch(`${baseUrl()}/storage/v1/object/${bucket}/${safe}`,{method:'POST',headers:{apikey:cfg.anonKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':file.type,'x-upsert':'false'},body:file});
  if(!res.ok) throw new Error((await res.json().catch(()=>({}))).message||'Upload failed');
  return `${baseUrl()}/storage/v1/object/public/${bucket}/${safe}`;
}
export async function deleteUploadedFile(url){
  if(!url || !isConfigured()) return;
  const prefix=`${baseUrl()}/storage/v1/object/public/`;
  if(!url.startsWith(prefix)) return;
  const objectPath=url.slice(prefix.length);
  const [bucket,...pathParts]=objectPath.split('/');
  if(![cfg.videoBucket,cfg.thumbnailBucket].includes(bucket)||!pathParts.length) return;
  const session=await getValidSession();
  const encodedPath=pathParts.map(encodeURIComponent).join('/');
  const res=await fetch(`${baseUrl()}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`,{method:'DELETE',headers:{apikey:cfg.anonKey,Authorization:`Bearer ${session.access_token}`}});
  if(!res.ok&&res.status!==404) throw new Error((await res.json().catch(()=>({}))).message||'Stored file cleanup failed');
}
