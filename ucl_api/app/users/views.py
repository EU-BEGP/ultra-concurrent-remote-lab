from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import authentication, generics, permissions, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.settings import api_settings

from users.models import User
from users.serializers import UserSerializer, AuthTokenSerializer, UserProfileSerializer
from utils import account_activation_token


class CreateUserView(generics.CreateAPIView):
    """Create a new user"""

    serializer_class = UserSerializer


class CreateTokenView(ObtainAuthToken):
    """Get token for user"""

    serializer_class = AuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""

    serializer_class = UserProfileSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Retrieve and return authentication user"""
        return self.request.user


class ActivateAccountView(generics.GenericAPIView):
    def post(self, request):
        uid = request.data.get("uid", None)
        token = request.data.get("token", None)

        if not uid or not token:
            return Response(
                {"message": "uid and token are required in the request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response(
                {
                    "message": "Thank you for your email confirmation. Now you can log in to your account."
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": "Activation link is invalid!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
