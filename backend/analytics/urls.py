from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/kpis/', views.DashboardKPIsView.as_view(), name='dashboard-kpis'),
    path('dashboard/revenue/', views.RevenueTrendView.as_view(), name='dashboard-revenue'),
    path('dashboard/sales-by-region/', views.SalesByRegionView.as_view(), name='dashboard-sales-by-region'),
    path('dashboard/category-breakdown/', views.CategoryBreakdownView.as_view(), name='dashboard-category-breakdown'),
]
