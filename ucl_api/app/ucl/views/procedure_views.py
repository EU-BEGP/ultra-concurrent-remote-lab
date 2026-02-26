# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Procedure
from ucl.serializers import ProcedureSerializer


class RetrieveUpdateDestroyProcedureView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific procedure
    """

    serializer_class = ProcedureSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Procedure.objects.filter(
            solved_activity__session__user=self.request.user
        )
