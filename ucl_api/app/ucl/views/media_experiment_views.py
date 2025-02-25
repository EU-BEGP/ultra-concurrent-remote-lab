from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import MediaExperiment
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import MediaExperimentSerializer


class RetrieveUpdateDestroyMediaExperimentView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific media experiment
    """

    serializer_class = MediaExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = MediaExperiment.objects.all()
