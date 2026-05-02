from .models import User
from datetime import date

def reset_daily_submissions():
    today = str(date.today())

    users = User.objects.all()

    for user in users:
        submissions = user.daily_submissions or {}

        # Add today's date only if not present
        if today not in submissions:
            submissions[today] = 0
            user.daily_submissions = submissions
            user.save()
