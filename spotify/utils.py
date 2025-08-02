from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get


BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    print(user_tokens)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    
    # Handle None expires_in value
    if expires_in is None:
        # Use a default expiration of 1 hour if not provided
        expiry = timezone.now() + timedelta(hours=1)
        print("Warning: expires_in was None, using default 1 hour expiration")
    else:
        try:
            # Convert to integer if it's a string
            expires_in = int(expires_in)
            expiry = timezone.now() + timedelta(seconds=expires_in)
        except (ValueError, TypeError):
            # Handle case where expires_in is not a valid integer
            expiry = timezone.now() + timedelta(hours=1)
            print(f"Warning: Invalid expires_in value: {expires_in}, using default 1 hour expiration")
    
    print(f"Setting token expiry to {expiry} for session {session_id}")
    
    if tokens:
        print(f"Updating existing token for {session_id}")
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expiry
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token',
                                 'refresh_token', 'expires_in', 'token_type'])
    else:
        print(f"Creating new token for {session_id}")
        tokens = SpotifyToken(user=session_id, access_token=access_token,
                            refresh_token=refresh_token, token_type=token_type, expires_in=expiry)
        tokens.save()
        
    print(f"Token saved successfully: {get_user_tokens(session_id)}")


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    print(f"Checking authentication for session: {session_id}")
    print(f"Found tokens: {tokens}")
    
    if tokens:
        expiry = tokens.expires_in
        print(f"Token expiry: {expiry}, current time: {timezone.now()}")
        
        if expiry <= timezone.now():
            # Token expired, refresh it
            print("Token expired, refreshing...")
            refresh_spotify_token(session_id)
            return True  # Still authenticated, just refreshed
        print("Token valid, user is authenticated")
        return True  # Not expired, user is authenticated

    print("No tokens found, user not authenticated")
    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token)