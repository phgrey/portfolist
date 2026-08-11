

# Run and deploy your AI Studio app

## Gcloud:
in code-references - `gcloud+tailscale [un]needed`

```bash
ln -s docker/Dockerfile.gcloud Dockerfile
# cp docker/Dockerfile.gcloud Dockerfile


gcloud builds submit --tag gcr.io/portfolist-a3725/portfolist-web .

gcloud builds submit \
  --tag gcr.io/portfolist-a3725/portfolist-web-v0.0.1 \
  -f docker/Dockerfile.gcloud .

gcloud run deploy portfolist-web \
  --image gcr.io/portfolist-a3725/portfolist-web-v0.0.1 \
  --region us-central1 \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars="TAILSCALE_AUTHKEY=${TAILSCALE_AUTHKEY}" \
  --allow-unauthenticated


```

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/db52c7c5-def3-4d5c-86d0-c1fde075219f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


# agent 
is described here file://./docs/agent.md