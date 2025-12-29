import socket
import threading
import rsa
import hashlib
import json
import random
from crypto.xor_cipher import xor_encrypt, xor_decrypt
from crypto.rsa_utils import encrypt_key

HOST = "127.0.0.1"
PORT = 12345

name = input("Enter your username: ").strip() or None
xor_key = random.randint(1, 255)

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))

# Receive server public key
server_public_key = rsa.PublicKey.load_pkcs1(client.recv(1024))

# Send XOR key encrypted with server public key
encrypted_xor = encrypt_key(str(xor_key), server_public_key)
client.send(encrypted_xor)

# Send join payload
join = {"type": "join", "name": name}
enc_join = xor_encrypt(json.dumps(join, ensure_ascii=False), xor_key)
hash_val = hashlib.sha256(enc_join.encode()).hexdigest()
client.send((enc_join + "||" + hash_val).encode())


def receive():
    while True:
        try:
            msg = client.recv(4096).decode()
            encrypted_msg, _ = msg.split("||")
            print(f"[DEBUG CLIENT RECV] encrypted={encrypted_msg[:120]}")
            decrypted = xor_decrypt(encrypted_msg, xor_key)
            payload = json.loads(decrypted)
            print(f"[DEBUG CLIENT DECRYPT] payload={payload}")
            if payload.get('type') == 'msg':
                print(f"\n[{payload.get('from')}]: {payload.get('text')}")
            elif payload.get('type') == 'users':
                print(f"\n[Users]: {', '.join(payload.get('users', []))}")
            else:
                print("\n[Info]:", payload)
        except Exception as e:
            print("[!] Receive error:", e)
            break


def send():
    while True:
        try:
            message = input("You: ")
            payload = {"type": "msg", "text": message}
            enc = xor_encrypt(json.dumps(payload, ensure_ascii=False), xor_key)
            hash_val = hashlib.sha256(enc.encode()).hexdigest()
            print(f"[DEBUG CLIENT SEND] enc={enc[:120]} hash={hash_val}")
            client.send((enc + "||" + hash_val).encode())
        except Exception as e:
            print("[!] Send error:", e)
            break


threading.Thread(target=receive, daemon=True).start()
threading.Thread(target=send, daemon=True).start()
