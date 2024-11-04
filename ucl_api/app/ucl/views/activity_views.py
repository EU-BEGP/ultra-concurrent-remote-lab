from django.db.models import Q
from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Activity
from ucl.permissions import IsInstructor
from ucl.serializers import ActivitySerializer


# Create a Activity
class CreateActivityView(generics.CreateAPIView):
    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)


## Retrieve, Update or Destroy a specific activities
class RetrieveUpdateDestroyActivityView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id

        activities = Activity.objects.filter(
            Q(laboratory__instructor=instructor)
            | Q(experiment__laboratory__instructor=instructor)
        )
        return activities
