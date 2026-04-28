import {track} from './analytics.js'

let hls
let mode='saver'
let currentQuality=-1

export function cycleMode(btn,replay){
if(mode==='saver') mode='balanced'
else if(mode==='balanced') mode='hd'
else mode='saver'

btn.textContent=
mode==='saver'?'Saver 360p':
mode==='balanced'?'Balanced':'HD'

track('mode_change',{mode})
if(replay) replay()
}

function config(){
if(mode==='saver'){
return {
startLevel:0,
autoLevelCapping:1,
maxBufferLength:2,
backBufferLength:0,
capLevelToPlayerSize:true
}
}
if(mode==='balanced'){
return {
autoLevelCapping:2,
maxBufferLength:6
}
}
return {autoLevelCapping:-1}
}

export function play(channel,els){
if(hls) hls.destroy()
els.loading.classList.remove('hidden')

hls=new Hls(config())
hls.loadSource(channel.url)
hls.attachMedia(els.video)

hls.on(Hls.Events.MANIFEST_PARSED,()=>{
if(mode==='saver'){
for(let i=0;i<hls.levels.length;i++){
if(hls.levels[i].height<=360){
hls.currentLevel=i
currentQuality=i
break
}
}
}
els.video.play()
els.loading.classList.add('hidden')
buildQuality(els)
track('play_channel',{name:channel.name})
})

hls.on(Hls.Events.ERROR,(e,d)=>{
if(d.fatal) alert('Stream unavailable')
})
}

function buildQuality(els){
if(!hls) return
els.quality.innerHTML=''
hls.levels.forEach((l,i)=>{
let b=document.createElement('button')
b.className='qualityItem'+(i===currentQuality?' active':'')
b.textContent=`${l.height}p`
b.onclick=()=>{
hls.currentLevel=i
currentQuality=i
buildQuality(els)
}
els.quality.appendChild(b)
})
}

export function stop(video){
if(hls){hls.destroy();hls=null}
video.pause()
}