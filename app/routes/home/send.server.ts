export async function sendEmail(accessToken: string) {
  const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
  // Ensure the email body is formatted correctly
  const emailBody = `From: "Semere's GMAIL" <se.semere.tereffe@gmail.com>
To: "Semere's Icloud" <tereffe.semere@icloud.com>
Subject: Test Email

This is a test email sent via the Gmail API.
  `;

  // Base64 encode the email and make it URL-safe
  const base64EncodedEmail = Buffer.from(emailBody)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: base64EncodedEmail }),
  });

  const data = await response.json();

  if (data.error) {
    console.error("Failed to send email:", data.error);
  } else {
    console.log("Email sent successfully:", data);
  }
}

// Usage
// sendEmail('ya29.a0Ad52N3_z1r-EQeaNIAOXJ_5Lq3MfhOIQVjO-yMg98PdYcWb69Xr3Qb6WxDDA8B74CwoWHTqjvID-YRFwRsw_Isscu25Yt4apQcpgPo09nTh-nZVeJQljh2uLciUKiG12ND9rRzW-Mua-NAF39yQ2QcT-SOOU3J6BRPqPaCgYKAd0SARISFQHGX2MiXeKkZtJqvpCXE42LcDnwuw0171')
//   .then(() => console.log('Email sent successfully.'))
//   .catch(error => console.error('Error sending email:', error));
