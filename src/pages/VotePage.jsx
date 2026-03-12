import React, { useState, useEffect, useRef } from 'react'
import { RANOBE, PURPLE, CYAN, ROSE } from '../constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { AppHeader, ErrorBox, PageFooter } from '../components/Shared.jsx'

const GOLD   = '#F59E0B'
const SILVER = '#94A3B8'
const BRONZE = '#CD7F32'
const rankColor = r => r===1?GOLD:r===2?SILVER:r===3?BRONZE:'#6B7280'
const rankBg    = r =>
  r===1?'linear-gradient(135deg,#FFD700,#FFA500)':
  r===2?'linear-gradient(135deg,#C0C0C0,#A8A8A8)':
  r===3?'linear-gradient(135deg,#CD7F32,#A0522D)':
  'rgba(255,255,255,0.07)'

// ── Lucide-style inline SVG icons ─────────────────────────────────────────────
const Svg = ({size=16,children,...p}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
)
const BookIcon     = ({size,color}) => <Svg size={size} stroke={color}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Svg>
const TvIcon       = ({size,color}) => <Svg size={size} stroke={color}><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></Svg>
const BookOpenIcon = ({size,color}) => <Svg size={size} stroke={color}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Svg>
const TrophyIcon   = ({size,color}) => <Svg size={size} stroke={color}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></Svg>
const CalIcon      = ({size,color}) => <Svg size={size} stroke={color}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>
const VoteIcon     = ({size,color}) => <Svg size={size} stroke={color}><path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7z"/><path d="M22 19H2"/></Svg>
const RefreshIcon  = ({size,color}) => <Svg size={size} stroke={color}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></Svg>

const CatIcon = ({id,size,color}) => id==='novel'?<BookIcon size={size} color={color}/>:id==='anime'?<TvIcon size={size} color={color}/>:<BookOpenIcon size={size} color={color}/>

const CATS = [
  {id:'novel',label:{vi:'Light Novel',en:'Light Novel'},desc:{vi:'Novel được yêu thích nhất tháng',en:'Most loved novel of the month'},accent:PURPLE},
  {id:'anime',label:{vi:'Anime',en:'Anime'},desc:{vi:'Anime hay nhất đang chiếu',en:'Best currently airing anime'},accent:CYAN},
  {id:'manga',label:{vi:'Manga',en:'Manga'},desc:{vi:'Manga hay nhất đang phát hành',en:'Best currently releasing manga'},accent:ROSE},
]

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON)
async function sbGet(table,qs){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{headers:{apikey:SUPABASE_ANON,Authorization:`Bearer ${SUPABASE_ANON}`}})
  const txt=await r.text();if(!r.ok)throw new Error(`${r.status}: ${txt}`);return JSON.parse(txt)
}

function TrendArrow({current,prev}){
  if(!prev)          return <span style={{color:CYAN,fontSize:9,fontWeight:700,letterSpacing:.5}}>NEW</span>
  if(current<prev)   return <span style={{color:'#4ADE80',fontSize:11}}>▲</span>
  if(current>prev)   return <span style={{color:'#F87171',fontSize:11}}>▼</span>
  return                    <span style={{color:'#64748B',fontSize:10}}>—</span>
}

function SkeletonGrid({isMobile}){
  return(
    <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(auto-fill,minmax(190px,1fr))',gap:isMobile?10:16}}>
      {Array.from({length:isMobile?6:12}).map((_,i)=>(
        <div key={i} style={{aspectRatio:'2/3',borderRadius:12,background:'linear-gradient(90deg,#1e1410 25%,#2a1f14 50%,#1e1410 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite'}}/>
      ))}
    </div>
  )
}

