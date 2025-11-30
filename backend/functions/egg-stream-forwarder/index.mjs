import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const sqs = new SQSClient({});
const QUEUE_URL = process.env.QUEUE_URL;

function extractClutchIdFromImageKey(imageKey) {
  if (!imageKey) return null;
  const match = imageKey.match(/^clutches\/([^/]+)\//);
  return match ? match[1] : null;
}

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const newImage = record.dynamodb.NewImage;
      const item = unmarshall(newImage);

      const clutchId = extractClutchIdFromImageKey(item.imageKey);
      const messageBody = { ...item, clutchId };

      await sqs.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(messageBody)
      }));

      console.log('Forwarded egg record to SQS:', item.sk, 'clutchId:', clutchId);
    }
  }

  return { statusCode: 200 };
};
