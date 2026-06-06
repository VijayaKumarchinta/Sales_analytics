from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth, TruncQuarter
from django.utils import timezone
from datetime import timedelta
from .models import Sale
from .serializers import SaleSerializer


class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.select_related('customer', 'product').all()
    serializer_class = SaleSerializer
    permission_classes = [permissions.AllowAny]

    filterset_fields = ['region', 'order_date']
    search_fields = ['customer__name', 'product__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        region = self.request.query_params.get('region')

        if start_date:
            queryset = queryset.filter(order_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(order_date__lte=end_date)
        if region:
            queryset = queryset.filter(region=region)

        return queryset


class SaleDetailView(generics.RetrieveAPIView):
    queryset = Sale.objects.select_related('customer', 'product').all()
    serializer_class = SaleSerializer
    permission_classes = [permissions.AllowAny]



class SalesTrendView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):

        period = request.query_params.get('period', 'year')
        now = timezone.now()

        if period == '7d':
            start_date = now - timedelta(days=7)
        elif period == '30d':
            start_date = now - timedelta(days=30)
        elif period == 'quarter':
            start_date = now - timedelta(days=90)
        else:
            start_date = now - timedelta(days=365)

        trends = (
            Sale.objects
            .filter(order_date__gte=start_date)
            .annotate(month=TruncMonth('order_date'))
            .values('month')
            .annotate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                orders=Count('id')
            )
            .order_by('month')
        )

        data = [
            {
                'month': t['month'].strftime('%b') if t['month'] else 'N/A',
                'revenue': float(t['revenue'] or 0),
                'profit': float(t['profit'] or 0),
                'orders': t['orders'],
            }
            for t in trends
        ]

        return Response(data)


class QuarterlySalesView(APIView):
    permission_classes = [permissions.AllowAny]


    def get(self, request):
        now = timezone.now()
        start_date = now - timedelta(days=365)

        quarterly = (
            Sale.objects
            .filter(order_date__gte=start_date)
            .annotate(quarter=TruncQuarter('order_date'))
            .values('quarter')
            .annotate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                orders=Count('id')
            )
            .order_by('quarter')
        )

        data = [
            {
                'quarter': f"Q{((t['quarter'].month - 1) // 3) + 1}" if t['quarter'] else 'N/A',
                'revenue': float(t['revenue'] or 0),
                'profit': float(t['profit'] or 0),
                'orders': t['orders'],
            }
            for t in quarterly
        ]

        return Response(data)
