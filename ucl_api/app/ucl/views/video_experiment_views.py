from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import VideoExperiment
from ucl.permissions import IsInstructor
from ucl.serializers import VideoExperimentSerializer


## Retrieve, Update or Destroy a specific VideoExperiment
class RetrieveUpdateDestroyVideoExperimentView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        video_experiments = VideoExperiment.objects.filter(
            experiment__laboratory__instructor=instructor
        )
        return video_experiments
