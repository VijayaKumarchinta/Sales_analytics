from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta

from sales.models import Sale
from customers.models import Customer


class DashboardKPIsView(APIView):
    permission_classes = [permissions.AllowAny]


    def get(self, request):
        period = request.query_params.get('period', 'year')
        now = timezone.now()

        if period == 'all':
            # No date filter — query all records
            current = Sale.objects.aggregate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                orders=Count('id'),
            )
            previous = {'revenue': 0, 'profit': 0, 'orders': 0}
        else:
            if period == '7d':
                start_date = now - timedelta(days=7)
            elif period == '30d':
                start_date = now - timedelta(days=30)
            elif period == 'quarter':
                start_date = now - timedelta(days=90)
            else:
                start_date = now - timedelta(days=365)

            # Current period stats
            current = Sale.objects.filter(order_date__gte=start_date).aggregate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                orders=Count('id'),
            )

            # Previous period for comparison
            period_days = (now - start_date).days
            prev_start = start_date - timedelta(days=period_days)
            previous = Sale.objects.filter(
                order_date__gte=prev_start,
                order_date__lt=start_date
            ).aggregate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                orders=Count('id'),
            )

        # Customer count
        total_customers = Customer.objects.count()

        # Calculate KPIs
        current_revenue = float(current['revenue'] or 0)
        prev_revenue = float(previous['revenue'] or 0)
        current_profit = float(current['profit'] or 0)
        prev_profit = float(previous['profit'] or 0)
        current_orders = current['orders'] or 0
        prev_orders = previous['orders'] or 0

        def calc_change(current, previous):
            if previous == 0:
                return 0
            return round(((current - previous) / previous) * 100, 1)

        revenue_change = calc_change(current_revenue, prev_revenue)
        profit_change = calc_change(current_profit, prev_profit)
        orders_change = calc_change(current_orders, prev_orders)

        # Profit margin
        profit_margin = round(
            (current_profit / current_revenue * 100) if current_revenue > 0 else 0, 1
        )
        prev_margin = round(
            (prev_profit / prev_revenue * 100) if prev_revenue > 0 else 0, 1
        )
        margin_change = round(profit_margin - prev_margin, 1)

        # Growth rate (based on revenue change)
        growth_rate = revenue_change

        return Response({
            'revenue': {'value': round(current_revenue, 2), 'change': revenue_change, 'prefix': '$'},
            'profit': {'value': round(current_profit, 2), 'change': profit_change, 'prefix': '$'},
            'profitMargin': {'value': profit_margin, 'change': margin_change, 'suffix': '%'},
            'orders': {'value': current_orders, 'change': orders_change},
            'customers': {'value': total_customers, 'change': 0},
            'growthRate': {'value': growth_rate, 'change': 0, 'suffix': '%'},
        })


class RevenueTrendView(APIView):
    permission_classes = [permissions.AllowAny]


    def get(self, request):
        from django.db.models.functions import TruncMonth

        period = request.query_params.get('period', 'year')
        now = timezone.now()
        start_date = now - timedelta(days=365 if period == 'year' else 180)

        trends = (
            Sale.objects
            .filter(order_date__gte=start_date)
            .annotate(month=TruncMonth('order_date'))
            .values('month')
            .annotate(amount=Sum('sales_amount'))
            .order_by('month')
        )

        data = [
            {
                'label': t['month'].strftime('%b') if t['month'] else 'N/A',
                'amount': float(t['amount'] or 0),
            }
            for t in trends
        ]

        return Response(data)


class SalesByRegionView(APIView):
    permission_classes = [permissions.AllowAny]


    def get(self, request):
        period = request.query_params.get('period', 'year')
        now = timezone.now()

        if period == '7d':
            start_date = now - timedelta(days=7)
        elif period == '30d':
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=365)

        regions = (
            Sale.objects
            .filter(order_date__gte=start_date)
            .values('region')
            .annotate(total=Sum('sales_amount'))
            .order_by('-total')
        )

        data = [
            {
                'region': r['region'],
                'total': float(r['total'] or 0),
            }
            for r in regions
        ]

        return Response(data)


class CategoryBreakdownView(APIView):
    permission_classes = [permissions.AllowAny]


    def get(self, request):
        categories = (
            Sale.objects
            .values('product__category')
            .annotate(total=Sum('sales_amount'))
            .order_by('-total')
        )

        data = [
            {
                'name': cat['product__category'].replace('_', ' ').title() if cat['product__category'] else 'Other',
                'total': float(cat['total'] or 0),
            }
            for cat in categories
        ]

        return Response(data)
