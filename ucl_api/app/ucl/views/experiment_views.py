from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Experiment, VideoExperiment
from ucl.serializers import ActivitySerializer, ExperimentSerializer
from ucl.permissions import IsInstructor
import uuid


## Create Experiment
class ExperimentListCreateView(generics.CreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def create(self, request, *args, **kwargs):
        created_entities = []
        cleaned_data = {
            "name": request.data.get("name"),
            "data_file": request.data.get("data_file"),
            "laboratory": request.data.get("laboratory"),
            "parameter_options": request.data.getlist("parameter_options"),
        }
        # Create experiment
        serializer = self.get_serializer(data=cleaned_data, partial=True)
        serializer.is_valid(raise_exception=True)
        experiment = serializer.save()

        created_entities.append(experiment)

        # Handle video experiments
        index = 0
        while True:
            video_name = request.data.get(f"experiment_videos[{index}][name]")
            video_file = request.FILES.get(f"experiment_videos[{index}][video]")

            if not video_name or not video_file:
                break

            # Create experiment option
            video_experiment_instance = VideoExperiment(
                name=video_name,
                video=video_file,
                experiment=experiment,
            )
            video_experiment_instance.save()

            created_entities.append(video_experiment_instance)

            index += 1

        return Response(serializer.data, status=status.HTTP_201_CREATED)


## Retrieve, Update or Destroy Specific Experiment
class ExperimentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        experiments = Experiment.objects.filter(laboratory__instructor=instructor)
        return experiments


# Retrieve experiment based on the combination of options ids
class ExperimentRetrieveByOptionIdsView(generics.RetrieveAPIView):
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
            raise ValueError("No option IDs provided.")

        id_set = {uuid.UUID(id) for id in ids}
        filtered_experiment = None

        for experiment in experiments:
            experiment_ids = set(
                experiment.parameter_options.values_list("id", flat=True)
            )
            if experiment_ids == id_set:
                filtered_experiment = experiment
                break

        if filtered_experiment is None:
            raise ValueError("No experiments found for the provided option IDs.")

        return filtered_experiment

    def get(self, request, *args, **kwargs):
        try:
            experiment = self.get_object()
            serializer = self.get_serializer(experiment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# List all activities that belongs to an experiment
class ListExperimentActivitiesView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        experiment_id = self.kwargs.get("pk")
        activities = Activity.objects.filter(
            experiment__laboratory__instructor=laboratory_instructor,
            experiment=experiment_id,
        )
        return activities
