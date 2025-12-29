# Simulates message tampering
def tamper_message(packet):
    encrypted, hash_val = packet.split("||")
    tampered = encrypted[:-1] + "X"
    return tampered + "||" + hash_val

print("[!] Attacker modified the message (simulation)")
