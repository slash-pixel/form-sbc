export const formatDate = (d?: string | null) => {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${date.getFullYear()}`
}