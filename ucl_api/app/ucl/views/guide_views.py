from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Guide
from ucl.serializers import GuideSerializer
from ucl.permissions import IsInstructor


## LIST | CREATE Guide
class GuideListCreateView(generics.ListCreateAPIView):
    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        guides = Guide.objects.filter(laboratory__instructor=instructor)
        return guides

    # TODO: Override create method to only create guides if the owner of the
    # selected laboratory is the user making the request


## Retrieve, Update or Destroy Specific Guide
class GuideDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        guides = Guide.objects.filter(laboratory__instructor=instructor)
        return guides
