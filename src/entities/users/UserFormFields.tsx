import { FormField } from '../../components/common'
import type { RecordFormValues, Store } from '../types'

export function UserFormFields({ form, setField, store, lockedClientId }: { form: RecordFormValues; setField: (field: keyof RecordFormValues, value: string | number | string[]) => void; store: Store; lockedClientId?: string }) {
  const lockedClient = store.clients.find((client) => client.id === lockedClientId)
  return <>
    <FormField label="Prénom" required><input autoFocus value={form.givenName ?? ''} onChange={(event) => setField('givenName', event.target.value)} placeholder="Ex. Camille" /></FormField>
    <FormField label="Nom" required><input value={form.familyName ?? ''} onChange={(event) => setField('familyName', event.target.value)} placeholder="Ex. Laurent" /></FormField>
    <FormField label="Email" required><input type="email" value={form.email ?? ''} onChange={(event) => setField('email', event.target.value)} placeholder="prenom@entreprise.fr" /></FormField>
    <FormField label="Téléphone"><input type="tel" value={form.phoneNumber ?? ''} onChange={(event) => setField('phoneNumber', event.target.value)} placeholder="+33 6 00 00 00 00" /></FormField>
    <FormField label="Client associé" required><select value={form.clientId ?? ''} onChange={(event) => setField('clientId', event.target.value)} disabled={Boolean(lockedClient)}><option value="">Sélectionner un client</option>{lockedClient ? <option value={lockedClient.id}>{lockedClient.name}</option> : store.clients.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}</select></FormField>
    <FormField label="Statut" required><select value={form.status ?? 'Pending'} onChange={(event) => setField('status', event.target.value)}><option value="Activated">Activated</option><option value="Deactivated">Deactivated</option><option value="Pending">Pending</option></select></FormField>
    <FormField label="Rôle" required><select value={form.role ?? 'User'} onChange={(event) => setField('role', event.target.value)}><option value="User">User</option><option value="MainUser">MainUser · Utilisateur principal</option></select></FormField>
  </>
}
