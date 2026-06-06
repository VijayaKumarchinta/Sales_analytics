from rest_framework import generics, status
from rest_framework.response import Response

from sales.importers import SalesDataImporter
from sales.serializers_import import DatasetImportSerializer


class DatasetImportView(generics.GenericAPIView):
    serializer_class = DatasetImportSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uploaded_file = serializer.validated_data['file']
        clear = serializer.validated_data.get('clear', False)

        # Uploaded file is an InMemoryUploadedFile/TemporaryUploadedFile.
        # DictReader expects text, so open in text mode.
        rows = SalesDataImporter.parse_csv_rows(uploaded_file)
        result = SalesDataImporter.import_from_rows(rows, clear=clear)

        return Response(
            {
                'ok': True,
                'import': {
                    'csv_records': result.csv_records,
                    'products': result.products,
                    'customers': result.customers,
                    'sales': result.sales,
                },
            },
            status=status.HTTP_201_CREATED,
        )

