import { api } from './auth'

export async function getMyDonors(status) {
  const params = status ? `?status=${status}` : ''
  return api(`/fro/donors${params}`, { _prefix: 'ucs' })
}

export async function getDonorDetail(donorId, ngoId) {
  const params = ngoId ? `?ngo_id=${ngoId}` : ''
  return api(`/fro/donors/${donorId}/logs${params}`, { _prefix: 'ucs' })
}

export async function updateDonorStatus(donorId, data) {
  return api(`/fro/donors/${donorId}/status`, { method: 'PUT', body: JSON.stringify(data), _prefix: 'ucs' })
}

export async function addDonorLog(donorId, data) {
  return api(`/fro/donors/${donorId}/logs`, { method: 'POST', body: JSON.stringify(data), _prefix: 'ucs' })
}

export async function scheduleContact(donorId, data) {
  return api(`/fro/donors/${donorId}/schedule`, { method: 'POST', body: JSON.stringify(data), _prefix: 'ucs' })
}

export async function getDonorDonations(donorId, ngoId, yearFilter) {
  const params = new URLSearchParams();
  if (ngoId) params.set('ngo_id', ngoId);
  if (yearFilter) params.set('year', yearFilter);
  return api(`/fro/donors/${donorId}/donations?${params}`, { _prefix: 'ucs' })
}

export async function uploadPaymentScreenshot(fileBase64, mimeType) {
  return api('/fro/upload-payment-screenshot', { method: 'POST', body: JSON.stringify({ file_base64: fileBase64, mime_type: mimeType }), _prefix: 'ucs' })
}

export async function getMyDashboard() {
  return api('/fro/dashboard', { _prefix: 'ucs' })
}

export async function requestMoreData(message) {
  return api('/fro/request-data', { method: 'POST', body: JSON.stringify({ message }), _prefix: 'ucs' })
}

export async function getScheduled() {
  return api('/fro/scheduled', { _prefix: 'ucs' })
}

export async function markDonorSeen(donorId, ngoId) {
  const body = ngoId ? JSON.stringify({ ngo_id: ngoId }) : '{}'
  return api(`/fro/donors/${donorId}/mark-seen`, { method: 'PUT', body, _prefix: 'ucs' })
}
