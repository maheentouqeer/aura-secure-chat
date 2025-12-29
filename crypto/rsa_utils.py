import rsa

def generate_keys():
    public_key, private_key = rsa.newkeys(2048)
    return public_key, private_key

def encrypt_key(key, public_key):
    return rsa.encrypt(key.encode(), public_key)

def decrypt_key(enc_key, private_key):
    return rsa.decrypt(enc_key, private_key).decode()
