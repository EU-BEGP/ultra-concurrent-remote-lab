from rest_framework import status
from rest_framework.exceptions import ValidationError, ErrorDetail
from rest_framework.response import Response
import uuid


def validate_uuid(id, model):
    """
    Validate the UUID for a given model.
    """

    if not id:
        raise ValidationError(
            {
                "error": [
                    ErrorDetail(
                        string=f"{model.__name__} UUID must be provided.",
                        code="invalid",
                    )
                ]
            }
        )

    try:
        uuid_obj = uuid.UUID(id)
    except ValueError:
        raise ValidationError(
            {
                "error": [
                    ErrorDetail(
                        string=f"Invalid UUID format for {model.__name__}.",
                        code="invalid",
                    )
                ]
            }
        )

    if model.objects.filter(id=uuid_obj).exists():
        raise ValidationError(
            {
                "error": [
                    ErrorDetail(
                        string=f"This {model.__name__} UUID already exists, use another one.",
                        code="invalid",
                    )
                ]
            }
        )


def handle_validation_error(e):
    """
    Handle the validation error messages to return a proper response
    """

    error_messages = {}

    for field, errors in e.detail.items():
        error_messages[field] = [str(error) for error in errors]

    return Response(error_messages, status=status.HTTP_400_BAD_REQUEST)
