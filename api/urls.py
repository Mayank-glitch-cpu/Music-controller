from django.urls import path
from .views import RoomView, CreateRoomView, GetRoom

urlpatterns = [
    path('room', RoomView.as_view()), # this means if we get a url and it has nothing after the domain, it will call the main function in views.py
    path('create-room', CreateRoomView.as_view()), # this will create the room
    path('get-room', GetRoom.as_view())
]