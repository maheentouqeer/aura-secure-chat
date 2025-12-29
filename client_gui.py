import socket
import threading
import rsa
import hashlib
import tkinter as tk
from tkinter import scrolledtext, simpledialog
import json
import random
from crypto.xor_cipher import xor_encrypt, xor_decrypt
from crypto.rsa_utils import encrypt_key

HOST = "127.0.0.1"
PORT = 12345

# ---------------- UI ---------------- #
window = tk.Tk()
window.title("Secure Chat Client")
window.geometry("800x520")
window.resizable(False, False)

title = tk.Label(window, text="🔐 Secure Chat Client", font=("Arial", 14, "bold"))
title.pack()

# Chat Box
chat_area = scrolledtext.ScrolledText(window, width=50, height=20)
chat_area.pack(side=tk.LEFT, padx=10, pady=10)
chat_area.config(state='disabled')

# Right frame for log and users
right_frame = tk.Frame(window)
right_frame.pack(side=tk.RIGHT, padx=10, pady=10)

# Log Box
log_area = scrolledtext.ScrolledText(right_frame, width=35, height=10, fg="lime", bg="black")
log_area.pack(pady=(0,10))
log_area.config(state='disabled')

# Users Box
users_label = tk.Label(right_frame, text="Online Users:", font=("Arial", 10, "bold"))
users_label.pack()
users_list = scrolledtext.ScrolledText(right_frame, width=35, height=6)
users_list.pack()
users_list.config(state='disabled')


def log(msg):
    log_area.config(state='normal')
    log_area.insert(tk.END, msg + "\n")
    log_area.yview(tk.END)
    log_area.config(state='disabled')


name = simpledialog.askstring("Username", "Enter your username:")
if not name:
    name = None

XOR_KEY = random.randint(1, 255)
log("[+] Connecting to Secure Server...")

# ---------------- SOCKET CONNECTION & RSA KEY EXCHANGE ---------------- #
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))
server_public_key = rsa.PublicKey.load_pkcs1(client.recv(1024))
log("[+] RSA Public Key Received from Server")

encrypted_xor = encrypt_key(str(XOR_KEY), server_public_key)
client.send(encrypted_xor)
log("[+] XOR Key Encrypted using RSA and Sent Securely")

# Send join message
join = {"type": "join", "name": name}
enc_join = xor_encrypt(json.dumps(join, ensure_ascii=False), XOR_KEY)
hash_join = hashlib.sha256(enc_join.encode()).hexdigest()
client.send((enc_join + "||" + hash_join).encode())
log("[+] Join packet sent")

# ---------------- RECEIVE MESSAGES ---------------- #
def receive():
    while True:
        try:
            msg = client.recv(4096).decode()
            encrypted_msg, _ = msg.split("||")
            log(f"[DEBUG RECV] encrypted={encrypted_msg[:120]}")
            decrypted = xor_decrypt(encrypted_msg, XOR_KEY)
            payload = json.loads(decrypted)
            log(f"[DEBUG DECRYPT] payload={payload}")

            if payload.get('type') == 'msg':
                frm = payload.get('from')
                text = payload.get('text')
                chat_area.config(state='normal')
                chat_area.insert(tk.END, f"{frm}: {text}\n")
                chat_area.config(state='disabled')
            elif payload.get('type') == 'users':
                users = payload.get('users', [])
                users_list.config(state='normal')
                users_list.delete('1.0', tk.END)
                users_list.insert(tk.END, "\n".join(users))
                users_list.config(state='disabled')
                log("[+] User list updated")
            else:
                log(f"[INFO] {payload}")

        except Exception as e:
            log("[!] Connection Lost: " + str(e))
            break

# ---------------- SEND MESSAGES ---------------- #
msg_entry = tk.Entry(window, width=40, font=("Arial", 12))
msg_entry.pack(pady=10)


def send_message():
    message = msg_entry.get()
    if not message:
        return
    msg_entry.delete(0, tk.END)

    payload = {"type": "msg", "text": message}
    enc = xor_encrypt(json.dumps(payload, ensure_ascii=False), XOR_KEY)
    hash_val = hashlib.sha256(enc.encode()).hexdigest()
    log(f"[DEBUG SEND] enc={enc[:120]} hash={hash_val}")
    client.send((enc + "||" + hash_val).encode())

    chat_area.config(state='normal')
    chat_area.insert(tk.END, "You: " + message + "\n")
    chat_area.config(state='disabled')

send_btn = tk.Button(window, text="Send", width=20, command=send_message)
send_btn.pack()

threading.Thread(target=receive, daemon=True).start()

log("[+] Secure Communication Channel Established")

# Graceful close

def on_close():
    try:
        payload = {"type": "leave"}
        enc = xor_encrypt(json.dumps(payload, ensure_ascii=False), XOR_KEY)
        hash_val = hashlib.sha256(enc.encode()).hexdigest()
        client.send((enc + "||" + hash_val).encode())
    except Exception:
        pass
    try:
        client.close()
    except Exception:
        pass
    window.destroy()

window.protocol("WM_DELETE_WINDOW", on_close)
window.mainloop()
