import { FormField } from '../../components/common'
import type { RecordFormValues, Store } from '../types'

export function ApiKeyFormFields({ form, setField, store, lockedAppId }: { form: RecordFormValues; setField: (field: keyof RecordFormValues, value: string | number | string[]) => void; store: Store; lockedAppId?: string }) {
  const lockedApp = store.applications.find((app) => app.id === lockedAppId)
  return <>
    <FormField label="Application associée" required><select value={form.appId ?? ''} onChange={(event) => setField('appId', event.target.value)} disabled={Boolean(lockedApp)}><option value="">Sélectionner une application</option>{lockedApp ? <option value={lockedApp.id}>{lockedApp.name} — {store.clients.find((client) => client.id === lockedApp.clientId)?.name}</option> : store.applications.map((app) => <option value={app.id} key={app.id}>{app.name} — {store.clients.find((client) => client.id === app.clientId)?.name}</option>)}</select></FormField>
    <FormField label="Nom" required><input autoFocus value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ex. Clé de production" /></FormField>
  </>
}
