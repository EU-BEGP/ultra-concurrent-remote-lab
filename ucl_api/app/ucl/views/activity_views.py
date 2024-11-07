from django.db.models import Q
from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Activity
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import ActivitySerializer


class CreateActivityView(generics.CreateAPIView):
    """
    CREATE an activity
    """

    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )


class RetrieveUpdateDestroyActivityView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific activity
    """

    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Activity.objects.all()
