'use client'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0e0e0e',color:'#e8e2d9',display:'flex',flexDirection:'column'}}>
      <nav style={{height:'64px',borderBottom:'1px solid #2a2a2a',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',flexShrink:0}}>
        <Link href="/" style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'14px',fontWeight:700,letterSpacing:'0.15em'}}>STRANGR</Link>
        <Link href="/" style={{fontSize:'13px',color:'#6b6560'}}>← Home</Link>
      </nav>
      <main style={{flex:1,maxWidth:'680px',margin:'0 auto',padding:'80px 32px',width:'100%'}}>
        <p style={{fontSize:'11px',letterSpacing:'0.12em',color:'#6b6560',textTransform:'uppercase',marginBottom:'24px'}}>/ about</p>
        <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'48px',fontWeight:700,letterSpacing:'-0.025em',marginBottom:'16px'}}>About</h1>
        <p style={{fontSize:'16px',color:'#6b6560',lineHeight:1.7,marginBottom:'48px'}}>Why we built a quieter corner of the internet.</p>
        <div style={{padding:'32px',background:'#141414',border:'1px solid #2a2a2a',borderRadius:'10px',fontSize:'14px',color:'#6b6560',lineHeight:1.7}}>
          This page is a placeholder — full content coming soon.
        </div>
      </main>
      <footer style={{borderTop:'1px solid #2a2a2a',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
        <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'12px',fontWeight:700,letterSpacing:'0.15em',color:'#6b6560'}}>STRANGR</span>
        <div style={{display:'flex',gap:'24px'}}>
          <Link href="/privacy" style={{fontSize:'12px',color:'#6b6560'}}>Privacy</Link>
          <Link href="/support" style={{fontSize:'12px',color:'#6b6560'}}>Support</Link>
          <Link href="/about"   style={{fontSize:'12px',color:'#6b6560'}}>About</Link>
        </div>
      </footer>
    </div>
  )
}