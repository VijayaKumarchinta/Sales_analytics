from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductListCreateView.as_view(), name='products-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='products-detail'),
    path('products/top/', views.TopProductsView.as_view(), name='products-top'),
    path('products/profitability/', views.ProfitabilityView.as_view(), name='products-profitability'),
    path('products/category-analysis/', views.CategoryAnalysisView.as_view(), name='products-category-analysis'),
]
