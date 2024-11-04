from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Option, Parameter
from ucl.permissions import IsInstructor
from ucl.serializers import ParameterSerializer
from ucl.views.common import validate_uuid


# Create a Parameter
class CreateParameterView(generics.CreateAPIView):
    serializer_class = ParameterSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def create(self, request, *args, **kwargs):
        created_entities = []
        try:
            # Validate and save Parameter instance
            options = self.request.data.pop("parameter_options", [])

            serializer = self.get_serializer(data=self.request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            parameter = serializer.save()

            created_entities.append(parameter)

            for option in options:
                option_id = option.get("id")
                validate_uuid(option_id, Option)
                option = Option.objects.create(parameter=parameter, **option)

                created_entities.append(option)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            for entity in created_entities:
                entity.delete()

            return Response(
                {"error": str(e.detail[0])}, status=status.HTTP_400_BAD_REQUEST
            )


## Retrieve, Update or Destroy a specific parameter
class RetrieveUpdateDestroyParameterView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ParameterSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        parameters = Parameter.objects.filter(laboratory__instructor=instructor)
        return parameters
