from rest_framework.response import Response


def ok(data=None, status=200, meta=None):
    body = {"success": True, "data": data}
    if meta is not None:
        body["meta"] = meta
    return Response(body, status=status)


def err(message, code="error", status=400, details=None):
    payload = {"success": False, "error": {"code": code, "message": message}}
    if details is not None:
        payload["error"]["details"] = details
    return Response(payload, status=status)
