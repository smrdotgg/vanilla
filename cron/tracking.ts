// const url = "https://vanilla-seven.vercel.app/";
const url = "http://localhost:5173/";


export const addCtrTracking = ({ sequenceStepId,content, targetEmail, }: {sequenceStepId:string, targetEmail:string, content: string }) => {
// sequenceStepId
  const trackingPixel = `<img src="${url}analytics/ctr?email=${targetEmail}&sequenceStepId=${sequenceStepId}"  alt="Company Logo" />`;
  return (content + trackingPixel);
};
