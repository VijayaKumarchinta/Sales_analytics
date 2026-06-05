import csv
import io
from datetime import datetime

from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.http import HttpResponse, JsonResponse
from django.utils import timezone

from sales.models import Sale
from customers.models import Customer
from products.models import Product


class ExportCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data_type = request.query_params.get('type', 'sales')
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{data_type}_{datetime.now().strftime("%Y%m%d")}.csv"'

        writer = csv.writer(response)

        if data_type == 'sales':
            writer.writerow(['ID', 'Product', 'Customer', 'Quantity', 'Amount', 'Profit', 'Region', 'Date'])
            sales = Sale.objects.select_related('product', 'customer').all()[:10000]
            for sale in sales:
                writer.writerow([
                    sale.id,
                    sale.product.name,
                    sale.customer.name,
                    sale.quantity,
                    sale.sales_amount,
                    sale.profit,
                    sale.region,
                    sale.order_date.strftime('%Y-%m-%d'),
                ])
        elif data_type == 'customers':
            writer.writerow(['ID', 'Name', 'Email', 'City', 'Country', 'Segment', 'Created'])
            customers = Customer.objects.all()[:10000]
            for c in customers:
                writer.writerow([c.id, c.name, c.email, c.city, c.country, c.segment, c.created_at.strftime('%Y-%m-%d')])
        elif data_type == 'products':
            writer.writerow(['ID', 'Name', 'Category', 'Cost Price', 'Selling Price'])
            products = Product.objects.all()[:10000]
            for p in products:
                writer.writerow([p.id, p.name, p.category, p.cost_price, p.selling_price])

        return response


class ExportPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Generate PDF report summary data as JSON
        # In production, use a proper PDF library like ReportLab
        from sales.models import Sale
        from django.db.models import Sum, Count

        sales_data = Sale.objects.aggregate(
            total_revenue=Sum('sales_amount'),
            total_profit=Sum('profit'),
            total_orders=Count('id'),
        )

        data = {
            'title': 'Sales Analytics Report',
            'generated_at': timezone.now().isoformat(),
            'summary': {
                'total_revenue': float(sales_data['total_revenue'] or 0),
                'total_profit': float(sales_data['total_profit'] or 0),
                'total_orders': sales_data['total_orders'] or 0,
            },
            'message': 'PDF report data. Export with proper PDF library in production.',
        }

        return Response(data)


class EmailReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        frequency = request.data.get('frequency', 'weekly')

        if not email:
            return Response(
                {'error': 'Email address is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # In production, integrate with Celery + email backend
        return Response({
            'message': f'Report scheduled successfully',
            'email': email,
            'frequency': frequency,
            'status': 'active',
        })
