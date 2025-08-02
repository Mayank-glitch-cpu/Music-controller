from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import update_or_create_user_tokens, is_spotify_authenticated
from api.models import Room


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    # Get room_code from state parameter
    room_code = request.GET.get('state')
    print(f"Callback received with state (room code): {room_code}")
    
    if error:
        print(f"Spotify auth error: {error}")
        return redirect('frontend:index')  # Change 'frontend:' to 'frontend:index'
    
    if not code:
        print("No code provided in the callback")
        return redirect('frontend:index')  # Change 'frontend:' to 'frontend:index'
    
    try:
        response = post('https://accounts.spotify.com/api/token', data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }).json()
        
        # Debug: print full response
        print("Spotify token response:", response)
        
        if 'error' in response:
            print(f"Spotify token error: {response.get('error')}")
            return redirect('frontend:index')  # Change 'frontend:' to 'frontend:index'
        
        access_token = response.get('access_token')
        token_type = response.get('token_type')
        refresh_token = response.get('refresh_token')
        expires_in = response.get('expires_in')
        
        if not request.session.exists(request.session.session_key):
            request.session.create()
        
        update_or_create_user_tokens(
            request.session.session_key, 
            access_token, 
            token_type, 
            expires_in, 
            refresh_token
        )
        
        # If room_code is available, redirect to the room
        if room_code:
            return redirect(f'/room/{room_code}')
        else:
            return redirect('frontend:index')  # Change 'frontend:' to 'frontend:index'
        
    except Exception as e:
        print(f"Exception in Spotify callback: {e}")
        return redirect('frontend:index')  # Change 'frontend:' to 'frontend:index'


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)