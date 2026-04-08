import asyncio
import websockets

async def test():
    print("Connecting...")
    async with websockets.connect("ws://127.0.0.1:8000/ws/chat") as websocket:
        print("Connected!")
        await asyncio.sleep(2)
        print("Still connected!")

asyncio.run(test())
