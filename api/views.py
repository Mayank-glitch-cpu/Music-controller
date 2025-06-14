from django.shortcuts import render
# from django.http import HttpResponse
from rest_framework import generics,status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.
# will create end points here like /hello, /api/v1/music etc
# def main(request):
#     return HttpResponse("<h1> Hello, world. You're at the music controller API index.<h1>")

class RoomView(generics.ListAPIView):
    # this will create the room
    # we will use the RoomSerializer to serialize the data
    # and we will use the Room model to create the room
    # and we will use the RoomSerializer to validate the data
    # and we will use the Room model to create the room
    queryset= Room.objects.all()
    serializer_class= RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)
    
class CreateRoomView(APIView):
    serializer_class= CreateRoomSerializer

    def post(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)