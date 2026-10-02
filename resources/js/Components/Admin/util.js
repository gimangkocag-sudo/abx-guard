export const fmtDateTime = (iso) => (iso ? `${new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC` : '—');
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }) : '—');
export const qs = (params) => new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
