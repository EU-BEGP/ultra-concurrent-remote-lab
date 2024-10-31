from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ucl.models import Guide
from ucl.permissions import IsInstructor
from ucl.serializers import GuideSerializer


# Create a Guide
class CreateGuideView(generics.CreateAPIView):
    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)


## Retrieve, Update or Destroy a specific guide
class RetrieveUpdateDestroyGuideView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GuideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_queryset(self):
        instructor = self.request.user.id
        guides = Guide.objects.filter(laboratory__instructor=instructor)
        return guides
