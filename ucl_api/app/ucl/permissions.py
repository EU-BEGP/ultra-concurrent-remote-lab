# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework import permissions


class ApplicationPermissionManager(permissions.BasePermission):
    """
    Permission that allows:
        - The retrieval or list of objects to both students and instructors.
        - The creation, modification or deletion of objects to only instructors.
    """

    def has_permission(self, request, view):
        if request.method == "GET":
            return True
        elif request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return request.user.groups.filter(name="instructors").exists()
        else:
            return False
