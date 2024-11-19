from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils.html import format_html
import hashlib
import os
import uuid


class UniqueFilenameStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        if max_length and len(name) > max_length:
            raise (Exception("Name's length is greater than max_length"))
        return name

    def _save(self, name, content):
        if self.exists(name):
            return name
        return super(UniqueFilenameStorage, self)._save(name, content)


def generate_unique_filename_file(instance, filename):
    if isinstance(instance, Guide):
        instance_content = instance.file.read()
        field_name = "guide_files"
    elif isinstance(instance, Experiment):
        instance_content = instance.data_file.read()
        field_name = "experiment_data_files"
    else:
        raise ValueError(
            "Instance must pertain to a model that have valid image or file fields."
        )

    md5_hash = hashlib.md5(instance_content).hexdigest()
    _, ext = os.path.splitext(filename)
    new_filename = f"{md5_hash}{ext}"
    return os.path.join(field_name, new_filename)


def generate_unique_filename_video(instance, filename):
    if isinstance(instance, Laboratory):
        instance_content = instance.video.read()
        field_name = "laboratory_videos"
    elif isinstance(instance, VideoExperiment):
        instance_content = instance.video.read()
        field_name = "experiment_videos"
    else:
        raise ValueError(
            "Instance must pertain to a model that have valid image or file fields."
        )

    md5_hash = hashlib.md5(instance_content).hexdigest()
    _, ext = os.path.splitext(filename)
    new_filename = f"{md5_hash}{ext}"
    return os.path.join(field_name, new_filename)


def generate_unique_filename_image(instance, filename):
    if isinstance(instance, Laboratory):
        instance_content = instance.image.read()
        field_name = "laboratory_images"
    elif isinstance(instance, Option):
        instance_content = instance.image.read()
        field_name = "option_images"
    else:
        raise ValueError(
            "Instance must pertain to a model that have valid image or file fields."
        )

    md5_hash = hashlib.md5(instance_content).hexdigest()
    _, ext = os.path.splitext(filename)
    new_filename = f"{md5_hash}{ext}"
    return os.path.join(field_name, new_filename)


class Laboratory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100)
    institution = models.CharField(max_length=100)
    video = models.FileField(
        default=None,
        null=True,
        blank=True,
        upload_to=generate_unique_filename_video,
        storage=UniqueFilenameStorage,
    )
    image = models.ImageField(
        default=None,
        null=True,
        blank=True,
        upload_to=generate_unique_filename_image,
        storage=UniqueFilenameStorage,
    )
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
    file = models.FileField(
        default=None,
        upload_to=generate_unique_filename_file,
        storage=UniqueFilenameStorage,
    )
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
    image = models.ImageField(
        default=None,
        null=True,
        blank=True,
        upload_to=generate_unique_filename_image,
        storage=UniqueFilenameStorage,
    )
    parameter = models.ForeignKey(
        Parameter, on_delete=models.CASCADE, related_name="parameter_options"
    )


class Experiment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    data_file = models.FileField(
        null=True,
        default=None,
        upload_to=generate_unique_filename_file,
        storage=UniqueFilenameStorage,
    )
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
    video = models.FileField(
        upload_to=generate_unique_filename_video,
        storage=UniqueFilenameStorage,
    )
    experiment = models.ForeignKey(
        Experiment, related_name="experiment_videos", on_delete=models.CASCADE
    )

    class Meta:
        verbose_name_plural = "VideoExperiments"


class Activity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    statement = models.CharField(max_length=500)
    expected_result = models.CharField(max_length=500, null=True, default=None)
    result_unit = models.CharField(max_length=20, null=True, default=None)
    registration_date = models.DateTimeField(auto_now_add=True)

    experiment = models.ForeignKey(
        Experiment,
        related_name="experiment_activities",
        on_delete=models.CASCADE,
        null=True,
        default=None,
    )
    laboratory = models.ForeignKey(
        Laboratory,
        related_name="laboratory_activities",
        on_delete=models.CASCADE,
        null=True,
        default=None,
    )

    class Meta:
        verbose_name_plural = "Activities"


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="user_sessions",
        on_delete=models.CASCADE,
    )
    laboratory = models.ForeignKey(
        Laboratory,
        related_name="laboratory_sessions",
        on_delete=models.CASCADE,
        null=True,
        default=None,
    )
    registration_date = models.DateTimeField(auto_now_add=True)


class SolvedActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    result = models.CharField(max_length=500)
    registration_date = models.DateTimeField(auto_now_add=True)

    activity = models.ForeignKey(
        Activity,
        related_name="activity_solved_activity",
        on_delete=models.CASCADE,
    )
    session = models.ForeignKey(
        Session,
        related_name="session_solved_activities",
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name_plural = "SolvedActivities"


class Procedure(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    data_type = models.CharField(max_length=100)
    data = models.TextField()

    activity = models.ForeignKey(
        Activity,
        related_name="procedures",
        on_delete=models.CASCADE,
        null=True,
        default=None,
    )
    solved_activity = models.ForeignKey(
        SolvedActivity,
        related_name="procedures",
        on_delete=models.CASCADE,
        null=True,
        default=None,
    )

    def save(self, *args, **kwargs):
        # Ensure only one of `activity` or `solved_activity` is set
        if not (self.activity or self.solved_activity):
            raise ValueError(
                "A procedure must be linked to either an activity or a solved activity."
            )

        # Ensure that both ForeignKeys are not set simultaneously
        if self.activity and self.solved_activity:
            raise ValueError(
                "A procedure cannot be linked to both an activity and a solved activity at the same time."
            )

        super().save(*args, **kwargs)
