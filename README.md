# TaxHelper MVP

Fintech app for autónomos in Spain: Automate IVA/IRPF reports with AI.

## Setup
1. Clone: `git clone https://github.com/yourusername/taxhelper-mvp.git`
2. Backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
3. Frontend: `cd frontend && npm install && npm run dev`

## Tech Stack
- Backend: FastAPI/Python
- Frontend: React
- DB: PostgreSQL
- Auth: Keycloak

License: MIT

## Deploy BE
1. Build for linux/amd64 platform
docker build --platform linux/amd64 -t taxhelper-backend .

2. Tag it
docker tag taxhelper-backend:latest 471754640546.dkr.ecr.eu-north-1.amazonaws.com/taxhelper-backend:latest

3.  Push it
docker push 471754640546.dkr.ecr.eu-north-1.amazonaws.com/taxhelper-backend:latest