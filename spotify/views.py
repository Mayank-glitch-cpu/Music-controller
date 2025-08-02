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
        # Get room_code from query parameters
        room_code = request.GET.get('room_code')
        print(f"AuthURL: Room code from query params: {room_code}")
        
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        # Add state parameter to store the room_code
        params = {
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
        }
        
        # Only add state if room_code exists
        if room_code:
            params['state'] = room_code
            
        url = Request('GET', 'https://accounts.spotify.com/authorize', params=params).prepare().url
        
        print(f"Auth URL created with room code: {room_code}")
        print(f"Full auth URL: {url}")
        
        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    # Get room_code from state parameter
    room_code = request.GET.get('state')
    print(f"Callback received with state (room code): {room_code}")
    
    if error:
        print(f"Spotify auth error: {error}")
        return redirect('http://localhost:8080/')
    
    if not code:
        print("No code provided in the callback")
        return redirect('http://localhost:8080/')
    
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
            return redirect('http://localhost:8080/')
        
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
        
        # Save room code in the session to retrieve it later
        if room_code:
            request.session['room_code'] = room_code
            # Redirect to the React frontend with hash routing
            return redirect(f'http://localhost:8080/#/room/{room_code}')
        else:
            return redirect('http://localhost:8080/')
        
    except Exception as e:
        print(f"Exception in Spotify callback: {e}")
        return redirect('http://localhost:8080/')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)