function VoteCard({item,rank,voteCount,prevRank,hasVoted,onVote,voting,accent,t,isMobile}){
  const [hov,setHov]=useState(false)
  const isTop3=rank<=3
  return(
    <div onMouseEnter={()=>!isMobile&&setHov(true)} onMouseLeave={()=>!isMobile&&setHov(false)} style={{
      position:'relative',borderRadius:isMobile?12:16,overflow:'hidden',
      display:'flex',flexDirection:'column',
      background:isTop3?`${accent}09`:hov?`${accent}06`:'rgba(255,248,240,0.02)',
      border:`1px solid ${isTop3?(rank===1?'#FFD70040':rank===2?'#C0C0C040':'#CD7F3240'):hov?`${accent}50`:'rgba(255,248,240,0.06)'}`,
      transition:'transform .22s ease,box-shadow .22s ease',
      transform:hov?'translateY(-4px)':'none',
      boxShadow:hov?`0 16px 36px ${accent}22,0 4px 12px rgba(0,0,0,0.5)`:'0 2px 8px rgba(0,0,0,0.25)',
    }}>
      {/* rank */}
      <div style={{position:'absolute',top:isMobile?7:10,left:isMobile?7:10,zIndex:2,
        width:isMobile?24:34,height:isMobile?24:34,borderRadius:'50%',
        background:rankBg(rank),display:'flex',alignItems:'center',justifyContent:'center',
        fontFamily:"'Barlow Condensed',sans-serif",fontSize:isMobile?11:14,
        color:rank<=3?'#000':'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.6)',fontWeight:800}}>#{rank}</div>
      {/* trend */}
      <div style={{position:'absolute',top:isMobile?9:12,right:isMobile?8:12,zIndex:2}}>
        <TrendArrow current={rank} prev={prevRank}/>
      </div>
      {/* cover — aspectRatio so it works at any grid column width */}
      <div style={{position:'relative',width:'100%',aspectRatio:'2/3',flexShrink:0,background:'#130d08',overflow:'hidden'}}>
        {item.cover_url
          ?<img src={item.cover_url} alt={item.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',transition:'transform .3s',transform:hov?'scale(1.05)':'scale(1)'}} onError={e=>e.target.style.display='none'}/>
          :<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:`${accent}12`}}>
            <CatIcon id={item.catId} size={isMobile?28:40} color={accent+'80'}/>
          </div>}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:40,background:'linear-gradient(to bottom,transparent,rgba(8,5,3,0.96))'}}/>
      </div>
      {/* body */}
      <div style={{padding:isMobile?'7px 8px 9px':'10px 14px 14px',flex:1,display:'flex',flexDirection:'column',gap:isMobile?5:7}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:isMobile?12:15,lineHeight:1.25,color:'#f1f5f9',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{item.title}</div>
        {!isMobile&&item.sub&&<div style={{fontSize:10,color:'#475569',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.sub}</div>}
        {!isMobile&&item.tags?.length>0&&(
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {item.tags.map(tag=><span key={tag} style={{fontSize:10,padding:'2px 7px',borderRadius:20,fontWeight:600,background:`${accent}14`,border:`1px solid ${accent}28`,color:accent}}>{tag}</span>)}
          </div>
        )}
        <div style={{flex:1}}/>
        <div style={{display:'flex',alignItems:'baseline',gap:4}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:isMobile?18:26,lineHeight:1,fontWeight:800,color:isTop3?rankColor(rank):accent}}>{(voteCount||0).toLocaleString()}</span>
          <span style={{color:'#475569',fontSize:9,letterSpacing:1,textTransform:'uppercase'}}>{t('vote_votes')}</span>
        </div>
        <button onClick={()=>onVote(item)} disabled={hasVoted||voting} style={{
          width:'100%',padding:isMobile?'7px 0':'8px 0',borderRadius:isMobile?8:10,
          background:hasVoted?'rgba(74,222,128,0.14)':accent,
          border:`1px solid ${hasVoted?'rgba(74,222,128,0.4)':accent}`,
          color:hasVoted?'#4ADE80':'#fff',
          cursor:hasVoted?'default':voting?'wait':'pointer',
          fontSize:isMobile?11:12,fontWeight:700,
          opacity:voting&&!hasVoted?0.55:1,
          transition:'all .18s',fontFamily:"'Be Vietnam Pro',sans-serif",
          boxShadow:hasVoted?'none':`0 3px 10px ${accent}40`,
        }}>{hasVoted?'✓ '+t('vote_voted'):t('vote_cast')}</button>
      </div>
    </div>
  )
}

