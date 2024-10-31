from typing_extensions import ReadOnly
from rest_framework import serializers
from ucl.models import (
    Activity,
    Laboratory,
    Guide,
    Parameter,
    ParameterValue,
    Experiment,
    Procedure,
    Session,
    SolvedActivity,
    VideoExperiment,
)
from ucl.views.common import validate_uuid


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


class ParameterValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParameterValue
        fields = ["id", "value", "image"]


class ParameterSerializer(serializers.ModelSerializer):
    parameter_values = ParameterValueSerializer(many=True)

    class Meta:
        model = Parameter
        fields = ["id", "laboratory", "name", "unit", "parameter_values"]


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ("id", "name", "description", "laboratory", "parameter_values")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["parameter_values"] = [
            ParameterValueSerializer(param_value).data
            for param_value in instance.parameter_values.all()
        ]
        return representation


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
