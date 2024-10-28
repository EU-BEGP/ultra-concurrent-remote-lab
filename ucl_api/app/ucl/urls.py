from django.urls import path
from ucl.views import laboratory_views, guide_views, experiment_views

app_name = "ucl"

urlpatterns = [
    path(
        "laboratories/",
        laboratory_views.LaboratoryListCreateView.as_view(),
        name="laboratory-list-create",
    ),
    path(
        "laboratories/<int:pk>/",
        laboratory_views.LaboratoryDetailView.as_view(),
        name="laboratory-detail",
    ),
    path(
        "guides/",
        guide_views.GuideListCreateView.as_view(),
        name="guide-list-create",
    ),
    path(
        "guides/<int:pk>/",
        guide_views.GuideDetailView.as_view(),
        name="guide-detail",
    ),
    path(
        "experiments/",
        experiment_views.ExperimentListCreateView.as_view(),
        name="experiment-list-create",
    ),
    path(
        "experiments/<int:pk>/",
        experiment_views.ExperimentDetailView.as_view(),
        name="experiment-detail",
    ),
]