function CategoryPanel({cat,month,year,lang,token,t,isMobile}){
  const [items,setItems]=useState([])
  const [votes,setVotes]=useState({})
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(null)
  const [voting,setVoting]=useState(false)
  const [toast,setToast]=useState(null)
  const [search,setSearch]=useState('')
  const lsKey=`nt_voted_${cat.id}`
  const [votedIds,setVotedIds]=useState(()=>{try{return new Set(JSON.parse(localStorage.getItem(lsKey)||'[]'))}catch{return new Set()}})

  useEffect(()=>{
    let alive=true;setLoading(true);setError(null)
    Promise.all([loadItems(alive),loadVotes(alive)]).catch(e=>alive&&setError(e.message)).finally(()=>alive&&setLoading(false))
    return()=>{alive=false}
  },[cat.id])

  async function loadItems(alive){
    let rows=[]
    if(cat.id==='novel'){
      const[p1,p2]=await Promise.all([
        fetch(`${RANOBE}/series?limit=25&page=1&sort=Num.+books+desc&rl=ja`).then(r=>r.json()),
        fetch(`${RANOBE}/series?limit=25&page=2&sort=Num.+books+desc&rl=ja`).then(r=>r.json()),
      ])
      rows=[...(p1.series||[]),...(p2.series||[])].map(s=>({id:`novel_${s.id}`,catId:'novel',title:s.romaji||s.title||'',sub:s.title&&s.romaji&&s.title!==s.romaji?s.title:null,cover_url:s.book?.image?.filename?`https://images.ranobedb.org/${s.book.image.filename}`:null,tags:[s.c_num_books?`${s.c_num_books} ${t('meta_vols')}`:null,s.publication_status?t(`status_${s.publication_status}`)||s.publication_status:null].filter(Boolean)}))
    }else if(cat.id==='anime'){
      const data=await sbGet('anime','select=id,title_english,title_romaji,cover_large,format,season,season_year,status&order=popularity.desc.nullslast&limit=50')
      rows=data.map(a=>({id:`anime_${a.id}`,catId:'anime',title:a.title_english||a.title_romaji||'',sub:a.title_romaji&&a.title_english&&a.title_romaji!==a.title_english?a.title_romaji:null,cover_url:a.cover_large,tags:[a.format,a.season_year?String(a.season_year):null].filter(Boolean)}))
    }else{
      const data=await sbGet('manga','select=id,title_en,title_ja_ro,cover_url,demographic,year,status&order=follows.desc.nullslast&limit=50')
      rows=data.map(m=>({id:`manga_${m.id}`,catId:'manga',title:m.title_en||m.title_ja_ro||'',sub:m.title_ja_ro&&m.title_en&&m.title_ja_ro!==m.title_en?m.title_ja_ro:null,cover_url:m.cover_url,tags:[m.demographic?m.demographic.charAt(0).toUpperCase()+m.demographic.slice(1):null,m.year?String(m.year):null].filter(Boolean)}))
    }
    if(alive)setItems(rows)
  }

  async function loadVotes(alive){
    if(!isConfigured)return
    const prefix=cat.id+'_%'
    const data=await sbGet('novel_votes',`month=eq.${month}&year=eq.${year}&novel_id=like.${encodeURIComponent(prefix)}&order=vote_count.desc&limit=200`)
    const map={};(data||[]).forEach(r=>{map[r.novel_id]=r});if(alive)setVotes(map)
  }

  const castVote=async(item)=>{
    const key=`${item.id}-${month}-${year}`;if(votedIds.has(key)){flash(t('vote_already'),false);return}
    setVoting(true)
    try{
      const res=await fetch(`${SUPABASE_URL}/functions/v1/vote`,{method:'POST',headers:{Authorization:token?`Bearer ${token}`:`Bearer ${SUPABASE_ANON}`,'Content-Type':'application/json'},body:JSON.stringify({novel_id:item.id,novel_title:item.title,novel_romaji:item.sub||item.title,cover_url:item.cover_url||'',month,year})})
      const data=await res.text().then(t=>t?JSON.parse(t):{})
      const newSet=new Set(votedIds);newSet.add(key);setVotedIds(newSet);localStorage.setItem(lsKey,JSON.stringify([...newSet]))
      if(res.status===409||data?.error==='already_voted')flash(t('vote_already'),false)
      else{flash(t('vote_success'),true);await loadVotes(true)}
    }catch(e){flash(`Network error: ${e.message}`,false)}finally{setVoting(false)}
  }

  const flash=(msg,ok)=>{setToast({msg,ok});setTimeout(()=>setToast(null),2800)}
  const withVotes=items.filter(n=>votes[n.id]?.vote_count>0).sort((a,b)=>(votes[b.id]?.vote_count??0)-(votes[a.id]?.vote_count??0))
  const withoutVotes=items.filter(n=>!(votes[n.id]?.vote_count>0))
  const sorted=[...withVotes,...withoutVotes]
  const q=search.trim().toLowerCase()
  const filtered=q?sorted.filter(n=>n.title.toLowerCase().includes(q)||(n.sub||'').toLowerCase().includes(q)):sorted

  return(
    <div style={{position:'relative'}}>
      {!loading&&items.length>0&&(
        <div style={{position:'relative',marginBottom:20}}>
          <svg style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',opacity:.3,pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==='vi'?'Lọc theo tên...':'Filter by title...'} style={{width:'100%',boxSizing:'border-box',background:'rgba(255,248,240,0.04)',border:`1px solid ${cat.accent}22`,borderRadius:12,padding:'10px 36px 10px 38px',color:'#f1f5f9',fontSize:13,outline:'none',fontFamily:"'Be Vietnam Pro',sans-serif"}}/>
          {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#64748B',cursor:'pointer',fontSize:18}}>×</button>}
        </div>
      )}
      {error&&<ErrorBox msg={error} onRetry={()=>window.location.reload()} color={cat.accent}/>}
      {loading&&<SkeletonGrid isMobile={isMobile}/>}
      {!loading&&!error&&filtered.length===0&&(
        <div style={{textAlign:'center',padding:'60px 0',color:'#4B5563'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:12,opacity:.4}}><CatIcon id={cat.id} size={40} color="#94A3B8"/></div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22}}>{search?(lang==='vi'?'Không tìm thấy':'No results'):(lang==='vi'?'Chưa có dữ liệu':'No data yet')}</div>
        </div>
      )}
      {!loading&&!error&&filtered.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(auto-fill,minmax(190px,1fr))',gap:isMobile?10:16}}>
          {filtered.map((item,i)=><VoteCard key={item.id} item={item} rank={i+1} voteCount={votes[item.id]?.vote_count??0} prevRank={votes[item.id]?.prev_rank??null} hasVoted={votedIds.has(`${item.id}-${month}-${year}`)} onVote={castVote} voting={voting} accent={cat.accent} t={t} isMobile={isMobile}/>)}
        </div>
      )}
      {toast&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:toast.ok?'rgba(74,222,128,0.14)':'rgba(239,68,68,0.14)',border:`1px solid ${toast.ok?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.4)'}`,color:toast.ok?'#4ADE80':'#FCA5A5',padding:'12px 22px',borderRadius:12,fontSize:13,fontWeight:600,zIndex:9999,backdropFilter:'blur(12px)',maxWidth:'90vw',textAlign:'center',lineHeight:1.4,animation:'fadeIn .2s ease'}}>{toast.msg}</div>
      )}
    </div>
  )
}

