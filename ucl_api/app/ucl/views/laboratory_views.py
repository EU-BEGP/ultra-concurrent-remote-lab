from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Experiment, Laboratory, Guide, Parameter
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import (
    ActivitySerializer,
    ExperimentSerializer,
    GuideSerializer,
    LaboratorySerializer,
    ParameterSerializer,
)
from ucl.views.common import validate_uuid, handle_validation_error


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(
                name="owned",
                description="Filter owned laboratories",
                type=bool,
            ),
        ]
    )
)
class ListCreateLaboratoryView(generics.ListCreateAPIView):
    """
    LIST all laboratories and CREATE a new laboratory.
    Optionally filter laboratories created by the authenticated user with the 'owned' query parameter.
    """

    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )

    def get_queryset(self):
        queryset = Laboratory.objects.all()

        # Check if 'owned' query parameter is set to 'true'
        owned = self.request.query_params.get("owned", None)
        if owned and owned.lower() == "true":
            user = self.request.user
            queryset = queryset.filter(instructor=user)

        return queryset

    def create(self, request, *args, **kwargs):
        try:
            laboratory_id = self.request.data.get("id")
            validate_uuid(laboratory_id, Laboratory)

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(id=laboratory_id)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return handle_validation_error(e)


class RetrieveUpdateDestroyLaboratoryView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific laboratory
    """

    serializer_class = LaboratorySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Laboratory.objects.all()


class ListLaboratoryGuidesView(generics.ListAPIView):
    """
    LIST all the existing guides from a laboratory
    """

    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        laboratory_id = self.kwargs.get("pk")
        guides = Guide.objects.filter(laboratory=laboratory_id)
        return guides


class ListLaboratoryParametersView(generics.ListAPIView):
    """
    LIST all the existing parameters from a laboratory
    """

    serializer_class = ParameterSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        laboratory_id = self.kwargs.get("pk")
        parameters = Parameter.objects.filter(laboratory=laboratory_id)
        return parameters


# List all experiments that belongs to a laboratory
class ListLaboratoryExperimentsView(generics.ListAPIView):
    """
    LIST all the existing experiments from a laboratory
    """

    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        laboratory_id = self.kwargs.get("pk")
        experiments = Experiment.objects.filter(laboratory=laboratory_id)
        return experiments


class ListLaboratoryActivitiesView(generics.ListAPIView):
    """
    LIST all the existing activities from a laboratory
    """

    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        laboratory_id = self.kwargs.get("pk")
        activities = Activity.objects.filter(laboratory=laboratory_id)
        return activities
