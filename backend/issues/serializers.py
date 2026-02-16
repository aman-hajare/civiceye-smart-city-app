from rest_framework import serializers
from .models import User, Issue


# ============================================
# USER SERIALIZER
# ============================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['role']


# ============================================
# ISSUE SERIALIZER
# ============================================

class IssueSerializer(serializers.ModelSerializer):

    reported_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="WORKER"),
        source="assigned_to",
        write_only=True,
        required=False
    )

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            'id',
            'title',
            'description',
            'image',
            'image_url',
            'category',
            'status',
            'latitude',
            'longitude',
            'priority_score',
            'reported_by',
            'assigned_to',
            'assigned_to_id',
            'created_at'
        ]

        read_only_fields = [
            'priority_score',
            'reported_by',
            'created_at'
        ]

    # ============================================
    # IMAGE URL
    # ============================================

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    # ============================================
    # VALIDATIONS
    # ============================================

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError("Invalid latitude.")
        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError("Invalid longitude.")
        return value

    # ============================================
    # ROLE-BASED UPDATE PROTECTION
    # ============================================

    def update(self, instance, validated_data):
        user = self.context['request'].user

        # USER cannot change status or assignment
        if user.role == "USER":
            validated_data.pop("status", None)
            validated_data.pop("assigned_to", None)

        # WORKER cannot assign or change priority
        if user.role == "WORKER":
            validated_data.pop("assigned_to", None)
            validated_data.pop("priority_score", None)

        return super().update(instance, validated_data)
