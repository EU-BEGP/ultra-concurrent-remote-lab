from rest_framework import serializers
from users.serializers import UserSerializer
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
    MediaExperiment,
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
            "youtube_video",
            "registration_date",
        ]


class GuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide
        fields = ["id", "title", "url", "file",
                  "laboratory", "registration_date"]


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "value", "unit", "image"]


class ParameterSerializer(serializers.ModelSerializer):
    parameter_options = OptionSerializer(many=True)

    class Meta:
        model = Parameter
        fields = ["id", "name", "unit", "laboratory", "parameter_options"]


class MediaExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaExperiment
        fields = ["id", "name", "media", "youtube_video", "experiment"]


class ExperimentSerializer(serializers.ModelSerializer):
    experiment_media = MediaExperimentSerializer(many=True)

    class Meta:
        model = Experiment
        fields = (
            "id",
            "name",
            "data_file",
            "laboratory",
            "parameter_options",
            "experiment_media",
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
        fields = ["id", "name", "user", "laboratory", "registration_date"]
        read_only_fields = ["user"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Serialize the related User instance
        user = instance.user
        representation["user"] = {
            "id": user.id,
            "name": user.name,
            "last_name": user.last_name,
            "email": user.email,
        }
        return representation


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = [
            "id",
            "data_type",
            "data_headers",
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
            "possible_answers",
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
