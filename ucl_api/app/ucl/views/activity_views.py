from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Procedure
from ucl.permissions import ApplicationPermissionManager
from ucl.serializers import ActivitySerializer
import json


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

    def create(self, request, *args, **kwargs):
        created_entities = []
        try:
            cleaned_data = {
                "statement": request.data.get("statement"),
                "expected_result": request.data.get("expected_result"),
                "result_unit": request.data.get("result_unit"),
                "experiment": request.data.get("experiment"),
                "laboratory": request.data.get("laboratory"),
                "is_procedure_mandatory": request.data.get("is_procedure_mandatory", False),
            }

            # 🔥 Parse possible_answers si llega en la request
            possible_answers = request.data.get("possible_answers")

            if possible_answers:
                try:
                    parsed_answers = json.loads(possible_answers)
                    cleaned_data["possible_answers"] = parsed_answers
                except Exception as e:
                    # fallback: guarda el string directo (por si acaso)
                    cleaned_data["possible_answers"] = possible_answers

            # Create activity
            serializer = self.get_serializer(data=cleaned_data, partial=True)
            serializer.is_valid(raise_exception=True)
            activity = serializer.save()

            created_entities.append(activity)

            index = 0
            # Handle procedures
            while True:
                proc_data = request.data.get(f"procedures[{index}][data]")
                proc_type = request.data.get(f"procedures[{index}][data_type]")
                proc_headers = request.data.get(
                    f"procedures[{index}][data_headers]")

                if not proc_type or not proc_data:
                    index = 0
                    break

                # Create procedure
                procedure_instance = Procedure(
                    data=proc_data,
                    data_type=proc_type,
                    data_headers=proc_headers,
                    activity=activity,
                )
                procedure_instance.save()
                created_entities.append(procedure_instance)

                index += 1

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            for entity in created_entities:
                entity.delete()

            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
