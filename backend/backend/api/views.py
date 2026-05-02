from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings

from .models import User
from .serializers import UserSerializer


# ==============================
# USER CRUD APIs
# ==============================
@api_view(['GET', 'POST'])
def user_list(request):
    """List all users or create a new user"""

    if request.method == 'GET':
        users = User.objects.all()
        users_data = []

        for user in users:
            serializer = UserSerializer(user)
            data = serializer.data

            daily_submissions = user.daily_submissions or {}

            if daily_submissions:
                latest_date = max(daily_submissions.keys())
                data['todays_date'] = latest_date
                data['todays_submissions'] = daily_submissions[latest_date]
            else:
                data['todays_date'] = None
                data['todays_submissions'] = 0

            users_data.append(data)

        return Response(users_data)

    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def user_detail(request, pk):
    """Retrieve, update or delete a user instance"""

    try:
        user = User.objects.get(pk=pk)

    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = UserSerializer(user)
        data = serializer.data

        daily_submissions = user.daily_submissions or {}

        if daily_submissions:
            latest_date = max(daily_submissions.keys())
            data['todays_date'] = latest_date
            data['todays_submissions'] = daily_submissions[latest_date]
        else:
            data['todays_date'] = None
            data['todays_submissions'] = 0

        return Response(data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == 'PATCH':
        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# SEND OTP EMAIL API
# ==============================
@api_view(['POST'])
def send_otp(request):
    """
    Receives:
    {
        "email": "...",
        "otp": "123456"
    }

    Sends OTP to user email.
    """

    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response(
            {
                "success": False,
                "message": "Email and OTP are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        send_mail(
            subject='NodeVerse Email Verification OTP',
            message=f'''
Welcome to NodeVerse!

Your OTP for email verification is:

{otp}

Please do not share this OTP with anyone.

- NodeVerse Team
''',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "success": True,
                "message": "OTP sent successfully."
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )