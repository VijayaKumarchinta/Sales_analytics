from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from .models import Customer
from sales.models import Sale
from .serializers import CustomerSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'email', 'city', 'country']
    filterset_fields = ['segment', 'country']


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]


class CustomerSegmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        segments = (
            Customer.objects
            .values('segment')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        data = []
        for s in segments:
            total_value = Sale.objects.filter(
                customer__segment=s['segment']
            ).aggregate(total=Sum('sales_amount'))['total'] or 0
            data.append({
                'name': s['segment'],
                'count': s['count'],
                'value': float(total_value),
            })

        return Response(data)


class LifetimeValueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ltv_data = (
            Customer.objects
            .values('segment')
            .annotate(
                avg_value=Avg('sales__sales_amount'),
                total_customers=Count('id'),
                avg_orders=Count('sales') * 1.0 / Count('id'),
            )
            .order_by('-avg_value')
        )

        data = [
            {
                'segment': c['segment'],
                'avg_lifetime_value': round(float(c['avg_value'] or 0) * float(c.get('avg_orders', 1) or 1), 2),
                'total_customers': c['total_customers'],
                'avg_orders': round(float(c.get('avg_orders', 0) or 0), 1),
            }
            for c in ltv_data
        ]

        return Response(data)


class RetentionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        start_date = now - timedelta(days=365)

        retention = (
            Sale.objects
            .filter(order_date__gte=start_date)
            .annotate(month=TruncMonth('order_date'))
            .values('month')
            .annotate(
                total_customers=Count('customer', distinct=True),
                returning=Count('customer', distinct=True, filter=Q(customer__sales__order_date__lt=F('order_date')))
            )
            .order_by('month')
        )

        data = [
            {
                'month': r['month'].strftime('%b') if r['month'] else 'N/A',
                'rate': round(
                    (float(r['returning'] or 0) / float(r['total_customers'] or 1)) * 100, 1
                ),
                'total': r['total_customers'],
            }
            for r in retention
        ]

        return Response(data)



