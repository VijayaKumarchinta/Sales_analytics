from rest_framework import serializers
from django.db.models import Sum
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    total_spent = serializers.SerializerMethodField()
    orders = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_spent(self, obj):
        from sales.models import Sale
        total = Sale.objects.filter(customer=obj).aggregate(total=Sum('sales_amount'))
        return float(total['total'] or 0)

    def get_orders(self, obj):
        from sales.models import Sale
        return Sale.objects.filter(customer=obj).count()
