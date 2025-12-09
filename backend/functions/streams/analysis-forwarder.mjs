import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const sqs = new SQSClient({});
const CHICK_QUEUE_URL = process.env.QUEUE_URL;
const NON_VIABLE_QUEUE_URL = process.env.NON_VIABLE_QUEUE_URL;

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === 'MODIFY') {
      const newImage = record.dynamodb.NewImage;
      const item = unmarshall(newImage);

      if (item.hatchLikelihood !== undefined && !item.chickImageUrl && !item.comfortSongKey) {
        const targetQueue = item.hatchLikelihood < 50 ? NON_VIABLE_QUEUE_URL : CHICK_QUEUE_URL;
        const queueType = item.hatchLikelihood < 50 ? 'non-viable' : 'chick-image';

        await sqs.send(new SendMessageCommand({
          QueueUrl: targetQueue,
          MessageBody: JSON.stringify(item)
        }));

        console.log(`Routed egg ${item.sk} to ${queueType} queue (hatchLikelihood: ${item.hatchLikelihood})`);
      }
    }
  }

  return { statusCode: 200 };
};
