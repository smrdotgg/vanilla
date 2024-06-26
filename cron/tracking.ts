import { JSDOM } from "jsdom";

const url = process.env.URL;

type analyticsSettings = {
  optOutRate: boolean | null;
  openRate: boolean | null;
  clickthroughRate: boolean | null;
};

export const addTracking = <T extends analyticsSettings>({
  sequenceStepId,
  content,
  targetEmail,
  customerTrackingLink,
  settings,
}: {
  sequenceStepId: string;
  targetEmail: string;
  content: string;
  customerTrackingLink: string | null;
  settings: T;
}) => {
  if (settings.openRate)
    content = openRateTracking({ content, sequenceStepId, targetEmail });
  if (settings.optOutRate)
    content = unsubTracking({
      content,
      customerTrackingLink,
      sequenceStepId,
      targetEmail,
    });
  if (settings.clickthroughRate)
    content = ctrTracking({
      content,
      sequenceStepId,
      targetEmail,
      customerTrackingLink,
    });

  return content;
};

const renderUnsubMessage = ({ url }: { url: string }) => `<p>
      To unsubscribe from our mailing list, please <a href="${url}">click here.</a>
    </p>`;

const cleanLink = ({ url }: { url: string | null }) =>
  url === null
    ? null
    : url
        .split("https://www.")
        .join("")
        .split("http://www.")
        .join("")
        .split("https://")
        .join("")
        .split("https://")
        .join("");

const unsubTracking = ({
  sequenceStepId,
  content,
  targetEmail,
  customerTrackingLink,
}: {
  sequenceStepId: string;
  targetEmail: string;
  content: string;
  customerTrackingLink: string | null;
}) => {
  const dom = new JSDOM(content);
  const aElements = dom.window.document.querySelectorAll("a");
  const ourTrackingLink = `${url}analytics/opt_out?email=${targetEmail}&sequenceStepId=${sequenceStepId}`;

  let foundATag = false;
  aElements.forEach((a) => {
    if (
      cleanLink({ url: a.href }) === cleanLink({ url: customerTrackingLink })
    ) {
      foundATag = true;
      const newLink = dom.window.document.createElement("a");
      newLink.href = ourTrackingLink;
      newLink.textContent = a.textContent;
      a.replaceWith(newLink);
    }
  });

  // add your own link
  if (!foundATag) {
    const message = renderUnsubMessage({ url: ourTrackingLink });
    return content + message;
  }

  return dom.window.document.body.innerHTML;
};

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
  sequenceStepId,
  content,
  targetEmail,
  customerTrackingLink,
}: {
  sequenceStepId: string;
  targetEmail: string;
  content: string;
  customerTrackingLink: string | null;
}): string {
  const dom = new JSDOM(content);
  const aElements = dom.window.document.querySelectorAll("a");

  aElements.forEach((a) => {
    const newLink = dom.window.document.createElement("a");

    newLink.href = `${url}analytics/ctr?email=${targetEmail}&originalTarget=${encodeURIComponent(a.href)}&sequenceStepId=${sequenceStepId}`;

    newLink.textContent = a.textContent;
    a.replaceWith(newLink);
  });

  return dom.window.document.body.innerHTML;
}
