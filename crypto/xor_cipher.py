import base64


def xor_encrypt(message: str, key: int) -> str:
    """XOR-encrypt a UTF-8 string and return a base64 ASCII string."""
    data = message.encode("utf-8")
    xored = bytes([b ^ key for b in data])
    return base64.b64encode(xored).decode("ascii")


def xor_decrypt(b64_message: str, key: int) -> str:
    """Decode base64, XOR-decrypt and return a UTF-8 string."""
    xored = base64.b64decode(b64_message.encode("ascii"))
    data = bytes([b ^ key for b in xored])
    return data.decode("utf-8")


# Compatibility wrapper for older callers
def xor_encrypt_decrypt(message: str, key: int) -> str:
    """If input looks like base64, decrypt, otherwise encrypt."""
    try:
        # If message is valid base64, treat as encrypted data and decrypt
        base64.b64decode(message.encode('ascii'), validate=True)
        return xor_decrypt(message, key)
    except Exception:
        return xor_encrypt(message, key)
