from django.urls import path
from users import views

app_name = "users"

urlpatterns = [
    path(
        "activate-account/",
        views.ActivateUserAccount.as_view(),
        name="activate-account",
    ),
    path("me/", views.ManageUserView.as_view(), name="me"),
    path(
        "request-code/",
        views.RequestVerificationCode.as_view(),
        name="request-code",
    ),
    path("signup/", views.CreateUserView.as_view(), name="create"),
    path("token/", views.CreateTokenView.as_view(), name="token"),
]
