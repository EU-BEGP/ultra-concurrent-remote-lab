from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Experiment, Option, VideoExperiment
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import ActivitySerializer, ExperimentSerializer
import uuid


class ExperimentCreateView(generics.CreateAPIView):
    """
    CREATE an experiment
    """

    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )

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


class ExperimentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific experiment
    """

    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Experiment.objects.all()


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(
                name="laboratory",
                description="Laboratory Id",
                type=str,
            ),
            OpenApiParameter(
                name="id",
                description="List of Options Ids",
                type={
                    "type": "array",
                    "items": {"type": "string"},
                },
                explode=True,
            ),
        ]
    )
)
class ExperimentRetrieveByOptionIdsView(generics.RetrieveAPIView):
    """
    RETRIEVE an experiment based on the combination of options ids
    """

    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Experiment.objects.all()

    def get_object(self):
        ids = self.request.query_params.getlist("id")
        laboratory = self.request.query_params.get("laboratory")

        if not laboratory:
            raise ValidationError("Provide laboratory ID.")

        if not ids:
            raise ValidationError("No option IDs provided.")

        try:
            id_set = {uuid.UUID(id) for id in ids}
        except ValueError:
            raise ValidationError("One or more provided option IDs are invalid.")

        experiments = Experiment.objects.filter(laboratory=laboratory)
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
        except ValidationError as e:
            return Response(
                {"error": str(e.detail[0])}, status=status.HTTP_400_BAD_REQUEST
            )
        except (Exception, NotFound) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ListExperimentActivitiesView(generics.ListAPIView):
    """
    LIST all the existing activities from a experiment
    """

    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )

    def get_queryset(self):
        experiment_id = self.kwargs.get("pk")
        experiment = get_object_or_404(Experiment, id=experiment_id)
        activities = Activity.objects.filter(experiment=experiment)

        return activities.select_related("experiment__laboratory")
