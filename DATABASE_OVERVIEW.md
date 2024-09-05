Overview of various Database tables and their purpose:

**1. Users**
This table stores authenticated users along with their encrypted refresh and access tokens provided by Keycloak. These tokens are used to refresh expired access tokens when necessary providing a syncronised state between Keycloak and the node.js application via OIDC.

**2. Products** 
This table contains information on both hub and producer products. It serves as the central database for editing and deleting product entries.

**3. Sales Sessions**
This table logs sales sessions linked to users (via creator_user_id) and includes details such as start and end dates. It also connects to the corresponding order in the system.

**4. Sales Sessions Order**
This table functions as a log for tracking the communication status between the hub and the producer. It includes details like webhook IDs, order numbers (from Shopify), and current status of the completed or cancelled order request.
Note that there is no log if the orders/paid webhook isn't being triggered.

**5. Producer Order Lines**
This table stores the details of order lines sent to the producer, and is used for updating orders with new line items.

**6. Webhooks**
Every time Shopify triggers a webhook, a record is created in this table. It logs the webhook event and its associated details.

**7. Variants**
This table maintains the mapping of product variants between the hub and the producer. It also includes information on excess stock and other details selected during the variant mapping process.

**8. Shopify Sessions**
This table manages user sessions created and handled by Shopify, including session tokens and expiration details.
