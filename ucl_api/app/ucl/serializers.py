from rest_framework import serializers
from ucl.models import (
    Activity,
    Laboratory,
    Guide,
    Experiment,
    Procedure,
    Session,
    SolvedActivity,
    VideoExperiment,
)
from eav.models import Value


class LaboratorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Laboratory
        fields = [
            "id",
            "name",
            "description",
            "category",
            "institution",
            "instructor",
            "image",
            "video",
        ]


class GuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide
        fields = ["id", "title", "url", "file", "laboratory"]


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ("id", "name", "description", "laboratory")

    # TODO: Add attributes and value (eav) information in serializer fields


class VideoExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoExperiment
        fields = ["id", "name", "video", "experiment"]


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ["id", "student", "laboratory", "registration_date"]


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["id", "statement", "expected_result", "experiment", "laboratory"]


class SolvedActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SolvedActivity
        fields = ["id", "result", "activity", "experiment", "laboratory", "session"]


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = ["id", "name", "type", "data", "activity", "solved_activity"]
