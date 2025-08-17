const searchEl = document.querySelector('#search')
const displayEl = document.querySelector('#display')
const searchBtn = document.querySelector('#btn')
const prevBtn = document.querySelector('#prev')
const nextBtn = document.querySelector('#next')

const baseURL = 'https://api.kkbox.com/v1.1/search?'
const widgetURL = 'https://widget.kkbox.com/v1/?'
const API_TOKEN = 'Kb0Ihjh-6IcSMcpfMRxrVw==' // 250817
const res_limit = 20

// 全部狀態集中管理
const state = {
  query: '',
  type: '',
  results: null,
  prev: null,
  next: null,
}

// 共用 box 產生器
function createBox(innerHTML, extraClasses = []) {
  const boxEl = document.createElement('div')
  boxEl.classList.add('box', ...extraClasses)
  boxEl.innerHTML = innerHTML
  return boxEl
}

// 呼叫 API
async function getKKbox(URL) {
  try {
    const config = { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
    const res = await axios.get(URL, config)
    return res.data[`${state.type}s`]
  } catch (e) {
    console.error('API 請求失敗:', e.message)
    displayEl.innerHTML = `<p class="text-danger">取得資料失敗，請稍後再試</p>`
    return null
  }
}

// Render 各類型結果
function renderTracks(tracks) {
  const fragment = document.createDocumentFragment()
  tracks.data.forEach(el => {
    const iframe = `<iframe src="${widgetURL}id=${el.id}&type=song&terr=TW&lang=TC" height="100"></iframe>`
    const info = `
      <p class="h4">${el.name}</p>
      <h6><a target="_blank" href="${el.album.artist.url}">${el.album.artist.name}</a></h6>
      <a target="_blank" href="${el.url}" class="btn btn-outline-light">
        <i class="fas fa-headphones"></i> 聽歌去
      </a>`
    fragment.appendChild(createBox(iframe + info, ['col-md-6', 'col-lg-4']))
  })
  displayEl.appendChild(fragment)
}

function renderAlbums(albums) {
  const fragment = document.createDocumentFragment()
  albums.data.forEach(el => {
    const iframe = `<iframe src="${widgetURL}id=${el.id}&type=album&terr=TW&lang=TC" width="280" height="420"></iframe>`
    const info = `
      <p class="h4">${el.name}</p>
      <h6><a target="_blank" href="${el.artist.url}">${el.artist.name}</a></h6>
      <a target="_blank" href="${el.url}" class="btn btn-outline-light">專輯介紹</a>`
    fragment.appendChild(createBox(iframe + info, ['col-md-6', 'col-lg-4']))
  })
  displayEl.appendChild(fragment)
}

function renderArtists(artists) {
  const fragment = document.createDocumentFragment()
  artists.data.forEach(el => {
    const imgURL = el.images?.[1]?.url || ''
    const info = `
      <img class="img-fluid" src="${imgURL}">
      <p class="h4">${el.name}</p>
      <a target="_blank" href="${el.url}" class="btn btn-outline-light">Artist介紹</a>`
    fragment.appendChild(createBox(info, ['col-sm-6', 'col-md-4', 'col-lg-3']))
  })
  displayEl.appendChild(fragment)
}

function renderPlaylists(playlists) {
  const fragment = document.createDocumentFragment()
  playlists.data.forEach(el => {
    const iframe = `<iframe src="${widgetURL}id=${el.id}&type=playlist&terr=TW&lang=TC" width="280" height="420"></iframe>`
    const desc = el.description.length > 50 ? el.description.slice(0, 50) + '...' : el.description
    const info = `
      <p class="h5">${el.title}</p>
      <a target="_blank" href="${el.owner.url}">${el.owner.name}</a>
      <p>${desc}</p>
      <a target="_blank" href="${el.url}" class="btn btn-outline-light">
        <i class="fas fa-headphones"></i> 聽歌去
      </a>`
    fragment.appendChild(createBox(iframe + info, ['col-md-6', 'col-lg-4']))
  })
  displayEl.appendChild(fragment)
}

// 動態選 render 函式
function addResults(results) {
  if (!results) return
  switch (state.type) {
    case 'track': return renderTracks(results)
    case 'album': return renderAlbums(results)
    case 'artist': return renderArtists(results)
    default: return renderPlaylists(results)
  }
}

// 共用分頁處理
async function handlePage(URL) {
  if (!URL) return
  displayEl.innerHTML = ''
  const results = await getKKbox(URL)
  if (!results) return
  state.prev = results.paging.previous
  state.next = results.paging.next
  prevBtn.disabled = !state.prev
  nextBtn.disabled = !state.next
  addResults(results)
}

// 搜尋按鈕
searchBtn.addEventListener('click', async e => {
  e.preventDefault()
  displayEl.innerHTML = ''
  state.query = document.querySelector('#q').value
  state.type = document.querySelector('[name="q-type"]:checked').id

  const searchURL = `${baseURL}q=${state.query}&type=${state.type}&territory=TW&limit=${res_limit}`
  const results = await getKKbox(searchURL)
  if (!results) return

  state.prev = results.paging.previous
  state.next = results.paging.next
  prevBtn.disabled = !state.prev
  nextBtn.disabled = !state.next

  addResults(results)
})

// 上一頁 / 下一頁
prevBtn.addEventListener('click', e => {
  e.preventDefault()
  handlePage(state.prev)
})
nextBtn.addEventListener('click', e => {
  e.preventDefault()
  handlePage(state.next)
})
