from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Issue


# ============================================
# USER SERIALIZER
# ============================================

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'role']
        read_only_fields = ['role']

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username


class RegisterUserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password']

    def validate_first_name(self, value):
        first_name = " ".join(str(value).split())
        if not first_name:
            raise serializers.ValidationError("First name is required.")
        if " " in first_name:
            raise serializers.ValidationError("First name must be a single word.")

        username = first_name.lower()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("This first name is already taken as username.")

        return first_name

    def validate_last_name(self, value):
        last_name = " ".join(str(value).split())
        if not last_name:
            raise serializers.ValidationError("Last name is required.")
        return last_name

    def validate_email(self, value):
        email = str(value).strip().lower()
        if not email:
            raise serializers.ValidationError("Email is required.")

        if User.objects.filter(email__iexact=email).exists() or User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        username = first_name.lower()

        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role='USER',
        )
        user.set_password(password)
        user.save()
        return user


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
