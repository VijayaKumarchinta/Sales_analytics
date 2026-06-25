"""
Management command to import sales data from sales_analytics_USD.csv
into the Product, Customer, and Sale models.

Usage:
    python manage.py import_sales_data
    python manage.py import_sales_data --csv path/to/file.csv
    python manage.py import_sales_data --clear  # Clear existing data before import
"""
import os

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from sales.importers import SalesDataImporter


class Command(BaseCommand):
    help = 'Import sales data from CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv',
            type=str,
            default=None,
            help='Path to the CSV file (default: sales_analytics_USD.csv in project root)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing Product, Customer, and Sale data before importing',
        )

    def handle(self, *args, **options):
        csv_path = options['csv']
        should_clear = options['clear']

        if not csv_path:
            # Default to project root (parent of BASE_DIR)
            csv_path = os.path.join(str(settings.BASE_DIR.parent), 'sales_analytics_USD.csv')

        if not os.path.exists(csv_path):
            raise CommandError(f'CSV file not found at: {csv_path}')

        self.stdout.write(f'Reading CSV file: {csv_path}')

        # Parse CSV
        with open(csv_path, 'r') as f:
            rows = SalesDataImporter.parse_csv_rows(f)

        self.stdout.write(f'Found {len(rows)} records in CSV')

        # Import using the reusable importer
        result = SalesDataImporter.import_from_rows(rows, clear=should_clear)

        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('IMPORT SUMMARY'))
        self.stdout.write(f'  Products:  {result.products}')
        self.stdout.write(f'  Customers: {result.customers}')
        self.stdout.write(f'  Sales:     {result.sales}')
        self.stdout.write(f'  CSV rows:  {result.csv_records}')
        self.stdout.write('=' * 50)
