from django.contrib import admin
from django.urls import path, include
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', views.user_list, name='user-list'),
    path('api/users/<int:pk>/', views.user_detail, name='user-detail'),
    path('api/send-otp/', views.send_otp, name='send-otp'),
    path('api/problems/', include('problems.urls')),
]
