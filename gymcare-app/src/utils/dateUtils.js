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