export function VotePage(){
  const{t,lang}=useLang()
  const{token}=useAuth()
  const now=new Date(),month=now.getMonth()+1,year=now.getFullYear()
  const daysLeft=new Date(year,month,1)-now,daysNum=Math.ceil(daysLeft/86400000)
  const MONTHS_VI=['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12']
  const monthLabel=lang==='vi'?MONTHS_VI[month-1]:new Date(year,month-1).toLocaleString('en',{month:'long'})
  const[activeCat,setActiveCat]=useState('novel')
  const[isMobile,setIsMobile]=useState(()=>typeof window!=='undefined'&&window.innerWidth<768)
  const contentRef=useRef(null)
  useEffect(()=>{const fn=()=>setIsMobile(window.innerWidth<768);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  const cat=CATS.find(c=>c.id===activeCat)
  const switchCat=id=>{setActiveCat(id);if(isMobile&&contentRef.current)setTimeout(()=>contentRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return(
    <div className="page-enter" style={{minHeight:'100vh',background:'#0f0b09'}}>
      <AppHeader activeTab="#/vote" accent={PURPLE} searchInput="" onSearch={()=>{}} sorts={[]} activeSort="" onSort={()=>{}} hideSearch hideSorts/>

      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,#130a1c 0%,#0f0b09 60%)',padding:isMobile?'28px 20px 24px':'44px 48px 40px',borderBottom:'1px solid rgba(255,248,240,0.06)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 15% 60%, ${PURPLE}14 0%, transparent 55%)`}}/>
        <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:560,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginBottom:10}}>
            <TrophyIcon size={14} color={PURPLE}/>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:PURPLE,fontFamily:"'Barlow Condensed',sans-serif"}}>{lang==='vi'?'Bầu chọn tháng này':'Monthly Vote'}</span>
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:isMobile?34:52,fontWeight:900,color:'#f1f5f9',margin:'0 0 10px',lineHeight:1.05,letterSpacing:.5}}>{lang==='vi'?`Bầu chọn ${monthLabel} ${year}`:`${monthLabel} ${year} Poll`}</h1>
          <p style={{fontSize:isMobile?12:13,color:'#6b4f35',fontFamily:"'Be Vietnam Pro',sans-serif",margin:0,lineHeight:1.7}}>{isMobile?(lang==='vi'?`Còn ${daysNum} ngày`:`${daysNum} days left`):(lang==='vi'?`Bình chọn tác phẩm yêu thích của bạn trong mỗi hạng mục. Còn ${daysNum} ngày.`:`Cast one vote per category for your favorites. ${daysNum} days remaining.`)}</p>
        </div>
      </div>

      {isMobile?(
        /* ── MOBILE: column layout ── */
        <div style={{display:'flex',flexDirection:'column'}}>
          {/* Sticky tabs */}
          <div style={{position:'sticky',top:56,zIndex:20,background:'rgba(15,11,9,0.97)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,248,240,0.07)',padding:'10px 12px',display:'flex',gap:8}}>
            {CATS.map(c=>{
              const isActive=activeCat===c.id
              return(
                <button key={c.id} onClick={()=>switchCat(c.id)} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 4px',borderRadius:12,cursor:'pointer',fontFamily:"'Be Vietnam Pro',sans-serif",fontWeight:isActive?700:500,fontSize:12,transition:'all .15s',background:isActive?`${c.accent}18`:'rgba(255,248,240,0.05)',border:`1.5px solid ${isActive?c.accent:'transparent'}`,color:isActive?c.accent:'#6b4f35',boxShadow:isActive?`0 2px 10px ${c.accent}30`:'none'}}>
                  <CatIcon id={c.id} size={14} color={isActive?c.accent:'#6b4f35'}/>
                  <span>{lang==='vi'?c.label.vi:c.label.en}</span>
                </button>
              )
            })}
          </div>
          {/* Content below tabs — full width */}
          <div ref={contentRef} style={{padding:'16px 12px 72px'}}>
            <div style={{marginBottom:16,paddingBottom:14,borderBottom:'1px solid rgba(255,248,240,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <CatIcon id={cat.id} size={20} color={cat.accent}/>
                <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:'#f1f5f9',margin:0,letterSpacing:.5}}>{lang==='vi'?cat.label.vi:cat.label.en}</h2>
              </div>
              <span style={{fontSize:11,color:cat.accent,background:`${cat.accent}15`,padding:'3px 10px',borderRadius:20,fontWeight:700,whiteSpace:'nowrap',fontFamily:"'Be Vietnam Pro',sans-serif"}}>{monthLabel}</span>
            </div>
            <CategoryPanel key={activeCat} cat={cat} month={month} year={year} lang={lang} token={token} t={t} isMobile={true}/>
          </div>
        </div>
      ):(
        /* ── DESKTOP: sidebar + content ── */
        <div style={{display:'flex',alignItems:'flex-start',maxWidth:1320,margin:'0 auto'}}>
          <aside style={{width:230,flexShrink:0,position:'sticky',top:56,alignSelf:'flex-start',minHeight:'calc(100vh - 56px)',borderRight:'1px solid rgba(255,248,240,0.07)',background:'#0f0b09',paddingTop:28}}>
            <div style={{padding:'0 16px 16px',fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,letterSpacing:2.5,color:'#2e2016',textTransform:'uppercase'}}>{lang==='vi'?'Hạng mục':'Categories'}</div>
            {CATS.map(c=>{
              const isActive=activeCat===c.id
              return(
                <button key={c.id} onClick={()=>switchCat(c.id)} style={{width:'100%',display:'flex',alignItems:'flex-start',gap:12,padding:'14px 18px 14px 16px',textAlign:'left',background:isActive?`${c.accent}12`:'transparent',border:'none',borderLeft:`3px solid ${isActive?c.accent:'transparent'}`,cursor:'pointer',transition:'all .15s'}}>
                  <div style={{marginTop:2,flexShrink:0}}><CatIcon id={c.id} size={18} color={isActive?c.accent:'#6b4f35'}/></div>
                  <div>
                    <div style={{fontFamily:"'Be Vietnam Pro',sans-serif",fontSize:14,fontWeight:isActive?700:500,color:isActive?'#f1f5f9':'#a08060',lineHeight:1.3}}>{lang==='vi'?c.label.vi:c.label.en}</div>
                    <div style={{fontFamily:"'Be Vietnam Pro',sans-serif",fontSize:11,marginTop:3,lineHeight:1.5,color:isActive?c.accent:'#4a3828'}}>{lang==='vi'?c.desc.vi:c.desc.en}</div>
                  </div>
                </button>
              )
            })}
            <div style={{margin:'28px 16px 0',padding:'18px 0 0',borderTop:'1px solid rgba(255,248,240,0.06)'}}>
              {[{icon:<CalIcon size={13} color="#4a3828"/>,label:lang==='vi'?`Còn ${daysNum} ngày`:`${daysNum} days left`},{icon:<VoteIcon size={13} color="#4a3828"/>,label:lang==='vi'?'1 vote / hạng mục':'1 vote per category'},{icon:<RefreshIcon size={13} color="#4a3828"/>,label:lang==='vi'?'Reset đầu tháng':'Resets monthly'}].map(({icon,label},i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontFamily:"'Be Vietnam Pro',sans-serif",fontSize:12,color:'#4a3828'}}>{icon}<span>{label}</span></div>
              ))}
            </div>
          </aside>
          <div ref={contentRef} style={{flex:1,minWidth:0,padding:'32px 32px 72px'}}>
            <div style={{marginBottom:24,paddingBottom:18,borderBottom:'1px solid rgba(255,248,240,0.07)'}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <CatIcon id={cat.id} size={28} color={cat.accent}/>
                <div>
                  <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:'#f1f5f9',margin:0,letterSpacing:.5}}>{lang==='vi'?cat.label.vi:cat.label.en}</h2>
                  <p style={{fontSize:12,color:'#6b4f35',margin:'4px 0 0',fontFamily:"'Be Vietnam Pro',sans-serif"}}>{lang==='vi'?cat.desc.vi:cat.desc.en}{' · '}<span style={{color:cat.accent}}>{monthLabel} {year}</span></p>
                </div>
              </div>
            </div>
            <CategoryPanel key={activeCat} cat={cat} month={month} year={year} lang={lang} token={token} t={t} isMobile={false}/>
          </div>
        </div>
      )}

      <PageFooter color={PURPLE} src="LiDex"/>
    </div>
  )
}
