from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from api.fuzz_engine import engine
from api.ai_analyzer import analyzer

app = FastAPI(title="AegisFuzz AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def get_status():
    return engine.get_status()

@app.post("/api/start")
async def start_fuzzing():
    # In a real app, this would start a background task or Docker container
    # For simulation, we'll let the WebSocket handle the stream
    return {"message": "Fuzzing job queued"}

@app.post("/api/stop")
async def stop_fuzzing():
    engine.stop()
    return {"message": "Fuzzing job stopped"}

@app.get("/api/analyze")
async def analyze_crash():
    # Trigger AI analysis on the latest "crash"
    report = analyzer.analyze_crash({})
    return report

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected via WebSocket")
    
    # Send initial state
    await websocket.send_text(json.dumps({
        "type": "init",
        "data": engine.get_status()
    }))

    try:
        async def stream_callback(data):
            await websocket.send_text(json.dumps(data))

        # Start the engine loop if not running
        # In a real app, the engine would run independently of the WS
        if not engine.running:
            # We don't want to block the WS accept loop, so we'll just check status
            pass
        
        while True:
            # Simple heartbeat and check for command messages
            msg = await websocket.receive_text()
            cmd = json.loads(msg)
            
            if cmd["action"] == "start":
                asyncio.create_task(engine.start(stream_callback))
            elif cmd["action"] == "stop":
                engine.stop()

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WS Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
