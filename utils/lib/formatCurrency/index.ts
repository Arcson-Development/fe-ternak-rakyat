export const formatNumber = (value: string | number | undefined): string => {
  if (value === undefined || value === "") return "";
  const number = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(number) ? "" : new Intl.NumberFormat("id-ID").format(number);
};

export const unformatNumber = (value: string): string => {
  return value.replace(/[^\d]/g, "");
};
