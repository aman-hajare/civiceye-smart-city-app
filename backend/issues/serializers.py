from rest_framework import serializers # its convert complex datatype like django models to json in django rest framework(drf)
from .models import User, Issue


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class IssueSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['reported_by', 'priority_score']
