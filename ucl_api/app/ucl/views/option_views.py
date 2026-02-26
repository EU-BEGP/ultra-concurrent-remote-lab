# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Option
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import OptionSerializer


class RetrieveUpdateDestroyOptionView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific option
    """

    serializer_class = OptionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (
        IsAuthenticated,
        ApplicationPermissionManager,
    )
    queryset = Option.objects.all()
