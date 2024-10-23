# Deployment Strategy for Jelastic Environments

The application is stored on https://app.jpe.infomaniak.com/ and consists of various parts as described below:

## 1. PRODUCTION Environment Setup

### Application Server (Docker container)
Runs the application and is connected to Shopify via the Application Dashboard (API Configuration Section)

**Automated Deployments:**
- Image Building: Docker images are built automatically via GitHub Actions. The build process triggers on code changes and commits.
- Deployment Notification: GitHub Actions will ping Jelastic via a REST API call with deployment details once the build is complete.
- Tagging: Use branch-sha_commit tags (e.g., main-2d478ef) to keep track of versions.

**Logs:** 
- Access logs in the run.log file within the Docker container for troubleshooting.
  
**Environment Variables:**
- Configure necessary environment variables using the Variables popup in Jelastic.

### Postgres Container:
Stores the internal data store 
- Links: Ensure proper linking between the Postgres container and other components.
- Certificates: Use certificates to secure communication between the Postgres container and other services.

### Creating new Environments:
- Simplest way is to clone Environment by using the Jelastic environment cloning feature to duplicate the current setup.
- This will create an exact replica of your existing environment.
- Post-clone, adjust the following settings:
  - Update environment-specific settings, such as IP addresses, secrets, and environment variables.
  - Ensure any environment-specific configurations (e.g., database URLs, API keys) are updated.
 
![Bildschirmfoto 2024-09-05 um 13 30 52](https://github.com/user-attachments/assets/8b5e39ea-e7e7-499c-b7fd-c0b68de64626)
