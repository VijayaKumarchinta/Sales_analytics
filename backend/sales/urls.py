from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.SaleListCreateView.as_view(), name='sales-list'),
    path('sales/<int:pk>/', views.SaleDetailView.as_view(), name='sales-detail'),
    path('sales/trends/', views.SalesTrendView.as_view(), name='sales-trends'),
    path('sales/quarterly/', views.QuarterlySalesView.as_view(), name='sales-quarterly'),
]
