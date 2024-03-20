// If this function fails, it will throw an error

const subscribeToWebhook = async ({ session, HOST, topic, shopify }) => {
  const address = HOST.endsWith('/') ? `${HOST}api/webhooks` : `${HOST}/api/webhooks`;

  try {
    const { webhooks: topicRegisteredWebhooks } =
      await shopify.api.rest.Webhook.all({
        session,
        topic
      });

    console.log('topicRegisteredWebhooks', topicRegisteredWebhooks);

    const webhookAlreadyExists = topicRegisteredWebhooks?.some(
      (webhook) => webhook.address === address && webhook.topic === topic
    );

    if (webhookAlreadyExists) {
      return;
    }
    const webhook = new shopify.api.rest.Webhook({ session });
    webhook.address = address;
    webhook.topic = topic;
    await webhook.saveAndUpdate(); // This failure is very important
  } catch (err) {
    console.error('err', err);
    // This failure is very important , so the setup should fail if it fails
    throw new Error('Failed to register webhook', err);
  }
};

export default subscribeToWebhook;
