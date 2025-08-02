from django.urls import path
from .views import index

app_name = 'frontend'  # This defines the namespace

urlpatterns = [
    path('', index, name='index'),  # This defines the 'index' view name
    path('join', index),
    path('create', index),
    path('room/<str:room_code>', index),
    path('callback', index),
]