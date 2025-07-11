from django.shortcuts import render
# from django.http import HttpResponse
from rest_framework import generics,status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse

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


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'
    def post(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room joined successfully!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Room Code.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
    


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
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code

            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        
class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)
    
class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code') # this will remove the room code from the session
            host = self.request.session.session_key # this is the host key 
            room_results = Room.objects.filter(host=host)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
        return Response({'message': 'Success'}, status=status.HTTP_200_OK)
    
# update the room
class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None): # patch method is used to update the room
        if not request.session.exists(request.session.session_key):
            request.session.create()

        serializer = self.serializer_class(data=request.data, partial=True)
        if serializer.is_valid():
            room_code = request.data.get('code')
            queryset = Room.objects.filter(code=room_code)
            if not queryset.exists():
                return Response({'msg': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room'}, status=status.HTTP_403_FORBIDDEN)

            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')

            if guest_can_pause is not None:
                room.guest_can_pause = guest_can_pause
            if votes_to_skip is not None:
                room.votes_to_skip = votes_to_skip

            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({"Bad Request": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)