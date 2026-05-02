from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Problem, TestCase
from .serializers import ProblemSerializer, TestCaseSerializer

@api_view(['GET', 'POST'])
def problem_list(request):
    """List all problems or create a new problem"""
    if request.method == 'GET':
        problems = Problem.objects.all()
        serializer = ProblemSerializer(problems, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProblemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def problem_detail(request, pk):
    """Retrieve, update or delete a problem"""
    try:
        problem = Problem.objects.get(pk=pk)
    except Problem.DoesNotExist:
        return Response({'error': 'Problem not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProblemSerializer(problem)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProblemSerializer(problem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH':
        serializer = ProblemSerializer(problem, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        problem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def testcase_list(request, pk):
    """List all testcases for a problem or create a new one"""
    try:
        problem = Problem.objects.get(pk=pk)
    except Problem.DoesNotExist:
        return Response({'error': 'Problem not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        testcases = problem.testcases.all()
        serializer = TestCaseSerializer(testcases, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TestCaseSerializer(data=request.data)
        if serializer.is_valid():
            # Associate testcase with the specific problem
            serializer.save(problem=problem)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
