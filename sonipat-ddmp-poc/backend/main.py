from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Sonipat DDMP POC Backend"}

@app.get("/resources")
def get_resources():
    return [{"id": 1, "name": "Ambulance", "location": "General Hospital"}]
