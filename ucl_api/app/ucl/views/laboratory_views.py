from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from ucl.models import Experiment, Laboratory, Guide, Parameter
from ucl.permissions import IsInstructor
from ucl.serializers import (
    ExperimentSerializer,
    GuideSerializer,
    LaboratorySerializer,
    ParameterSerializer,
)
from ucl.views.common import validate_uuid


# List all laboratories
class ListAllLaboratoryView(generics.ListAPIView):
    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Laboratory.objects.all()


# List all laboratories made by an instructor | Create a Laboratory
class ListCreateLaboratoryView(generics.ListCreateAPIView):
    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratories = Laboratory.objects.filter(instructor=laboratory_instructor)
        return laboratories

    def perform_create(self, serializer):
        try:
            laboratory_id = self.request.data.get("id")
            validate_uuid(laboratory_id, Laboratory)
            serializer.save(id=laboratory_id)
        except ValidationError as e:
            # Extract and format the error details
            error_details = {
                field: [str(error) for error in errors]
                for field, errors in e.detail.items()
            }
            return Response(
                {"error": error_details}, status=status.HTTP_400_BAD_REQUEST
            )


# Retrieve, Update or Destroy a specific laboratory
class RetrieveUpdateDestroyLaboratoryView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratories = Laboratory.objects.filter(instructor=laboratory_instructor)
        return laboratories


# List all guides that belongs to a laboratory
class ListLaboratoryGuidesView(generics.ListAPIView):
    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratory_id = self.kwargs.get("pk")
        guides = Guide.objects.filter(
            laboratory__instructor=laboratory_instructor, laboratory=laboratory_id
        )
        return guides


# List all parameters that belongs to a laboratory
class ListLaboratoryParametersView(generics.ListAPIView):
    serializer_class = ParameterSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratory_id = self.kwargs.get("pk")
        parameters = Parameter.objects.filter(
            laboratory__instructor=laboratory_instructor, laboratory=laboratory_id
        )
        return parameters


# List all experiments that belongs to a laboratory
class ListLaboratoryExperimentsView(generics.ListAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        laboratory_id = self.kwargs.get("pk")
        experiments = Experiment.objects.filter(
            laboratory__instructor=laboratory_instructor, laboratory=laboratory_id
        )
        return experiments
