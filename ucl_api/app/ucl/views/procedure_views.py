from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Procedure
from ucl.serializers import ProcedureSerializer


## Retrieve, Update or Destroy a specific procedure
class RetrieveUpdateDestroyProcedureView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProcedureSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Procedure.objects.filter(
            solved_activity__session__student=self.request.user
        )
