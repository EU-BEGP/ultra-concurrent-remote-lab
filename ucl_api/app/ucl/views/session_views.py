from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Session
from ucl.serializers import SessionSerializer


class ListCreateSessionView(generics.ListCreateAPIView):
    """
    CREATE a session
    """

    serializer_class = SessionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Session.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RetrieveUpdateDestroySessionView(generics.RetrieveUpdateDestroyAPIView):
    """
    RETRIEVE, UPDATE or DESTROY a specific session
    """

    serializer_class = SessionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Session.objects.filter(user=self.request.user)
