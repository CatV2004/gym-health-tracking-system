export const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const calculateEndDate = (startDate, quantity, type) => {
  const date = new Date(startDate);
  const monthsToAdd =
    type === 0 ? quantity : type === 1 ? quantity * 3 : quantity * 12;
  date.setMonth(date.getMonth() + monthsToAdd);
  return date;
};

export const toGmt7ISOString = (date) => {
  if (!(date instanceof Date)) {
    throw new Error('Invalid date');
  }

  const gmt7OffsetMs = 7 * 60 * 60 * 1000;
  const gmt7AdjustedDate = new Date(date.getTime() - gmt7OffsetMs);
  return gmt7AdjustedDate.toISOString();
};