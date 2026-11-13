import { FormField } from '../../components/common'
import type { RecordFormValues, Store } from '../types'

export function ApplicationFormFields({ form, setField, store, lockedClientId }: { form: RecordFormValues; setField: (field: keyof RecordFormValues, value: string | number | string[]) => void; store: Store; lockedClientId?: string }) {
  const lockedClient = store.clients.find((client) => client.id === lockedClientId)
  return <>
    <FormField label="Nom" required><input autoFocus value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ex. Espace client" /></FormField>
    <FormField label="Client associé" required><select value={form.clientId ?? ''} onChange={(event) => setField('clientId', event.target.value)} disabled={Boolean(lockedClient)}><option value="">Sélectionner un client</option>{lockedClient ? <option value={lockedClient.id}>{lockedClient.name}</option> : store.clients.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}</select></FormField>
    <FormField label="OAuth2 Client ID" required><input value={form.oauth2ClientId ?? ''} onChange={(event) => setField('oauth2ClientId', event.target.value)} placeholder="client-id" /></FormField>
    <FormField label="OAuth2 Secret" required><input value={form.oauth2Secret ?? ''} onChange={(event) => setField('oauth2Secret', event.target.value)} placeholder="Client secret" autoComplete="new-password" /></FormField>
    <FormField label="External Client ID" required><input value={form.externalClientId ?? ''} onChange={(event) => setField('externalClientId', event.target.value)} placeholder="Identifiant externe" /></FormField>
    <div className="form-field"><span>Quota <em>*</em></span><div className="quota-input"><input aria-label="Valeur du quota" type="number" min="1" value={form.quotaValue ?? ''} onChange={(event) => setField('quotaValue', Number(event.target.value))} /><select aria-label="Unité du quota" value={form.quotaUnit ?? 'month'} onChange={(event) => setField('quotaUnit', event.target.value)}>{(['month', 'week', 'day', 'hur', 'minute'] as const).map((unit) => <option value={unit} key={unit}>{unit}</option>)}</select></div></div>
  </>
}
