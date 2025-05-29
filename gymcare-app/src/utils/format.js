import { parseISO, format } from 'date-fns';

export const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return format(date, 'HH:mm');
};

// Format phút -> "60 phút"
export const formatDuration = (minutes) => {
  return `${minutes} phút`;
};