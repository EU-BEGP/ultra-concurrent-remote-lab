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
            "registration_date",
        ]


class GuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide
        fields = ["id", "title", "url", "file", "laboratory", "registration_date"]


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "value", "image"]


class ParameterSerializer(serializers.ModelSerializer):
    parameter_options = OptionSerializer(many=True)

    class Meta:
        model = Parameter
        fields = ["id", "name", "unit", "laboratory", "parameter_options"]


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
            "data_file",
            "laboratory",
            "parameter_options",
            "experiment_videos",
            "registration_date",
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
        fields = ["id", "user", "laboratory", "registration_date"]
        read_only_fields = ["user"]


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = [
            "id",
            "data_type",
            "data",
            "solved_activity",
            "activity",
        ]


class ActivitySerializer(serializers.ModelSerializer):
    procedures = ProcedureSerializer(many=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "statement",
            "expected_result",
            "result_unit",
            "registration_date",
            "experiment",
            "laboratory",
            "procedures",
        ]


class SolvedActivitySerializer(serializers.ModelSerializer):
    procedures = ProcedureSerializer(many=True)

    class Meta:
        model = SolvedActivity
        fields = [
            "id",
            "result",
            "registration_date",
            "activity",
            "session",
            "procedures",
        ]
