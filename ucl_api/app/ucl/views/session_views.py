from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Session
from ucl.serializers import SessionSerializer


# Create a Session
class ListCreateSessionView(generics.ListCreateAPIView):
    serializer_class = SessionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Session.objects.filter(student=self.request.user)

    def create(self, request, *args, **kwargs):
        student = request.user
        data = request.data

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


## Retrieve, Update or Destroy a specific session
class RetrieveUpdateDestroySessionView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SessionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Session.objects.filter(student=self.request.user)
