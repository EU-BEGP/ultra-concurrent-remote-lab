from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import ParameterValue
from ucl.permissions import IsInstructor
from ucl.serializers import ParameterValueSerializer


## Retrieve, Update or Destroy a specific ParameterValue
class RetrieveUpdateDestroyParameterValueView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ParameterValueSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        parameters = ParameterValue.objects.filter(
            parameter_value__instructor=instructor
        )
        return parameters
