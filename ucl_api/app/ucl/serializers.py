from rest_framework import serializers
from ucl.models import (
    Activity,
    Laboratory,
    Guide,
    Parameter,
    Option,
    Experiment,
    Procedure,
    Session,
    SolvedActivity,
    VideoExperiment,
)


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


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "value", "image"]


class ParameterSerializer(serializers.ModelSerializer):
    parameter_options = OptionSerializer(many=True)

    class Meta:
        model = Parameter
        fields = ["id", "laboratory", "name", "unit", "parameter_options"]


class VideoExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoExperiment
        fields = ["id", "name", "video", "experiment"]


class ExperimentSerializer(serializers.ModelSerializer):
    experiment_videos = VideoExperimentSerializer(many=True)

    class Meta:
        model = Experiment
        fields = (
            "id",
            "name",
            "laboratory",
            "parameter_options",
            "experiment_videos",
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["parameter_options"] = [
            OptionSerializer(option).data for option in instance.parameter_options.all()
        ]
        return representation


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
