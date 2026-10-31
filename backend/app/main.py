
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import routes_repos
import routes_search
import routes_architecture

app = FastAPI(title="CodeAtlas Architecture API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_repos.router)
app.include_router(routes_search.router)
app.include_router(routes_architecture.router)
