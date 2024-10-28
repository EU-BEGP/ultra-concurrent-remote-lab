from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Experiment
from ucl.serializers import ExperimentSerializer
from ucl.permissions import IsInstructor


## LIST | CREATE Experiment
class ExperimentListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        experiments = Experiment.objects.filter(laboratory__instructor=instructor)
        return experiments

    # TODO: Override create method to only create experiments if the owner of the
    # selected laboratory is the user making the request

    # TODO: Include the use of eav properties and methods to create dynamic
    # parameters for the experiment


## Retrieve, Update or Destroy Specific Experiment
class ExperimentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        experiments = Experiment.objects.filter(laboratory__instructor=instructor)
        return experiments

    # TODO: Include the use of eav properties and methods to update dynamic
    # parameters of the experiment
