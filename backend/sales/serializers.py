from rest_framework import serializers
from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
