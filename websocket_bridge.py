"""
WebSocket Bridge - Connects browser WebSocket to Python TCP server

Run this alongside server.py to enable browser connectivity:
    python websocket_bridge.py

The bridge:
1. Accepts WebSocket connections from the browser (port 8765)
2. Connects to the existing TCP server (port 12345)
3. Handles RSA/XOR encryption between them
4. Translates messages bidirectionally
"""

import asyncio
import websockets
import socket
import threading
import json
import rsa
import hashlib
import random
from crypto.xor_cipher import xor_encrypt, xor_decrypt
from crypto.rsa_utils import encrypt_key

TCP_HOST = "127.0.0.1"
TCP_PORT = 12345
WS_PORT = 8765

class BridgeClient:
    def __init__(self, websocket):
        self.websocket = websocket
        self.tcp_socket = None
        self.xor_key = random.randint(1, 255)
        self.running = True

    async def connect_to_server(self, username):
        """Connect to TCP server and perform key exchange"""
        try:
            self.tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.tcp_socket.connect((TCP_HOST, TCP_PORT))
            
            # Receive server public key
            server_public_key = rsa.PublicKey.load_pkcs1(self.tcp_socket.recv(1024))
            
            # Send encrypted XOR key
            encrypted_xor = encrypt_key(str(self.xor_key), server_public_key)
            self.tcp_socket.send(encrypted_xor)
            
            # Send join message
            join = {"type": "join", "name": username}
            enc_join = xor_encrypt(json.dumps(join, ensure_ascii=False), self.xor_key)
            hash_val = hashlib.sha256(enc_join.encode()).hexdigest()
            self.tcp_socket.send((enc_join + "||" + hash_val).encode())
            
            return True
        except Exception as e:
            print(f"[Bridge] Connection error: {e}")
            return False

    def receive_from_server(self):
        """Thread to receive from TCP server and forward to WebSocket"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        while self.running:
            try:
                msg = self.tcp_socket.recv(4096).decode()
                if not msg:
                    break
                    
                parts = msg.split("||")
                encrypted_msg = parts[0]
                received_hash = parts[1] if len(parts) > 1 else ""
                
                # Verify hash
                computed_hash = hashlib.sha256(encrypted_msg.encode()).hexdigest()
                verified = computed_hash == received_hash
                
                # Decrypt
                decrypted = xor_decrypt(encrypted_msg, self.xor_key)
                payload = json.loads(decrypted)
                payload["verified"] = verified
                
                # Send to browser
                loop.run_until_complete(
                    self.websocket.send(json.dumps(payload))
                )
            except Exception as e:
                if self.running:
                    print(f"[Bridge] Receive error: {e}")
                break

    async def send_to_server(self, message):
        """Send message from browser to TCP server"""
        try:
            data = json.loads(message)
            enc = xor_encrypt(json.dumps(data, ensure_ascii=False), self.xor_key)
            hash_val = hashlib.sha256(enc.encode()).hexdigest()
            self.tcp_socket.send((enc + "||" + hash_val).encode())
        except Exception as e:
            print(f"[Bridge] Send error: {e}")

    def close(self):
        self.running = False
        if self.tcp_socket:
            try:
                leave = {"type": "leave"}
                enc = xor_encrypt(json.dumps(leave), self.xor_key)
                hash_val = hashlib.sha256(enc.encode()).hexdigest()
                self.tcp_socket.send((enc + "||" + hash_val).encode())
            except:
                pass
            self.tcp_socket.close()


async def handle_client(websocket, path):
    """Handle a WebSocket connection from browser"""
    print(f"[Bridge] New browser connection")
    bridge = None
    
    try:
        # Wait for join message
        first_msg = await websocket.recv()
        data = json.loads(first_msg)
        
        if data.get("type") == "join":
            username = data.get("name", "Anonymous")
            bridge = BridgeClient(websocket)
            
            if await bridge.connect_to_server(username):
                # Start receiving thread
                recv_thread = threading.Thread(target=bridge.receive_from_server)
                recv_thread.daemon = True
                recv_thread.start()
                
                # Handle messages from browser
                async for message in websocket:
                    await bridge.send_to_server(message)
    except websockets.exceptions.ConnectionClosed:
        print("[Bridge] Browser disconnected")
    finally:
        if bridge:
            bridge.close()


async def main():
    print(f"[Bridge] WebSocket bridge running on ws://localhost:{WS_PORT}")
    print(f"[Bridge] Connecting to TCP server at {TCP_HOST}:{TCP_PORT}")
    
    async with websockets.serve(handle_client, "localhost", WS_PORT):
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    asyncio.run(main())
