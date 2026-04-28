import {REGISTRY,HOME_RAILS} from './config.js'
import {loadFeed} from './parser.js'
import {isFavorite,toggleFavorite,getFavorites} from './favorites.js'
import {play,stop,cycleMode} from './player.js'
import {grouped} from './browse.js'

const $=id=>document.getElementById(id)

const els={
content:$('content'),
hero:$('hero'),
home:$('homeView'),
player:$('playerView'),
video:$('video'),
loading:$('loading'),
quality:$('qualityOptions')
}

let currentChannels=[]
let currentPlaying=null

function card(ch){
let heart=isFavorite(ch.url)?'♥':'♡'
return `
<div class='card'>
<button class='heart ${isFavorite(ch.url)?'active':''}' data-f='${ch.url}'>${heart}</button>
<div class='playable' data-url='${encodeURIComponent(JSON.stringify(ch))}'>
<div class='logoBox'><img src='${ch.logo}'></div>
<div>${ch.name}</div>
<div class='meta'>${ch.group||'General'}</div>
</div>
</div>`
}

function bindCards(){
document.querySelectorAll('.playable').forEach(el=>{
el.onclick=()=>openPlayer(
JSON.parse(decodeURIComponent(el.dataset.url))
)
})

document.querySelectorAll('.heart').forEach(b=>{
b.onclick=(e)=>{
e.stopPropagation()
toggleFavorite(b.dataset.f,b)
}
})
}

async function buildHome(){
els.content.innerHTML=''
els.hero.innerHTML=`
<div>
<h1>Featured Live</h1>
<button id='heroWatch' class='heroButton'>Watch Now</button>
</div>`

for(let r of HOME_RAILS){
let url=REGISTRY.categories.find(x=>x[0].includes(r))[1]
let feed=(await loadFeed(url)).slice(0,12)
let sec=document.createElement('section')
sec.className='rail'
sec.innerHTML=`
<h2>${r}</h2>
<div class='row'>${feed.map(card).join('')}</div>`
els.content.appendChild(sec)
}
bindCards()
let feat=(await loadFeed(REGISTRY.categories[1][1]))[0]
$('heroWatch').onclick=()=>openPlayer(feat)
}

async function showMenu(type){
$('browserPanel').classList.remove('hidden')
$('panelTitle').textContent=type
$('panelContent').innerHTML=''
REGISTRY[type].forEach(item=>{
let d=document.createElement('div')
d.className='menuItem'
d.textContent=item[0]
d.onclick=()=>loadSection(type,item)
$('panelContent').appendChild(d)
})
}

async function loadSection(type,item){
$('browserPanel').classList.add('hidden')
window.scrollTo(0,0)
currentChannels=await loadFeed(item[1])
if(type==='categories'){
els.content.innerHTML=`<div class='grid'>${currentChannels.map(card).join('')}</div>`
}else{
let groups=grouped(currentChannels)
let html=''
Object.keys(groups).forEach(g=>{
html+=`<h2 class='groupTitle'>${g}</h2>`
html+=`<div class='grid'>${groups[g].map(card).join('')}</div>`
})
els.content.innerHTML=html
}
buildDrawer()
bindCards()
}

function showFavorites(){
let fav=getFavorites()
let filtered=currentChannels.filter(c=>fav.includes(c.url))
els.content.innerHTML=`<div class='grid'>${filtered.map(card).join('')}</div>`
bindCards()
}

function buildDrawer(){
$('drawerContent').innerHTML=currentChannels.slice(0,500)
.map(c=>`<div class='drawerItem' data-c='${encodeURIComponent(JSON.stringify(c))}'>${c.name}<br><small>${c.group||''}</small></div>`)
.join('')

document.querySelectorAll('.drawerItem').forEach(d=>{
d.onclick=()=>{
openPlayer(JSON.parse(decodeURIComponent(d.dataset.c)))
$('drawer').classList.add('hidden')
}
})
}

function openPlayer(ch){
currentPlaying=ch
els.home.classList.add('hidden')
els.player.classList.remove('hidden')
play(ch,els)
$('epgNow').textContent='Now: Live Programming'
$('epgNext').textContent='Next: Upcoming'
}

$('backBtn').onclick=()=>{
stop(els.video)
els.player.classList.add('hidden')
els.home.classList.remove('hidden')
}

$('channelsBtn').onclick=()=>$('drawer').classList.toggle('hidden')
$('closeDrawer').onclick=()=>$('drawer').classList.add('hidden')
$('qualityBtn').onclick=()=>$('qualityPanel').classList.toggle('hidden')
$('closeQuality').onclick=()=>$('qualityPanel').classList.add('hidden')
$('closePanel').onclick=()=>$('browserPanel').classList.add('hidden')
$('fullBtn').onclick=()=>{
if(els.video.requestFullscreen) els.video.requestFullscreen()
}
$('modeBtn').onclick=()=>cycleMode(
$('modeBtn'),
()=>currentPlaying&&openPlayer(currentPlaying)
)

$('search').addEventListener('input',e=>{
let q=e.target.value.toLowerCase()
if(!currentChannels.length) return
let f=currentChannels.filter(c=>c.name.toLowerCase().includes(q))
els.content.innerHTML=`<div class='grid'>${f.map(card).join('')}</div>`
bindCards()
})

document.querySelectorAll('.navtab').forEach(b=>{
b.onclick=()=>{
document.querySelectorAll('.navtab').forEach(n=>n.classList.remove('active'))
b.classList.add('active')
let v=b.dataset.view
if(v==='home') buildHome()
else if(v==='favorites') showFavorites()
else showMenu(v)
}
})

buildHome()