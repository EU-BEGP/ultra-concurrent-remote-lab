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
    VideoExperiment,
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
    ]


class GuideAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "title", "URL", "file", "laboratory"]


class ParameterAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "unit", "laboratory"]


class OptionAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "value", "image", "parameter"]


class ExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "name",
        "laboratory",
        "parameters",
        "param_options",
    ]


class VideoExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "video", "experiment"]


class SessionAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "student", "laboratory", "registration_date"]


class ActivityAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "statement", "expected_result", "experiment", "laboratory"]


class SolvedActivityAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "result", "activity", "experiment", "laboratory", "session"]


class ProcedureAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "type", "data", "activity", "solved_activity"]


admin.site.register(Laboratory, LaboratoryAdmin)
admin.site.register(Guide, GuideAdmin)
admin.site.register(Parameter, ParameterAdmin)
admin.site.register(Option, OptionAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(VideoExperiment, VideoExperimentAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(Activity, ActivityAdmin)
admin.site.register(SolvedActivity, SolvedActivityAdmin)
admin.site.register(Procedure, ProcedureAdmin)
