import asyncio
import websockets
import json
from datetime import datetime
import random

async def video_stream_simulator():
    uri = "ws://127.0.0.1:8000/ws/video?source=true"
    frame_number = 0
    possible_objects = ["human", "vehicle", "animal"]

    while True:
        try:
            async with websockets.connect(uri) as websocket:
                print("Connected to backend as video source.")
                while True:
                    frame_data = {
                        "frame": frame_number,
                        "timestamp": datetime.now().isoformat(),
                        "status": "Streaming",
                        "object_detected": None
                    }

                    # Simulate object detection randomly
                    if random.random() < 0.1: # 10% chance to detect an object
                        frame_data["object_detected"] = random.choice(possible_objects)
                        print(f"*** Detected {frame_data['object_detected']} in frame {frame_number} ***")

                    await websocket.send(json.dumps(frame_data))
                    print(f"Sent frame: {frame_number}")
                    frame_number += 1
                    await asyncio.sleep(1) # Send a frame every second
        except (websockets.exceptions.ConnectionClosedError, ConnectionRefusedError) as e:
            print(f"Connection failed: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"An unexpected error occurred: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(video_stream_simulator())
