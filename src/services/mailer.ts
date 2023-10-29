import {
  Configuration,
  EmailMessageData,
  EmailsApi,
} from "@elasticemail/elasticemail-client-ts-axios";
import config from "../config";
const configuration = new Configuration({
  apiKey: config.email.apiKey,
});

const emailsApi = new EmailsApi(configuration);

type Props = {
  to: string;
  subject: string;
  html?: string;
  attachments?: any;
  text?: string;
};
const sendElasticEmail = async ({
  to,
  subject,
  html,
  attachments,
  text,
}: Props) => {
  try {
    const from = "nazimhossaindpi@gmail.com";
    const emailMessageData: EmailMessageData = {
      Recipients: [
        {
          Email: to,
          Fields: {
            name: "Name",
          },
        },
      ],
      Content: {
        Body: [
          {
            ContentType: "HTML",
            Charset: "utf-8",
            Content: html,
          },
          {
            ContentType: "PlainText",
            Charset: "utf-8",
            Content: text,
          },
        ],
        From: `Tawk App <${from}>`,
        Subject: subject,
      },
    };
    const response = await emailsApi.emailsPost(emailMessageData);
    return response;
  } catch (error) {
    console.log(error);
  }
};

const sendMail = async (args: any) => {
  if (config.env === "development") {
    return Promise.resolve();
  } else {
    return await sendElasticEmail(args);
  }
};

export const mailService = {
  sendMail,
};
