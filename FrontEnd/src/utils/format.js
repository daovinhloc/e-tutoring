export const formatVND = (amount) => {
  if (isNaN(amount)) return '0 ₫'
  return parseInt(amount).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'vnd'
  })
}

export const formatDateToLocalString = (date) => {
  if (!date) return new Date().toLocaleDateString()
  return new Date(date).toLocaleDateString()
}
