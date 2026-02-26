# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea

from django.contrib import admin
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


class LaboratoryAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "name",
        "description",
        "category",
        "institution",
        "instructor",
        "image",
        "video",
        "youtube_url",
        "registration_date",
    ]


class GuideAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "title", "URL", "file",
                    "laboratory", "registration_date"]


class ParameterAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "unit", "laboratory"]


class OptionAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "value", "unit", "image", "parameter"]


class ExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "name",
        "data_file",
        "laboratory",
        "parameters",
        "param_options",
        "registration_date",
    ]


class MediaExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "media", "youtube_url", "experiment"]


class SessionAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "user", "laboratory", "registration_date"]


class ActivityAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "statement",
        "expected_result",
        "result_unit",
        "experiment",
        "laboratory",
        "possible_answers",
        "is_procedure_mandatory",
        "registration_date",
    ]


class SolvedActivityAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "result", "activity", "session", "registration_date"]


class ProcedureAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "data",
        "data_type",
        "data_headers",
        "solved_activity",
        "activity",
    ]


admin.site.register(Laboratory, LaboratoryAdmin)
admin.site.register(Guide, GuideAdmin)
admin.site.register(Parameter, ParameterAdmin)
admin.site.register(Option, OptionAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(MediaExperiment, MediaExperimentAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(Activity, ActivityAdmin)
admin.site.register(SolvedActivity, SolvedActivityAdmin)
admin.site.register(Procedure, ProcedureAdmin)
