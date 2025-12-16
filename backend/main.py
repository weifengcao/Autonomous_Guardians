from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
from datetime import datetime
import asyncio
import json

app = FastAPI()

# --- Connection Manager for WebSockets ---
class ConnectionManager:
    def __init__(self):
        self.viewers: List[WebSocket] = []
        self.source: Optional[WebSocket] = None

    async def connect_viewer(self, websocket: WebSocket):
        await websocket.accept()
        self.viewers.append(websocket)

    def disconnect_viewer(self, websocket: WebSocket):
        self.viewers.remove(websocket)

    async def connect_source(self, websocket: WebSocket):
        if self.source is not None:
            await websocket.close(code=4000, reason="Video source already connected")
            return False
        await websocket.accept()
        self.source = websocket
        return True

    def disconnect_source(self):
        self.source = None

    async def broadcast_to_viewers(self, message: str):
        for connection in self.viewers:
            await connection.send_text(message)

manager = ConnectionManager()


# --- Data Models ---
class Waypoint(BaseModel):
    lat: float
    lon: float

class Route(BaseModel):
    id: str
    name: str
    waypoints: List[Waypoint]

class RobotStatus(BaseModel):
    status_message: str
    current_route_id: Optional[str] = None
    current_waypoint_index: Optional[int] = None
    timestamp: datetime

class Incident(BaseModel):
    id: str
    timestamp: datetime
    object_type: str
    frame_number: int

# --- In-memory database ---
db_routes: Dict[str, Route] = {}
db_incidents: List[Incident] = []
current_robot_status: Optional[RobotStatus] = None

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Autonomous Guardians Backend"}

# --- Route Management Endpoints ---
@app.post("/routes", response_model=Route)
def create_route(route_data: Route):
    route_id = str(uuid.uuid4())
    route = Route(id=route_id, name=route_data.name, waypoints=route_data.waypoints)
    db_routes[route_id] = route
    return route

# ... (other route endpoints remain the same)
@app.get("/routes", response_model=List[Route])
def get_routes():
    return list(db_routes.values())

@app.get("/routes/{route_id}", response_model=Route)
def get_route(route_id: str):
    if route_id not in db_routes:
        raise HTTPException(status_code=404, detail="Route not found")
    return db_routes[route_id]

@app.put("/routes/{route_id}", response_model=Route)
def update_route(route_id: str, route_data: Route):
    if route_id not in db_routes:
        raise HTTPException(status_code=404, detail="Route not found")
    route = Route(id=route_id, name=route_data.name, waypoints=route_data.waypoints)
    db_routes[route_id] = route
    return route

@app.delete("/routes/{route_id}", response_model=Route)
def delete_route(route_id: str):
    if route_id not in db_routes:
        raise HTTPException(status_code=404, detail="Route not found")
    return db_routes.pop(route_id)


# --- Robot Status Endpoints ---
@app.post("/robot/status", response_model=RobotStatus)
def update_robot_status(status: RobotStatus):
    global current_robot_status
    status.timestamp = datetime.now()
    current_robot_status = status
    return status

@app.get("/robot/status", response_model=Optional[RobotStatus])
def get_robot_status():
    return current_robot_status

# --- Incident Endpoints ---
@app.get("/incidents", response_model=List[Incident])
def get_incidents():
    return db_incidents

# --- Video Stream WebSocket Endpoint ---
@app.websocket("/ws/video")
async def websocket_video_endpoint(websocket: WebSocket, source: bool = False):
    if source:
        is_new_source = await manager.connect_source(websocket)
        if not is_new_source:
            return
        try:
            while True:
                data = await websocket.receive_text()
                # Check for incidents
                try:
                    frame_data = json.loads(data)
                    if "object_detected" in frame_data and frame_data["object_detected"]:
                        incident = Incident(
                            id=str(uuid.uuid4()),
                            timestamp=datetime.fromisoformat(frame_data["timestamp"]),
                            object_type=frame_data["object_detected"],
                            frame_number=frame_data["frame"]
                        )
                        db_incidents.append(incident)
                except json.JSONDecodeError:
                    pass # Ignore if the message is not valid JSON

                await manager.broadcast_to_viewers(data)
        except WebSocketDisconnect:
            manager.disconnect_source()
            await manager.broadcast_to_viewers('{"status": "Video source disconnected"}')
    else:
        await manager.connect_viewer(websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect_viewer(websocket)