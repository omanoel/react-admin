import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { apiRequest, fetchApiStore } from '../api/mockApiV1'
import type { Entity, EntityRecord, Store } from '../entities/types'

interface SaveRecordPayload {
  entity: Entity
  record: EntityRecord
  isNew: boolean
}

interface ApiState {
  data: Store | null
  loading: boolean
  saving: boolean
  error: string | null
}

const initialState: ApiState = { data: null, loading: false, saving: false, error: null }

export const loadApiStore = createAsyncThunk('api/loadStore', fetchApiStore)

export const saveApiRecord = createAsyncThunk<Store, SaveRecordPayload>(
  'api/saveRecord',
  async ({ entity, record, isNew }) => {
    const url = isNew ? `/api/v1/${entity}` : `/api/v1/${entity}/${record.id}`
    await apiRequest(isNew ? 'POST' : 'PUT', url, record)
    return fetchApiStore()
  },
)

export const deleteApiRecord = createAsyncThunk<Store, { entity: Entity; id: string }>(
  'api/deleteRecord',
  async ({ entity, id }) => {
    await apiRequest('DELETE', `/api/v1/${entity}/${id}`)
    return fetchApiStore()
  },
)

export const linkClientApi = createAsyncThunk<Store, { clientId: string; apiId: string }>(
  'api/linkClientApi',
  async ({ clientId, apiId }) => {
    await apiRequest('POST', `/api/v1/clients/${clientId}/apis`, { apiId })
    return fetchApiStore()
  },
)

export const saveClientApiLinks = createAsyncThunk<Store, { clientId: string; apiIds: string[] }>(
  'api/saveClientApiLinks',
  async ({ clientId, apiIds }) => {
    await apiRequest('PUT', `/api/v1/clients/${clientId}/apis`, { apiIds })
    return fetchApiStore()
  },
)

export const saveApplicationApiLinks = createAsyncThunk<Store, { applicationId: string; apiIds: string[] }>(
  'api/saveApplicationApiLinks',
  async ({ applicationId, apiIds }) => {
    await apiRequest('PUT', `/api/v1/applications/${applicationId}/apis`, { apiIds })
    return fetchApiStore()
  },
)

const allMutations = [
  saveApiRecord.pending,
  deleteApiRecord.pending,
  linkClientApi.pending,
  saveClientApiLinks.pending,
  saveApplicationApiLinks.pending,
]
const allMutationResults = [
  saveApiRecord.fulfilled,
  deleteApiRecord.fulfilled,
  linkClientApi.fulfilled,
  saveClientApiLinks.fulfilled,
  saveApplicationApiLinks.fulfilled,
]
const allRequests = [
  loadApiStore.pending,
  ...allMutations,
]
const allResults = [
  loadApiStore.fulfilled,
  ...allMutationResults,
]
const allFailures = [
  loadApiStore.rejected,
  saveApiRecord.rejected,
  deleteApiRecord.rejected,
  linkClientApi.rejected,
  saveClientApiLinks.rejected,
  saveApplicationApiLinks.rejected,
]

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    clearApiError(state) {
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(...allRequests), (state, action) => {
        state.error = null
        if (loadApiStore.pending.match(action)) state.loading = true
        else state.saving = true
      })
      .addMatcher(isAnyOf(...allResults), (state, action) => {
        state.data = action.payload
        state.loading = false
        state.saving = false
      })
      .addMatcher(isAnyOf(...allFailures), (state, action) => {
        state.loading = false
        state.saving = false
        state.error = action.error.message ?? 'La requête API a échoué.'
      })
  },
})

export const { clearApiError } = apiSlice.actions
export default apiSlice.reducer
