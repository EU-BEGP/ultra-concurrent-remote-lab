# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Guide
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import GuideSerializer


class CreateGuideView(generics.CreateAPIView):
    """
    CREATE a guide
    """

    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )


class RetrieveUpdateDestroyGuideView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific guide
    """

    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Guide.objects.all()
