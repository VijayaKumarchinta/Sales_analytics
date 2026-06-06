from django.urls import path

from sales.dataset_views import DatasetImportView

urlpatterns = [
    path('dataset/import/', DatasetImportView.as_view(), name='dataset-import'),
]

