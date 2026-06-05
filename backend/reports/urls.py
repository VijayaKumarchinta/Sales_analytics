from django.urls import path
from . import views

urlpatterns = [
    path('reports/export/csv/', views.ExportCSVView.as_view(), name='export-csv'),
    path('reports/export/pdf/', views.ExportPDFView.as_view(), name='export-pdf'),
    path('reports/email/', views.EmailReportView.as_view(), name='email-report'),
]
