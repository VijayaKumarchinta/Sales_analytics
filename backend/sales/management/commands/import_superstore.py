"""
Management command to import the Tableau Sample Superstore dataset
into the Product, Customer, and Sale models.

Usage:
    python manage.py import_superstore
    python manage.py import_superstore --csv path/to/superstore.csv
    python manage.py import_superstore --clear  # Clear existing data before import
"""
import os
import re
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from customers.models import Customer
from products.models import Product
from sales.models import Sale


CATEGORY_MAP = {
    'Furniture': 'home_garden',
    'Office Supplies': 'other',
    'Technology': 'electronics',
}


class Command(BaseCommand):
    help = 'Import the Tableau Sample Superstore dataset into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv',
            type=str,
            default=None,
            help='Path to the CSV file (default: superstore.csv in project root)',
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
            csv_path = os.path.join(str(settings.BASE_DIR.parent), 'superstore.csv')

        if not os.path.exists(csv_path):
            raise CommandError(f'CSV file not found at: {csv_path}')

        self.stdout.write(f'Reading CSV file: {csv_path}')

        # Parse CSV
        import csv
        rows = []
        with open(csv_path, 'r', encoding='cp1252') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)

        self.stdout.write(f'Found {len(rows)} records in CSV')

        if should_clear:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Sale.objects.all().delete()
            Product.objects.all().delete()
            Customer.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        # Step 1: Create Products from unique items
        self.stdout.write('\n--- Creating Products ---')
        product_cache = {}
        products_created = 0

        unique_items = set(
            (row['Item'].strip(), row['Category'].strip(), row['Item ID'].strip())
            for row in rows
        )

        for item_name, category, item_id in unique_items:
            # Get all unit prices for this product to calculate average
            prices = [
                Decimal(row['Unit Price'].strip())
                for row in rows
                if row['Item'].strip() == item_name
            ]
            avg_price = sum(prices) / len(prices) if prices else Decimal('100.00')

            # Use Product Base Margin if available, otherwise estimate at 40%
            margins = [
                Decimal(row['Product Base Margin'].strip().rstrip('%'))
                for row in rows
                if row['Item'].strip() == item_name and row['Product Base Margin'].strip()
            ]
            avg_margin = sum(margins) / len(margins) if margins else Decimal('40')
            margin_pct = avg_margin / Decimal('100')
            cost_price = avg_price * (Decimal('1') - margin_pct)

            mapped_category = CATEGORY_MAP.get(category, 'other')

            product, created = Product.objects.get_or_create(
                name=item_name,
                defaults={
                    'category': mapped_category,
                    'cost_price': cost_price.quantize(Decimal('0.01')),
                    'selling_price': avg_price.quantize(Decimal('0.01')),
                    'sku': item_id,
                    'description': f'{item_name} - {category}',
                }
            )

            product_cache[item_name] = product
            if created:
                products_created += 1

        self.stdout.write(self.style.SUCCESS(f'Products: {products_created} created, {len(product_cache)} total'))

        # Step 2: Create Customers
        self.stdout.write('\n--- Creating Customers ---')
        customers_created = 0
        customer_cache = {}

        unique_customers = set(
            (row['Customer ID'].strip(), row['Customer Name'].strip(), row['Customer Segment'].strip(), row['City'].strip(), row['State'].strip())
            for row in rows
        )

        for cust_id, cust_name, segment, city, state in unique_customers:
            email = re.sub(r'[^a-zA-Z0-9]', '.', cust_name).lower() + '@example.com'
            customer, created = Customer.objects.get_or_create(
                email=email,
                defaults={
                    'name': cust_name,
                    'city': city,
                    'country': state,
                    'segment': segment,
                }
            )
            customer_cache[cust_id] = customer
            if created:
                customers_created += 1

        self.stdout.write(self.style.SUCCESS(f'Customers: {customers_created} created, {Customer.objects.count()} total'))

        # Step 3: Create Sales
        self.stdout.write('\n--- Creating Sales ---')
        sales_created = 0
        batch_size = 500
        sale_objects = []

        for i, row in enumerate(rows):
            item_name = row['Item'].strip()
            cust_id = row['Customer ID'].strip()
            region = row['Region'].strip()
            order_date_str = row['Order Date'].strip()

            try:
                order_date = datetime.strptime(order_date_str, '%m/%d/%Y')
                order_date = timezone.make_aware(order_date, timezone=timezone.utc)
            except (ValueError, IndexError):
                order_date = timezone.now()

            quantity = int(row['Order Quantity'].strip())
            sales_amount = Decimal(row['Sales'].strip())
            profit = Decimal(row['Profit'].strip())
            discount = Decimal(row['Discount'].strip())

            product = product_cache.get(item_name)
            if not product:
                continue

            customer = customer_cache.get(cust_id)
            if not customer:
                continue

            sale_objects.append(
                Sale(
                    customer=customer,
                    product=product,
                    quantity=quantity,
                    sales_amount=sales_amount,
                    profit=profit,
                    discount=discount,
                    region=region,
                    order_date=order_date,
                )
            )

            if len(sale_objects) >= batch_size:
                Sale.objects.bulk_create(sale_objects, ignore_conflicts=True)
                sales_created += len(sale_objects)
                self.stdout.write(f'  Created {sales_created} sales records...')
                sale_objects = []

        if sale_objects:
            Sale.objects.bulk_create(sale_objects, ignore_conflicts=True)
            sales_created += len(sale_objects)

        self.stdout.write(self.style.SUCCESS(f'Sales: {sales_created} records created successfully!'))

        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('IMPORT SUMMARY'))
        self.stdout.write(f'  Products:  {Product.objects.count()}')
        self.stdout.write(f'  Customers: {Customer.objects.count()}')
        self.stdout.write(f'  Sales:     {Sale.objects.count()}')
        self.stdout.write('=' * 50)
