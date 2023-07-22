import dayjs from "dayjs";

export const getDurationString = (start: Date, end: Date | null): string => {
  if (!end) {
    end = new Date();
  }
  const startDayjs = dayjs(start);
  const endDayjs = dayjs(end);
  const duration = dayjs.duration(endDayjs.diff(startDayjs));
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // return in format HH:MM:SS
  return `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}`;
};

export const getStartDate = (start: string, date: string) => {
  return dayjs(`${date} ${start}`).toDate();
};

export const getEndDate = (end: string, date: string, start: string) => {
  // End needs to be after start, it could be the next day
  return dayjs(`${date} ${end}`).isAfter(dayjs(`${date} ${start}`))
    ? dayjs(`${date} ${end}`).toDate()
    : dayjs(`${date} ${end}`).add(1, "day").toDate();
};

export const getEditDuration = (
  start: string,
  end: string,
  date: string
): string => {
  const startDate = getStartDate(start, date);
  const endDate = getEndDate(end, date, start);
  return getDurationString(startDate, endDate);
};
