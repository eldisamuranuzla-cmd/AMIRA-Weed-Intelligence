# AMIRA V29 — Datature Vision Proxy

This folder contains the AMIRA Weed Vision frontend plus a Vercel serverless proxy. The proxy keeps the Datature project secret on the server instead of exposing it in GitHub Pages.

## Vercel Environment Variables

- `DATATURE_API_URL` = the exact Datature deployed inference URL ending in `/predict`
- `DATATURE_SECRET` = Datature Project Secret Key
- `AMIRA_MODEL_NAME` = optional model/deployment name

Do NOT put the secret in `index.html` or GitHub.

## Datature setup

1. Create/prepare the weed segmentation project and annotations.
2. Train and evaluate the model.
3. From Artifacts, create an API Deployment.
4. Copy the generated inference URL into `DATATURE_API_URL`.
5. Copy the project secret into `DATATURE_SECRET`.
6. Deploy this folder to Vercel.
7. Put the Vercel URL + `/api/predict` into AMIRA's AI Endpoint field.

The current density thresholds are explicitly an initial screening estimate and must be field-calibrated before being used as an agronomic decision rule.
