import axios from 'axios';
let lastRequestTime = 0;

async function sendRequest(payload) {
  try {
    const currentTime = Date.now();
    const elapsedTimeSinceLastRequest = currentTime - lastRequestTime;

    // Ensure we respect the Retry-After header if present
    if (elapsedTimeSinceLastRequest < 0) {
      const delayNeeded = Math.abs(elapsedTimeSinceLastRequest);
      await delay(delayNeeded);
    }

    const response = await axios.post('YOUR_SHOPIFY_API_ENDPOINT', payload);
    lastRequestTime = Date.now(); // Update the last request time

    // Check for Retry-After header
    const retryAfter = response.headers['retry-after'];
    if (retryAfter) {
      console.log(`Rate limited. Retrying after ${retryAfter} seconds.`);
      await delay(retryAfter * 1000);
      return sendRequest(payload); // Retry the request
    }

    // Handle the response
    handleResponse(response);

    return response;
  } catch (error) {
    throw new Error(`Error sending request: ${error.message}`);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage
async function updateVariantsInBatches(products) {
  for (const product of products) {
    const payload = createRequestPayload(product);

    try {
      const response = await sendRequest(payload);
      handleResponse(response);
    } catch (error) {
      console.error('Error updating variants:', error);
    }
  }
}

function createRequestPayload(product) {
  // Create the request payload for updating a product variant
  // Customize this based on your specific needs
  // This function should prepare the payload for a single product variant
}

function handleResponse(response) {
  // Handle the response from the API
}

// Usage
const productsToUpdate = [
  /* ... array of products */
];
updateVariantsInBatches(productsToUpdate);
