from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Laboratory
from ucl.serializers import LaboratorySerializer
from ucl.permissions import IsInstructor


## LIST | CREATE Laboratory
class LaboratoryListCreateView(generics.ListCreateAPIView):
    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratories = Laboratory.objects.filter(instructor=laboratory_instructor)
        return laboratories


## Retrieve, Update or Destroy Specific Laboratory
class LaboratoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratories = Laboratory.objects.filter(instructor=laboratory_instructor)
        return laboratories
