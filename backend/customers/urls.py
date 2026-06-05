from django.urls import path
from . import views

urlpatterns = [
    path('customers/', views.CustomerListCreateView.as_view(), name='customers-list'),
    path('customers/<int:pk>/', views.CustomerDetailView.as_view(), name='customers-detail'),
    path('customers/segments/', views.CustomerSegmentsView.as_view(), name='customers-segments'),
    path('customers/lifetime-value/', views.LifetimeValueView.as_view(), name='customers-ltv'),
    path('customers/retention/', views.RetentionView.as_view(), name='customers-retention'),
]
