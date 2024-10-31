from rest_framework.exceptions import ValidationError
import uuid


def validate_uuid(laboratory_id, model):
    """Validate the UUID for a given model."""

    if not laboratory_id:
        raise ValidationError(f"{model.__name__} UUID must be provided.")

    try:
        uuid_obj = uuid.UUID(laboratory_id)
    except ValueError:
        raise ValidationError(f"Invalid UUID format for {model.__name__}.")

    if model.objects.filter(id=uuid_obj).exists():
        raise ValidationError(
            f"This {model.__name__} UUID already exists, use another one."
        )
