export interface TimeRange {
  from?: Date;
  to?: Date;
}

export const isWithinRange = (date: Date, range?: TimeRange): boolean => {
  if (!range) return true;
  const afterStart = !range.from || date.getTime() >= range.from.getTime();
  const beforeEnd = !range.to || date.getTime() <= range.to.getTime();
  return afterStart && beforeEnd;
};
