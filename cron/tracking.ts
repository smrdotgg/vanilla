import { JSDOM } from 'jsdom';
const url = "https://vanilla-seven.vercel.app/";


export const addTracking = ({
  sequenceStepId,
  content,
  targetEmail,
}: {
  sequenceStepId: string;
  targetEmail: string;
  content: string;
}) => {
  content = openRateTracking({content, sequenceStepId, targetEmail});
  content = ctrTracking({content, sequenceStepId, targetEmail});

  return content;
}


const openRateTracking = ({
  sequenceStepId,
  content,
  targetEmail,
}: {
  sequenceStepId: string;
  targetEmail: string;
  content: string;
}) => {
  const trackingPixel = `<img src="${url}analytics/open_rate?email=${targetEmail}&sequenceStepId=${sequenceStepId}" style="display:none" alt="Company Logo" />`;
  return content + trackingPixel;
};

function ctrTracking({
  content,
  targetEmail,
  sequenceStepId,
}: {
  sequenceStepId: string;
  targetEmail: string;
  content: string;
}): string {
  
  const dom = new JSDOM(content);
  const aElements = dom.window.document.querySelectorAll('a');

  aElements.forEach((a) => {
    const newLink = dom.window.document.createElement('a');
    newLink.href = `${url}analytics/ctr?email=${targetEmail}&originalTarget=${a.href}&sequenceStepId=${sequenceStepId}`;
    newLink.textContent = a.textContent; 
    a.replaceWith(newLink);
  });

  return dom.window.document.body.innerHTML;
}
