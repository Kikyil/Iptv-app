export function grouped(channels){
let g={}
channels.forEach(c=>{
let k=c.group||'General'
if(!g[k]) g[k]=[]
g[k].push(c)
})
return g
}