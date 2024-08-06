# Getting Started / How to Run the App Locally

1. **Read the Main Product Readme**: Familiarize yourself with the project by reading the [main Product Readme](https://github.com/yalla-coop/food-data-collaboration/blob/main/README.md).

2. **Clone the Repository**: Clone this repository to your local machine.

3. **Create Environment File**: In the `/web` folder of the project, create a `.env` file.

4. **Install Dependencies**: Run the following commands to install all necessary dependencies:
   
```bash
yarn install
cd web
yarn install
cd frontend
yarn install
```
   
5. **Build the Database:** Execute the command:

```bash
yarn build:db
```

6. **Install Shopify CLI:** Ensure that the Shopify CLI is installed on your system.
  
7. **Run the App:** Start the application with the command:
```bash
yarn dev --reset
```

8. **Connect to Shopify:** Follow the on-screen instructions to input your Shopify details for connecting the application.

9. **Update Environment File:** After the app is connected and installed on your Shopify store, update the .env file with the newly generated **SHOPIFY_API_KEY** and **SHOPIFY_API_SECRET_KEY** from the Shopify Partners App Settings. Also, grant permissions for the app to access protected customer data.

10. **Restart the Application:** Restart the app and run:
```bash
yarn dev
```

11. **Configure Webhooks Locally:**
  - Copy the App URL generated each time the server starts from the Shopify Partners App Configuration.
  - Insert this URL into subscribe-to-webhook.js:
```bash
const address = `${AppUrlFromShopify}/api/webhooks`;
```
