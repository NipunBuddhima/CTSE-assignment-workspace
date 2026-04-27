# ShopHub – AWS ECS Deployment Guide

This guide covers deploying the ShopHub microservices to **AWS ECS (Fargate)** — within the free tier.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| AWS CLI | v2+ | Cloud provisioning |
| Docker | 24+ | Local image testing |
| Git | Any | Code push to trigger CI/CD |

---

## Architecture on AWS

```
Internet
    │
    ▼
┌─────────────────────────────────────────────┐
│           Application Load Balancer          │
│   (Routes /api/auth → user-service, etc.)    │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────▼──────────────────┐
    │      AWS ECS Cluster         │
    │      (Fargate / Serverless)  │
    │                              │
    │  ┌─────────┐ ┌────────────┐  │
    │  │  user   │ │  product   │  │
    │  │ service │ │  service   │  │
    │  │ :3001   │ │  :3002     │  │
    │  └─────────┘ └────────────┘  │
    │  ┌─────────┐ ┌────────────┐  │
    │  │  order  │ │  payment   │  │
    │  │ service │ │  service   │  │
    │  │ :3003   │ │  :3004     │  │
    │  └─────────┘ └────────────┘  │
    └──────────────────────────────┘
               │
    ┌──────────▼──────────────────┐
    │   MongoDB Atlas (Free M0)    │
    │   mongodb+srv://cluster...   │
    └─────────────────────────────┘
```

---

## Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → **Sign Up Free**
2. Create a **free M0 cluster** (512MB, always free)
3. Create a database user (e.g., `shophub-admin`)
4. Whitelist **all IPs** (`0.0.0.0/0`) for ECS compatibility
5. Copy the connection string:
   ```
   mongodb+srv://shophub-admin:PASSWORD@cluster0.xxxxx.mongodb.net/
   ```
6. Create 4 databases, one per service:
   - `user-service-db`
   - `product-service-db`
   - `order-service-db`
   - `payment-service-db`

---

## Step 2: Set Up AWS Account & CLI

```bash
# Install AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure with your IAM user credentials
aws configure
# AWS Access Key ID: [your key]
# AWS Secret Access Key: [your secret]
# Default region name: us-east-1
# Default output format: json
```

Create an IAM user with these policies (use IAM console):
- `AmazonECS_FullAccess`
- `AmazonEC2ContainerRegistryFullAccess`
- `SecretsManagerReadWrite`
- `CloudWatchLogsFullAccess`
- `IAMFullAccess`

---

## Step 3: Store Secrets in AWS Secrets Manager

Run these commands (replace values with your real data):

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# MongoDB URIs
aws secretsmanager create-secret --region $REGION \
  --name "shophub/mongodb-uri" \
  --secret-string "mongodb+srv://shophub-admin:PASSWORD@cluster0.xxxxx.mongodb.net/user-service-db?retryWrites=true&w=majority"

aws secretsmanager create-secret --region $REGION \
  --name "shophub/product-mongodb-uri" \
  --secret-string "mongodb+srv://shophub-admin:PASSWORD@cluster0.xxxxx.mongodb.net/product-service-db?retryWrites=true&w=majority"

aws secretsmanager create-secret --region $REGION \
  --name "shophub/order-mongodb-uri" \
  --secret-string "mongodb+srv://shophub-admin:PASSWORD@cluster0.xxxxx.mongodb.net/order-service-db?retryWrites=true&w=majority"

aws secretsmanager create-secret --region $REGION \
  --name "shophub/payment-mongodb-uri" \
  --secret-string "mongodb+srv://shophub-admin:PASSWORD@cluster0.xxxxx.mongodb.net/payment-service-db?retryWrites=true&w=majority"

# JWT Secret
aws secretsmanager create-secret --region $REGION \
  --name "shophub/jwt-secret" \
  --secret-string "your-very-long-random-production-jwt-secret-here"

# After deploying services, add their public URLs:
aws secretsmanager create-secret --region $REGION \
  --name "shophub/user-service-url" \
  --secret-string "http://YOUR_USER_SERVICE_URL:3001/api/users"

aws secretsmanager create-secret --region $REGION \
  --name "shophub/product-service-url" \
  --secret-string "http://YOUR_PRODUCT_SERVICE_URL:3002/api/products"

aws secretsmanager create-secret --region $REGION \
  --name "shophub/order-service-url" \
  --secret-string "http://YOUR_ORDER_SERVICE_URL:3003/api/orders"
```

---

## Step 4: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name shophub-cluster \
  --capacity-providers FARGATE \
  --region us-east-1
```

