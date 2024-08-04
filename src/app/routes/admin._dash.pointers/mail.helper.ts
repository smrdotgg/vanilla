import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import nodemailer from "nodemailer";
import { generateRandomString } from "~/utils/others";
import { env } from "~/utils/env";

const favorableUsernames = [
  "AlexandraW",
  "EmilyPatel",
  "JacksonLee",
  "OliviaBrown",
  "EthanHall",
  "AvaMorris",
  "LiamWright",
  "SophiaMartin",
  "BenjaminFox",
  "CharlotteLane",
];

const getEmailAddressUsername = async ({
  sshHost,
  sshUsername,
  sshPassword,
}: {
  sshHost: string;
  sshUsername: string;
  sshPassword: string;
}) => {
  const userList = await runBashCommands({
    bashCommands: ["sudo getent passwd"],
    scriptMode: true,
    host: sshHost,
    username: sshUsername,
    password: sshPassword,
  }).then((r) => r[0].split("\n").map((l) => l.split(":").at(0)));
  let finalUser = "";
  for (const user of favorableUsernames) {
    if (!userList.includes(user)) {
      finalUser = user;
      break;
    }
  }
  if (finalUser.length === 0) {
    finalUser = generateRandomString(10);
  }

  return finalUser;
};

const createUser = async ({
  sshHost,
  sshUsername,
  sshPassword,
  username,
  password,
}: {
  sshHost: string;
  sshUsername: string;
  sshPassword: string;
  username: string;
  password: string;
}) => {
  return await runBashCommands({
    bashCommands: [
      `sudo useradd -m ${username} -G mail`,
      `echo -e "${password}\\n${password}" | sudo passwd ${username}`,
    ],
    scriptMode: false,
    host: sshHost,
    username: sshUsername,
    password: sshPassword,
  });
};

async function sendHelloEmail({
  smtpServer,
  smtpPort,
  smtpUsername,
  smtpPassword,
  toEmail,
  fromEmail,
}: {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  toEmail: string;
  fromEmail: string;
}) {
  let transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: true,
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
  });

  let mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: "Hello from SplitBox!",
    text: "Hello! This is a test email.",
  };

  return await transporter.sendMail(mailOptions);
}

const deleteUser = async ({
  sshHost,
  sshUsername,
  sshPassword,
  username,
}: {
  sshHost: string;
  sshUsername: string;
  sshPassword: string;
  username: string;
}) => {
  return await runBashCommands({
    bashCommands: [`sudo userdel ${username} `],
    scriptMode: false,
    host: sshHost,
    username: sshUsername,
    password: sshPassword,
  });
};
export const sendTestEmail = async ({
  vpsUser,
  domain,
  targetEmail,
}: {
  vpsUser: string;
  domain: string;
  targetEmail: string;
}) => {
  console.log(
    `Starting sendTestEmail function with vpsUser=${vpsUser}, domain=${domain}, targetEmail=${targetEmail}`
  );

  const dummyUsername = await getEmailAddressUsername({
    sshHost: domain,
    sshPassword: env.CONTABO_VPS_LOGIN_PASSWORD,
    sshUsername: vpsUser,
  });
  console.log(`Generated dummyUsername: ${dummyUsername}`);

  const dummyPassword = crypto.randomUUID().replaceAll("-", "");
  console.log(`Generated dummyPassword: ${dummyPassword}`);

  console.log(`Creating user ${dummyUsername} on ${domain}`);
  await createUser({
    username: dummyUsername,
    password: dummyPassword,
    sshHost: domain,
    sshPassword: env.CONTABO_VPS_LOGIN_PASSWORD,
    sshUsername: vpsUser,
  });
  console.log(`User created successfully`);

  console.log(
    `Sending hello email from ${dummyUsername}@${domain} to ${targetEmail}`
  );
  await sendHelloEmail({
    smtpPassword: dummyPassword,
    smtpPort: 465,
    smtpUsername: `${dummyUsername}@${domain}`,
    toEmail: targetEmail,
    fromEmail: `${dummyUsername}@${domain}`,
    smtpServer: `mail.${domain}`,
  });
  console.log(`Email sent successfully`);

  console.log(`Deleting user ${dummyUsername} on ${domain}`);
  await deleteUser({
    username: dummyUsername,
    sshHost: domain,
    sshPassword: env.CONTABO_VPS_LOGIN_PASSWORD,
    sshUsername: vpsUser,
  });
  console.log(`User deleted successfully`);

  console.log(`sendTestEmail function completed`);
};
//
// export const sendTestEmail = async ({
//   vpsUser,
//   domain,
//   targetEmail,
// }: {
//   vpsUser: string;
//   domain: string;
//   targetEmail: string;
// }) => {
//   const dummyUsername = await getEmailAddressUsername({
//     sshHost: domain,
//     sshPassword: env.CONTABO_VPS_LOGIN_PASSWORD,
//     sshUsername: vpsUser,
//   });
//   const dummyPassword = crypto.randomUUID().replaceAll("-", "");
//
//   await createUser({
//     username: dummyUsername,
//     password: dummyPassword,
//     sshHost: domain,
//     sshPassword: env.CONTABO_VPS_LOGIN_PASSWORD,
//     sshUsername: vpsUser,
//   });
//   await sendHelloEmail({
//     smtpPassword: dummyPassword,
//     smtpPort: 465,
//     smtpUsername: `${dummyUsername}@${domain}`,
//     toEmail: targetEmail,
//     fromEmail: `${dummyUsername}@${domain}`,
//     smtpServer: `mail.${domain}`,
//   });
//   await deleteUser({
//     username: dummyUsername,
//     sshHost: domain,
//     sshPassword: env.CONTABO_VPS_LOGIN_PASSWORD,
//     sshUsername: vpsUser,
//   });
// };
