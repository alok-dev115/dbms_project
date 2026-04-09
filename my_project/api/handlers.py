from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return response
    original = response.data
    if isinstance(original, dict) and original.get("success") is True:
        return response
    if not isinstance(original, dict):
        response.data = {
            "success": False,
            "error": {
                "code": getattr(exc, "default_code", "error"),
                "message": str(exc),
                "details": original,
            },
        }
        return response
    detail = getattr(exc, "detail", None)
    if detail is None:
        message = str(exc)
    else:
        message = detail if isinstance(detail, str) else str(detail)
    response.data = {
        "success": False,
        "error": {
            "code": getattr(exc, "default_code", "error"),
            "message": message,
            "details": original,
        },
    }
    return response
