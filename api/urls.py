from django.urls import path
from .views import RoomView, CreateRoomView, GetRoom, JoinRoom , UserInRoom, LeaveRoom, UpdateRoom

urlpatterns = [
    path('room', RoomView.as_view()), # this means if we get a url and it has nothing after the domain, it will call the main function in views.py
    path('create-room', CreateRoomView.as_view()), # this will create the room
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()), # this will join the room
    path('user-in-room', UserInRoom.as_view()), # this will get the user in room
    path('leave-room', LeaveRoom.as_view()), # this will leave the room
    path('update-room', UpdateRoom.as_view()), # this will update the room
]