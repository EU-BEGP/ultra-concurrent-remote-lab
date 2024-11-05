from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Experiment, Option, VideoExperiment
from ucl.permissions import IsInstructor
from ucl.serializers import ActivitySerializer, ExperimentSerializer
import uuid


## Create Experiment
class ExperimentCreateView(generics.CreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def create(self, request, *args, **kwargs):
        created_entities = []
        try:
            cleaned_data = {
                "name": request.data.get("name"),
                "data_file": request.data.get("data_file"),
                "laboratory": request.data.get("laboratory"),
            }
            # Create experiment
            serializer = self.get_serializer(data=cleaned_data, partial=True)
            serializer.is_valid(raise_exception=True)
            experiment = serializer.save()

            created_entities.append(experiment)

            index = 0
            # Handle parameter options
            while True:
                parameter_id = request.data.get(f"parameter_options[{index}]")

                if not parameter_id:
                    index = 0
                    break

                try:
                    parameter_option = Option.objects.get(id=parameter_id)
                except Option.DoesNotExist:
                    return Response(
                        {"error": "Option not found."}, status=status.HTTP_404_NOT_FOUND
                    )

                # Add parameter options
                experiment.parameter_options.add(parameter_option)

                index += 1

            # Handle experiments
            while True:
                video_name = request.data.get(f"experiment_videos[{index}][name]")
                video_file = request.FILES.get(f"experiment_videos[{index}][video]")

                if not video_name or not video_file:
                    index = 0
                    break

                # Create video
                video_experiment_instance = VideoExperiment(
                    name=video_name,
                    video=video_file,
                    experiment=experiment,
                )
                video_experiment_instance.save()
                created_entities.append(video_experiment_instance)

                index += 1

            # Handle activities
            while True:
                activity_statement = request.data.get(
                    f"experiment_activities[{index}][statement]"
                )
                activity_expected_result = request.data.get(
                    f"experiment_activities[{index}][expected_result]"
                )
                activity_unit = request.data.get(
                    f"experiment_activities[{index}][unit]"
                )

                if not activity_statement:
                    index = 0
                    break

                # Create activity
                activity_instance = Activity(
                    statement=activity_statement,
                    expected_result=activity_expected_result,
                    unit=activity_unit,
                    experiment=experiment,
                )
                activity_instance.save()
                created_entities.append(activity_instance)

                index += 1

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            for entity in created_entities:
                entity.delete()

            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


## Retrieve, Update or Destroy Specific Experiment
class ExperimentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        return (
            Experiment.objects.filter(laboratory__instructor=instructor)
            .select_related("laboratory")
            .prefetch_related("experiment_videos", "experiment_activities")
        )


# Retrieve experiment based on the combination of options ids
class ExperimentRetrieveByOptionIdsView(generics.RetrieveAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor_id = self.request.user.id
        return Experiment.objects.filter(laboratory__instructor=instructor_id)

    def get_object(self):
        ids = self.request.query_params.getlist("id")
        if not ids:
            raise ValidationError("No option IDs provided.")

        try:
            id_set = {uuid.UUID(id) for id in ids}
        except ValueError:
            raise ValidationError("One or more provided option IDs are invalid.")

        experiments = self.get_queryset()
        matching_experiment = None

        for experiment in experiments:
            experiment_ids = set(
                experiment.parameter_options.values_list("id", flat=True)
            )
            if experiment_ids == id_set:
                matching_experiment = experiment
                break

        if matching_experiment is None:
            raise NotFound("No experiments found for the provided option IDs.")

        return matching_experiment

    def get(self, request, *args, **kwargs):
        try:
            experiment = self.get_object()
            serializer = self.get_serializer(experiment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except (ValidationError, NotFound) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# List all activities that belongs to an experiment
class ListExperimentActivitiesView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        laboratory_instructor = self.request.user.id
        experiment_id = self.kwargs.get("pk")

        experiment = get_object_or_404(
            Experiment, id=experiment_id, laboratory__instructor=laboratory_instructor
        )
        activities = Activity.objects.filter(experiment=experiment)

        return activities.select_related("experiment__laboratory")
