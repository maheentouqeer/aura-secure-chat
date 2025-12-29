import socket
import threading
import rsa
import hashlib
import json
import signal
import sys
from crypto.xor_cipher import xor_encrypt, xor_decrypt
from crypto.rsa_utils import generate_keys, decrypt_key

HOST = "127.0.0.1"
PORT = 12345

public_key, private_key = generate_keys()
clients = []  # list of dicts: {conn, addr, name, key}
lock = threading.Lock()


def send_encrypted(conn, payload: dict, key: int):
    """Encrypt JSON payload and send with integrity hash."""
    payload_json = json.dumps(payload, ensure_ascii=False)
    encrypted = xor_encrypt(payload_json, key)
    hash_val = hashlib.sha256(encrypted.encode()).hexdigest()
    packet = encrypted + "||" + hash_val
    # Debug: show truncated values to avoid huge logs
    try:
        peer = conn.getpeername()
    except Exception:
        peer = ("unknown", 0)
    print(f"[DEBUG SEND_ENCRYPTED] to={peer} payload={payload} encrypted={encrypted[:120]} hash={hash_val}")
    conn.send(packet.encode())


def broadcast_user_list():
    with lock:
        names = [c.get('name') for c in clients if c.get('name')]
    payload = {"type": "users", "users": names}
    with lock:
        for client in clients:
            try:
                send_encrypted(client['conn'], payload, client['key'])
            except Exception as e:
                print("[!] Failed to send user list to a client:", e)


def handle_client(conn, addr):
    print(f"[+] Connected: {addr}")

    try:
        # Send public key
        conn.send(public_key.save_pkcs1())

        # Receive encrypted XOR key
        encrypted_xor = conn.recv(1024)
        xor_key = int(decrypt_key(encrypted_xor, private_key))
        print("[+] XOR key securely received from", addr)

        # Expect a join payload containing the username
        data = conn.recv(4096).decode()
        encrypted_msg, received_hash = data.split("||")
        calc_hash = hashlib.sha256(encrypted_msg.encode()).hexdigest()
        if calc_hash != received_hash:
            print("[!] Join message integrity failed from", addr)
            conn.close()
            return

        join_json = xor_decrypt(encrypted_msg, xor_key)
        join = json.loads(join_json)
        name = join.get('name') or f"{addr[0]}:{addr[1]}"

        client_info = {'conn': conn, 'addr': addr, 'name': name, 'key': xor_key}
        with lock:
            clients.append(client_info)

        print(f"[+] {name} has joined the chat")
        broadcast_user_list()

        # Main loop
        while True:
            data = conn.recv(4096).decode()
            if not data:
                break

            try:
                encrypted_msg, received_hash = data.split("||")
            except Exception:
                continue

            # Verify integrity
            calc_hash = hashlib.sha256(encrypted_msg.encode()).hexdigest()
            if calc_hash != received_hash:
                print("[!] Message tampered! Active attack detected from", name)
                continue

            # Decrypt payload
            try:
                payload_json = xor_decrypt(encrypted_msg, xor_key)
                payload = json.loads(payload_json)
            except Exception as e:
                print("[!] Decryption or JSON parse error from", name, e)
                continue

            # Handle message types
            if payload.get('type') == 'msg':
                text = payload.get('text', '')
                print(f"[Message] {name}: {text}")
                # Debug: show encrypted content and intended recipients
                print(f"[DEBUG RECEIVED] from={name} encrypted={encrypted_msg[:120]} hash={received_hash}")
                with lock:
                    recipients = [c['name'] for c in clients if c['conn'] != conn]
                print(f"[DEBUG FORWARD] from={name} text={text} recipients={recipients}")
                # Re-broadcast to other clients, encrypting for each recipient
                with lock:
                    for c in clients:
                        if c['conn'] != conn:
                            try:
                                send_encrypted(c['conn'], {"type":"msg","from":name,"text":text}, c['key'])
                            except Exception as e:
                                print("[!] Failed to forward to", c.get('name'), e)
            elif payload.get('type') == 'leave':
                print(f"[+] {name} requested to leave")
                break
            else:
                print("[!] Unknown payload type from", name, payload)

    except Exception as e:
        print("[!] Client handler error:", e)

    finally:
        # Clean-up
        conn.close()
        with lock:
            for c in list(clients):
                if c['conn'] == conn:
                    name = c.get('name')
                    clients.remove(c)
                    print(f"[-] Disconnected: {name} {addr}")
                    break
        broadcast_user_list()


def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen()
    print("[*] Secure Server started on", HOST, PORT)

    def stop(_signum, _frame):
        print("[*] Shutting down server...")
        server.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, stop)

    while True:
        try:
            conn, addr = server.accept()
            threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
        except Exception as e:
            print("[!] Accept error:", e)


if __name__ == '__main__':
    start_server()
