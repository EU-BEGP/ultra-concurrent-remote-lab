from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Option, Parameter
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import ParameterSerializer
from ucl.views.common import validate_uuid


class CreateParameterView(generics.CreateAPIView):
    """
    CREATE a parameter
    """

    serializer_class = ParameterSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )

    def create(self, request, *args, **kwargs):
        created_entities = []
        try:
            # Extract the neccesary fields for parameter creation
            cleaned_data = {
                "name": request.data.get("name"),
                "unit": request.data.get("unit"),
                "laboratory": request.data.get("laboratory"),
            }

            # Create parameter
            serializer = self.get_serializer(data=cleaned_data, partial=True)
            serializer.is_valid(raise_exception=True)
            parameter = serializer.save()

            created_entities.append(parameter)

            # Handle parameter options
            index = 0
            while True:
                option_id = request.data.get(f"parameter_options[{index}][id]")
                if not option_id:
                    break  # No more options

                option_value = request.data.get(f"parameter_options[{index}][value]")
                image_file = request.FILES.get(f"parameter_options[{index}][image]")

                # Validate option uuid
                validate_uuid(option_id, Option)

                # Create parameter option
                option_instance = Option(
                    id=option_id,
                    value=option_value,
                    image=image_file,
                    parameter=parameter,
                )
                option_instance.save()

                created_entities.append(option_instance)

                index += 1

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            for entity in created_entities:
                entity.delete()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RetrieveUpdateDestroyParameterView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific parameter
    """

    serializer_class = ParameterSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Parameter.objects.all()
