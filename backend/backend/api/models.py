from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    solved_problems = models.IntegerField(default=0)
    daily_submissions = models.JSONField(default=dict)

    def __str__(self):
        return self.username