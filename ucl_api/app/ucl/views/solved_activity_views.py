from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Procedure, SolvedActivity
from ucl.serializers import SolvedActivitySerializer


class ListCreateSolvedActivityView(generics.ListCreateAPIView):
    """
    CREATE a solved activity
    """

    serializer_class = SolvedActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return SolvedActivity.objects.filter(session__user=self.request.user)

    def create(self, request, *args, **kwargs):
        created_entities = []
        try:
            cleaned_data = {
                "result": request.data.get("result"),
                "activity": request.data.get("activity"),
                "session": request.data.get("session"),
            }
            # Create solved activity
            serializer = self.get_serializer(data=cleaned_data, partial=True)
            serializer.is_valid(raise_exception=True)
            solved_activity = serializer.save()

            created_entities.append(solved_activity)

            index = 0
            # Handle procedures
            while True:
                proc_name = request.data.get(f"procedures[{index}][name]")
                proc_type = request.data.get(f"procedures[{index}][data_type]")
                proc_data = request.FILES.get(f"procedures[{index}][data]")

                if not proc_name or not proc_type or not proc_data:
                    index = 0
                    break

                # Create procedure
                procedure_instance = Procedure(
                    name=proc_name,
                    data_type=proc_type,
                    data=proc_data,
                    solved_activity=solved_activity,
                )
                procedure_instance.save()
                created_entities.append(procedure_instance)

                index += 1

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            for entity in created_entities:
                entity.delete()

            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RetrieveUpdateDestroySolvedActivityView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific solved activity
    """

    serializer_class = SolvedActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return SolvedActivity.objects.filter(session__user=self.request.user)
