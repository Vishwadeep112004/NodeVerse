from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'username',
        'email',
        'name',
        'surname',
        'solved_problems',
        'daily_submissions'
    )

    # Clickable fields
    list_display_links = ('username', 'name')

    # Search bar support
    search_fields = ('username', 'email', 'name', 'surname')

    # Sidebar filters
    list_filter = ('solved_problems',)

    # Default ordering
    ordering = ('id',)