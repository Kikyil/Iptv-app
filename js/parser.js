export function parseM3U(text){
let lines=text.split('\n')
let items=[]
let current={}
for(let l of lines){
l=l.trim()
if(l.startsWith('#EXTINF')){
current={
name:l.split(',').pop(),
logo:(l.match(/tvg-logo="(.*?)"/)||[])[1]||'',
group:(l.match(/group-title="(.*?)"/)||[])[1]||'General'
}
}
else if(l.startsWith('http')){
if(current.name) items.push({...current,url:l})
}
}
return items
}

export async function loadFeed(url){
const r=await fetch(url)
return parseM3U(await r.text())
}