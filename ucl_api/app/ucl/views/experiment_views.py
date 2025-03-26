from ucl.views.common import handle_validation_error, validate_uuid
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Experiment, Option, MediaExperiment
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
            experiment_id = request.data.get("id")
            cleaned_data = {
                "name": request.data.get("name"),
                "data_file": request.data.get("data_file"),
                "laboratory": request.data.get("laboratory"),
            }

            validate_uuid(experiment_id, Experiment)

            # Create experiment
            serializer = self.get_serializer(data=cleaned_data, partial=True)
            serializer.is_valid(raise_exception=True)
            experiment = serializer.save(id=experiment_id)

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

            # Handle experiment media
            while True:
                name = request.data.get(f"experiment_media[{index}][name]", None)
                media_file = request.FILES.get(
                    f"experiment_media[{index}][media]", None
                )
                youtube_video = request.data.get(
                    f"experiment_media[{index}][youtube_video]", None
                )

                if not name and not (media_file or youtube_video):
                    index = 0
                    break

                # Create media experiment
                media_experiment_instance = MediaExperiment(
                    name=name,
                    media=media_file,
                    youtube_video=youtube_video,
                    experiment=experiment,
                )
                media_experiment_instance.save()
                created_entities.append(media_experiment_instance)

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
            return handle_validation_error(e)

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
