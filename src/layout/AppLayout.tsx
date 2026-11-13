import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon, RecordName } from '../components/common'
import { entityInfo } from '../entities/entityInfo'
import type { Entity, Store } from '../entities/types'

export function AppLayout({ store, children }: { store: Store; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const navEntities: Entity[] = ['clients', 'users', 'applications', 'apis', 'api-keys']
  const routeSegments = location.pathname.split('/').filter(Boolean)
  const currentEntity = navEntities.find((entity) => entity === routeSegments[0])
  const currentRecord = currentEntity && routeSegments[1] ? store[currentEntity].find((item) => item.id === routeSegments[1]) : undefined
  const currentRecordName = currentEntity && currentRecord ? <RecordName record={currentRecord} entity={currentEntity} /> : undefined
  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {menuOpen && <button className="mobile-backdrop" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-mark"><Icon name="layers" size={22} /></span><span>atelier<span className="brand-light">.admin</span></span></Link>
        <nav className="main-nav" aria-label="Navigation principale">
          {navEntities.map((entity) => <NavLink key={entity} to={`/${entity}`} title={sidebarCollapsed ? entityInfo[entity].label : undefined} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><span className={`nav-icon ${entityInfo[entity].color}`}><Icon name={entityInfo[entity].icon} size={18} /></span><span>{entityInfo[entity].label}</span><span className="nav-count">{store[entity].length}</span></NavLink>)}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => { if (window.matchMedia('(max-width: 720px)').matches) { setSidebarCollapsed(false); setMenuOpen(true) } else setSidebarCollapsed((collapsed) => !collapsed) }} aria-label="Basculer le menu" aria-expanded={menuOpen || !sidebarCollapsed}><Icon name="menu" /></button>
          <nav className="breadcrumbs" aria-label="Fil d’Ariane">
            {currentEntity ? <Link to={`/${currentEntity}`}>{entityInfo[currentEntity].label}</Link> : <Link to="/">Vue d’ensemble</Link>}
            {currentRecordName && <><Icon name="chevron" size={14} /><strong>{currentRecordName}</strong></>}
            {currentRecordName && ['apis', 'clients', 'applications', 'api-keys'].includes(routeSegments[2] ?? '') && <><Icon name="chevron" size={14} /><span>{routeSegments[2] === 'apis' ? 'APIs' : routeSegments[2] === 'clients' ? 'Clients' : routeSegments[2] === 'api-keys' ? 'Clés API' : 'Applications'}</span></>}
            {currentRecordName && routeSegments[2] === 'upd' && <><Icon name="chevron" size={14} /><span>Modification</span></>}
            {currentRecordName && routeSegments[2] === 'del' && <><Icon name="chevron" size={14} /><span>Suppression</span></>}
            {currentRecordName && routeSegments[3] && ['add', 'edit'].includes(routeSegments[3]) && <><Icon name="chevron" size={14} /><span>{routeSegments[3] === 'add' ? 'Association' : 'Gestion des liaisons'}</span></>}
            {currentEntity && !currentRecordName && routeSegments[1] === 'add' && <><Icon name="chevron" size={14} /><span>Ajout</span></>}
          </nav>
          <div className="topbar-right"><button className="profile-avatar top-avatar" aria-label="Profil de Marine Leroy">ML</button></div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="footer"><span>© {new Date().getFullYear()} Atelier Admin</span><span>Conçu avec soin <span className="footer-heart">♥</span> à Paris</span></footer>
      </div>
    </div>
  )
}
