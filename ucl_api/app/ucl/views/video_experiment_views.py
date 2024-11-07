from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import VideoExperiment
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import VideoExperimentSerializer


class RetrieveUpdateDestroyVideoExperimentView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific video experiment
    """

    serializer_class = VideoExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = VideoExperiment.objects.all()
