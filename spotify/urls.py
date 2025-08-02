from django.urls import path
from .views import AuthURL, spotify_callback, IsAuthenticated

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),  # Add the callback URL for Spotify authentication
    path('is-authenticated', IsAuthenticated.as_view()),  # Check if the user is authenticated
]
