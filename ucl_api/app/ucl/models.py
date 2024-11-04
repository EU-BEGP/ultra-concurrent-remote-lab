from django.utils.html import format_html
from django.conf import settings
from django.db import models
import uuid


class Laboratory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    institution = models.CharField(max_length=100)
    video = models.FileField(default=None, null=True, blank=True)
    image = models.ImageField(default=None, null=True, blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="instructor_laboratories",
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name_plural = "Laboratories"


class Guide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=50)
    url = models.URLField(default=None)
    file = models.FileField(default=None)
    registration_date = models.DateTimeField(auto_now_add=True)
    laboratory = models.ForeignKey(
        Laboratory, related_name="laboratory_guides", on_delete=models.CASCADE
    )

    def URL(self):
        url = self.url
        return format_html("<a href='%s'>%s</a>" % (url, url))


class Parameter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, null=True, default=None)
    laboratory = models.ForeignKey(
        Laboratory, related_name="laboratory_parameters", on_delete=models.CASCADE
    )


class Option(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    value = models.CharField(max_length=255)
    image = models.ImageField(default=None, null=True, blank=True)
    parameter = models.ForeignKey(
        Parameter, on_delete=models.CASCADE, related_name="parameter_options"
    )


class Experiment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    registration_date = models.DateTimeField(auto_now_add=True)
    laboratory = models.ForeignKey(
        Laboratory, related_name="laboratory_experiments", on_delete=models.CASCADE
    )
    parameter_options = models.ManyToManyField(
        Option, related_name="options_experiments"
    )

    def parameters(self):
        return ", ".join(po.parameter.name for po in self.parameter_options.all())

    def param_options(self):
        return ", ".join(po.value for po in self.parameter_options.all())


class VideoExperiment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    video = models.FileField()
    experiment = models.ForeignKey(
        Experiment, related_name="experiment_videos", on_delete=models.CASCADE
    )
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "VideoExperiments"


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="student_sessions",
        on_delete=models.CASCADE,
    )
    laboratory = models.ForeignKey(
        Laboratory,
        related_name="laboratory_sessions",
        on_delete=models.CASCADE,
        default=None,
    )
    registration_date = models.DateTimeField(auto_now_add=True)


class Activity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    statement = models.CharField(max_length=500)
    expected_result = models.CharField(max_length=500)
    experiment = models.ForeignKey(
        Experiment,
        related_name="experiment_activities",
        on_delete=models.CASCADE,
        default=None,
    )
    laboratory = models.ForeignKey(
        Laboratory,
        related_name="laboratory_activities",
        on_delete=models.CASCADE,
        default=None,
    )
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Activities"


class SolvedActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    result = models.CharField(max_length=500)
    activity = models.ForeignKey(
        Activity, related_name="activity_solved_activities", on_delete=models.CASCADE
    )
    experiment = models.ForeignKey(
        Experiment,
        related_name="experiment_solved_activities",
        on_delete=models.CASCADE,
        default=None,
    )
    laboratory = models.ForeignKey(
        Laboratory,
        related_name="laboratory_solved_activities",
        on_delete=models.CASCADE,
        default=None,
    )
    session = models.ForeignKey(
        Session,
        related_name="session_solved_activities",
        on_delete=models.CASCADE,
    )
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "SolvedActivities"


class Procedure(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=100)
    data = models.JSONField()
    activity = models.ForeignKey(
        Activity,
        related_name="activity_procedures",
        on_delete=models.CASCADE,
        default=None,
    )
    solved_activity = models.ForeignKey(
        Activity,
        related_name="solved_activity_procedures",
        on_delete=models.CASCADE,
        default=None,
    )
    registration_date = models.DateTimeField(auto_now_add=True)