---

## Step 5: Set Up GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `DOCKER_HUB_USERNAME` | `nipunbuddhima` |
| `DOCKER_HUB_TOKEN` | Your Docker Hub access token |
| `SNYK_TOKEN` | Your Snyk API token (from snyk.io) |
| `AWS_ACCESS_KEY_ID` | Your AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS IAM secret key |
| `AWS_REGION` | `us-east-1` |

### Getting Docker Hub Token
1. Login to [hub.docker.com](https://hub.docker.com)
2. Account Settings → Security → **New Access Token**
3. Name it `github-actions`, copy the token

### Getting Snyk Token
1. Sign up at [snyk.io](https://snyk.io) (free)
2. Account Settings → **API Token**
3. Copy the token

---

## Step 6: Register Task Definitions

Update `aws/task-definitions/*.json` — replace `ACCOUNT_ID` with your actual AWS account ID:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

# Register all task definitions
for SERVICE in user-service product-service order-service payment-service; do
  cat aws/task-definitions/$SERVICE.json \
    | sed "s/ACCOUNT_ID/$ACCOUNT_ID/g" \
    | aws ecs register-task-definition \
        --cli-input-json file:///dev/stdin \
        --region $REGION
  echo "✓ Registered $SERVICE task definition"
done
```

---

## Step 7: Create ECS Services (AWS Console - Recommended)

1. Go to **AWS ECS Console** → Clusters → `shophub-cluster`
2. Click **Create Service** for each microservice:

| Setting | Value |
|---------|-------|
| Launch type | `FARGATE` |
| Task definition | Select the registered one (e.g., `user-service`) |
| Service name | `user-service` |
| Desired tasks | `1` |
| VPC | Select your default VPC |
| Subnets | Select 2 public subnets |
| Security group | Create new: allow inbound TCP on port 3001 (or whatever port) |
| Auto-assign public IP | **ENABLED** (so it's accessible from internet) |

Repeat for all 4 services.

---

## Step 8: Trigger CI/CD Pipeline

After setting up GitHub secrets:

```bash
# Push any change to trigger the pipeline
git add .
git commit -m "feat: add CI/CD pipelines and security hardening"
git push origin main
```

Watch the pipeline run at: `https://github.com/NipunBuddhima/CTSE-assignment-workspace/actions`

---

## Step 9: Update Service URLs

After deploying, get the public IPs of your ECS tasks:

```bash
# List running tasks
aws ecs list-tasks --cluster shophub-cluster --region us-east-1

# Get task details (public IP)
aws ecs describe-tasks \
  --cluster shophub-cluster \
  --tasks TASK_ARN \
  --region us-east-1 \
  --query 'tasks[0].attachments[0].details'
```

Update the secrets with actual service URLs, then redeploy.

---

## Security Measures Implemented

| Measure | Implementation |
|---------|---------------|
| **IAM Least Privilege** | ECS task roles with minimal permissions |
| **Secrets Management** | AWS Secrets Manager for DB URIs and API keys |
| **Security Headers** | Helmet.js on all services |
| **Rate Limiting** | express-rate-limit (global + endpoint-specific) |
| **SAST Scanning** | Snyk in every CI/CD pipeline |
| **Container Security** | Read-only FS, non-root user in Dockerfiles |
| **Body Size Limit** | 10kb max request body |
| **CORS** | Restricted to allowed origins |
| **JWT Auth** | Token expiry, Bearer scheme |
| **Password Hashing** | bcrypt with 10 salt rounds |

---

## Verifying Deployment

```bash
# Health checks (replace with your actual ECS task public IPs)
curl http://USER_SERVICE_IP:3001/health
curl http://PRODUCT_SERVICE_IP:3002/health
curl http://ORDER_SERVICE_IP:3003/health
curl http://PAYMENT_SERVICE_IP:3004/health
```

Expected response:
```json
{ "status": "ok", "service": "user-service", "timestamp": "..." }
```

---

## Cost Estimate (AWS Free Tier)

| Service | Free Tier | Cost |
|---------|-----------|------|
| ECS Fargate | 750hrs/month EC2 equivalent | **$0** |
| Secrets Manager | 30 days free per secret | ~**$0.40/mo** for 4 secrets |
| CloudWatch Logs | 5GB free | **$0** |
| MongoDB Atlas | M0 cluster free forever | **$0** |
| Docker Hub | Free for public repos | **$0** |
| **Total** | | **~$0 - $2/month** |

> **Tip:** Stop/delete ECS services when not actively demonstrating to avoid any charges.
