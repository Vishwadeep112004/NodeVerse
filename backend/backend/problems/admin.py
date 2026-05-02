from django.contrib import admin
from .models import Problem, TestCase

class TestCaseInline(admin.StackedInline):
    model = TestCase
    extra = 1

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty')
    list_display_links = ('title',)
    list_filter = ('difficulty',)
    search_fields = ('title', 'statement')
    inlines = [TestCaseInline]

@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'problem', 'is_sample')
    list_display_links = ('problem',)
    list_filter = ('is_sample', 'problem')
    search_fields = ('problem__title',)
