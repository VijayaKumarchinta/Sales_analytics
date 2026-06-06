from rest_framework import serializers


class DatasetImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    clear = serializers.BooleanField(required=False, default=False)

