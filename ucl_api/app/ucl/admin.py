from django.contrib import admin
from eav.admin import BaseEntityAdmin
from eav.forms import BaseDynamicEntityForm
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


class ExperimentAdminForm(BaseDynamicEntityForm):
    model = Experiment


class ExperimentAdmin(BaseEntityAdmin):
    form = ExperimentAdminForm


class VideoExperimentAdmin(BaseEntityAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "video", "experiment"]


class SessionAdmin(BaseEntityAdmin):
    ordering = ["id"]
    list_display = ["id", "student", "laboratory", "registration_date"]


class ActivityAdmin(BaseEntityAdmin):
    ordering = ["id"]
    list_display = ["id", "statement", "expected_result", "experiment", "laboratory"]


class SolvedActivityAdmin(BaseEntityAdmin):
    ordering = ["id"]
    list_display = ["id", "result", "activity", "experiment", "laboratory", "session"]


class ProcedureAdmin(BaseEntityAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "type", "data", "activity", "solved_activity"]


admin.site.register(Laboratory, LaboratoryAdmin)
admin.site.register(Guide, GuideAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(VideoExperiment, VideoExperimentAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(Activity, ActivityAdmin)
admin.site.register(SolvedActivity, SolvedActivityAdmin)
admin.site.register(Procedure, ProcedureAdmin)
