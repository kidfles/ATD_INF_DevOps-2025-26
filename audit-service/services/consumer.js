const amqp = require('amqplib');
const { db } = require('./database');

const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE = 'audit-logs';
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

async function startConsumer(retries = 0) {
  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    console.log(`Luistert naar queue: ${QUEUE}`);

    channel.consume(QUEUE, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await db.collection('audit-logs').insertOne({
            action: content.action,
            data: content.data || {},
            timestamp: content.timestamp || new Date().toISOString()
          });
          channel.ack(msg);
        } catch (err) {
          console.error('Fout bij verwerken bericht:', err.message);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (_err) {
    if (retries < MAX_RETRIES) {
      console.log(`RabbitMQ niet beschikbaar, poging ${retries + 1}/${MAX_RETRIES}...`);
      setTimeout(() => startConsumer(retries + 1), RETRY_DELAY);
    } else {
      console.error('RabbitMQ connectie mislukt na', MAX_RETRIES, 'pogingen');
    }
  }
}

module.exports = { startConsumer };
