from rest_framework import permissions


class IsInstructor(permissions.BasePermission):
    """
    Permission to only allow instructors to access objects.
    """

    def has_permission(self, request, view):
        return request.user.groups.filter(name="instructors").exists()
