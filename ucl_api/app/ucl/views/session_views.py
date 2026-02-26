# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucl.models import Activity, Session, SolvedActivity
from ucl.serializers import SessionSerializer, SolvedActivitySerializer
from ucl.views.common import validate_uuid


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
        session_id = request.data.get("id")

        # Validate session uuid
        validate_uuid(session_id, Session)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(id=session_id, user=user)

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


class ListSessionSolvedActivitiesView(generics.ListAPIView):
    """
    LIST all the existing solved activities from a session
    """

    serializer_class = SolvedActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        session_id = self.kwargs.get("pk")
        session = get_object_or_404(Session, id=session_id)
        solved_activities = SolvedActivity.objects.filter(session=session)

        return solved_activities


class ListSessionActivitySolvedActivitiesView(generics.ListAPIView):
    """
    LIST all the existing solved activities from a session and from an activity
    """

    serializer_class = SolvedActivitySerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        session_id = self.kwargs.get("session_pk")
        activity_id = self.kwargs.get("activity_pk")
        session = get_object_or_404(Session, id=session_id)
        activity = get_object_or_404(Activity, id=activity_id)
        solved_activities = SolvedActivity.objects.filter(
            session=session, activity=activity
        )

        return solved_activities
