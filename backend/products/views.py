from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, F, ExpressionWrapper, FloatField
from .models import Product
from sales.models import Sale
from .serializers import ProductSerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'category']
    filterset_fields = ['category']


class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]


class TopProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        products = (
            Sale.objects
            .values('product__name')
            .annotate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                total_quantity=Sum('quantity'),
            )
            .annotate(
                margin=ExpressionWrapper(
                    F('profit') / F('revenue') * 100,
                    output_field=FloatField()
                )
            )
            .order_by('-revenue')
        )

        data = [
            {
                'name': p['product__name'],
                'revenue': float(p['revenue'] or 0),
                'profit': float(p['profit'] or 0),
                'margin': round(float(p['margin'] or 0), 1),
                'units_sold': p['total_quantity'] or 0,
            }
            for p in products
        ]

        return Response(data)


class ProfitabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categories = (
            Sale.objects
            .values('product__category')
            .annotate(
                revenue=Sum('sales_amount'),
                profit=Sum('profit'),
                count=Count('product', distinct=True),
            )
            .annotate(
                margin=ExpressionWrapper(
                    F('profit') / F('revenue') * 100,
                    output_field=FloatField()
                )
            )
            .order_by('-revenue')
        )

        data = [
            {
                'category': dict(Product.CATEGORY_CHOICES).get(c['product__category'], c['product__category']),
                'revenue': float(c['revenue'] or 0),
                'profit': float(c['profit'] or 0),
                'margin': round(float(c['margin'] or 0), 1),
                'count': c['count'],
            }
            for c in categories
        ]

        return Response(data)


class CategoryAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analysis = (
            Product.objects
            .values('category')
            .annotate(
                total_products=Count('id'),
                avg_cost=Sum('cost_price') / Count('id'),
                avg_price=Sum('selling_price') / Count('id'),
            )
            .order_by('category')
        )

        data = [
            {
                'category': dict(Product.CATEGORY_CHOICES).get(a['category'], a['category']),
                'total_products': a['total_products'],
                'avg_cost': float(a['avg_cost'] or 0),
                'avg_price': float(a['avg_price'] or 0),
                'avg_margin': round(
                    ((float(a['avg_price'] or 0) - float(a['avg_cost'] or 0)) / float(a['avg_price'] or 1)) * 100,
                    1
                ),
            }
            for a in analysis
        ]

        return Response(data)
