from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Option
from ucl.permissions import IsInstructor
from ucl.serializers import OptionSerializer


## Retrieve, Update or Destroy a specific Option
class RetrieveUpdateDestroyOptionView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OptionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        options = Option.objects.filter(parameter__laboratory__instructor=instructor)
        return options
