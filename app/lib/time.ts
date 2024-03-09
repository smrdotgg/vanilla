export function hoursToEnglishString(hours: number): string {
  const minutes = hours * 60;
  const timeParts = [
    { unit: "Month", value: Math.floor(minutes / 43800) },
    { unit: "Day", value: Math.floor((minutes % 43800) / 1440) },
    { unit: "Hour", value: Math.floor((minutes % 1440) / 60) },
    { unit: "Minute", value: Math.floor(minutes % 60) },
  ];
  const nonZeroParts = timeParts
    .filter(part => part.value > 0)
    .map(part => `${part.value} ${part.value > 1 ? part.unit + "s" : part.unit}`);
  return nonZeroParts.join(" and ");
}

