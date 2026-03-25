const amqp = require('amqplib');

const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

let channel = null;

async function publish(queue, message) {
  try {
    if (!channel) {
      const connection = await amqp.connect(url);
      channel = await connection.createChannel();
    }
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  } catch (err) {
    console.error('RabbitMQ publish mislukt:', err.message);
    channel = null;
  }
}

module.exports = { publish };
