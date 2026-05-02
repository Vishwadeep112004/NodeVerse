from django.urls import path
from . import views

urlpatterns = [
    path('', views.problem_list, name='problem-list'),
    path('<int:pk>/', views.problem_detail, name='problem-detail'),
    path('<int:pk>/testcases/', views.testcase_list, name='testcase-list'),
]
