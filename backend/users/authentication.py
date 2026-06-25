"""
Custom authentication backend that validates Supabase-issued JWT tokens.
"""
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()


class SupabaseAuthentication(authentication.BaseAuthentication):
    """Validates Supabase JWT tokens and maps them to Django users.

    The token's `sub` claim (a UUID from Supabase Auth) is stored in the
    User.supabase_uid field. If no local user exists yet, one is created
    from the claims in the token.
    """

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()
        if not auth_header or auth_header[0].lower() != b'bearer':
            return None  # No token → let other auth classes / permissions handle it

        if len(auth_header) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header — no credentials provided')
        if len(auth_header) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header — token contains spaces')

        token = auth_header[1].decode('utf-8')

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={'verify_aud': False},  # Supabase tokens may have varying audience
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token expired — please log in again')
        except jwt.InvalidTokenError as exc:
            raise exceptions.AuthenticationFailed(f'Invalid token: {exc}')

        user = self._get_or_create_user(payload)
        return (user, token)

    def _get_or_create_user(self, payload):
        """Find or create a Django user that maps to the Supabase user UUID."""
        supabase_uid = payload.get('sub')
        if not supabase_uid:
            raise exceptions.AuthenticationFailed('Token missing sub claim')

        email = payload.get('email', '')
        user_metadata = payload.get('user_metadata', {})

        try:
            user = User.objects.get(supabase_uid=supabase_uid)
        except User.DoesNotExist:
            # Try to match by email first, then create
            try:
                user = User.objects.get(email=email)
                user.supabase_uid = supabase_uid
                user.save(update_fields=['supabase_uid'])
            except User.DoesNotExist:
                username = (
                    user_metadata.get('preferred_username')
                    or email.split('@')[0]
                    or f'supabase_{supabase_uid[:8]}'
                )
                user = User.objects.create(
                    username=username,
                    email=email,
                    supabase_uid=supabase_uid,
                    role='viewer',
                )

        return user
