let favs=JSON.parse(localStorage.getItem('iptvFavs')||'[]')

export function isFavorite(id){
return favs.includes(id)
}

export function toggleFavorite(id,button){
if(favs.includes(id)){
favs=favs.filter(x=>x!==id)
button.classList.remove('active')
button.textContent='♡'
}else{
favs.push(id)
button.classList.add('active')
button.textContent='♥'
}
localStorage.setItem('iptvFavs',JSON.stringify(favs))
// intentionally no rerender
}

export function getFavorites(){
return favs
}