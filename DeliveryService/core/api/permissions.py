# permissions.py (just ONE class)
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """Only admins can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'admin'
        )