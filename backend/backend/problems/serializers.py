from rest_framework import serializers
from .models import Problem, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_sample']

class ProblemSerializer(serializers.ModelSerializer):
    testcases = TestCaseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Problem
        fields = ['id', 'title', 'statement', 'difficulty', 'constraints', 'sample_input', 'sample_output', 'testcases']