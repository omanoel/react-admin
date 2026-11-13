import { Link } from 'react-router-dom'
import { Icon } from '../components/common'

export function NotFound() {
  return <div className="not-found"><span className="empty-icon"><Icon name="search" size={21} /></span><h1>Enregistrement introuvable</h1><p>Il a peut-être été supprimé ou déplacé.</p><Link className="button button-primary" to="/">Retour à l’accueil</Link></div>
}
