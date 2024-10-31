from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Experiment
from ucl.serializers import ExperimentSerializer
from ucl.permissions import IsInstructor
import uuid


## Create Experiment
class ExperimentListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)


## Retrieve, Update or Destroy Specific Experiment
class ExperimentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        experiments = Experiment.objects.filter(laboratory__instructor=instructor)
        return experiments


# Retrieve experiment based on the combination of parameter values
class ExperimentRetrieveByParameterValuesIdsView(generics.RetrieveAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor_id = self.request.user.id
        return Experiment.objects.filter(laboratory__instructor=instructor_id)

    def get_object(self):
        experiments = self.get_queryset()
        ids = self.request.query_params.getlist("id")

        if not ids:
            raise ValueError("No parameter value IDs provided.")

        id_set = {uuid.UUID(id) for id in ids}
        filtered_experiment = None

        for experiment in experiments:
            experiment_ids = set(
                experiment.parameter_values.values_list("id", flat=True)
            )
            if experiment_ids == id_set:
                filtered_experiment = experiment
                break

        if filtered_experiment is None:
            raise ValueError(
                "No experiments found for the provided parameter value IDs."
            )

        return filtered_experiment

    def get(self, request, *args, **kwargs):
        try:
            experiment = self.get_object()
            serializer = self.get_serializer(experiment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
