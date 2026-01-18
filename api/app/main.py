from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/gitops/status")
def gitops_status():
    return {"message": "GitOps API is running"}
