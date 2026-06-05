"""
Management command to import sales data from sales_analytics_USD.csv
into the Product, Customer, and Sale models.

Usage:
    python manage.py import_sales_data
    python manage.py import_sales_data --csv path/to/file.csv
    python manage.py import_sales_data --clear  # Clear existing data before import
"""
import csv
import os
import random
from datetime import datetime, timezone
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


from products.models import Product
from customers.models import Customer
from sales.models import Sale


# Product-to-category mapping
PRODUCT_CATEGORIES = {
    'Headphones': 'electronics',
    'Laptop': 'electronics',
    'Monitor': 'electronics',
    'Keyboard': 'electronics',
    'Smartphone': 'electronics',
    'Tablet': 'electronics',
}

# Month name to number mapping
MONTHS = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12,
}

# Region to customer name mapping
REGION_CUSTOMERS = {
    'North': {'name': 'Northern Corp', 'email': 'north@example.com', 'city': 'Chicago', 'country': 'USA'},
    'South': {'name': 'Southern Enterprises', 'email': 'south@example.com', 'city': 'Atlanta', 'country': 'USA'},
    'East': {'name': 'Eastern Trading Co', 'email': 'east@example.com', 'city': 'New York', 'country': 'USA'},
    'West': {'name': 'West Coast Solutions', 'email': 'west@example.com', 'city': 'San Francisco', 'country': 'USA'},
}


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

        if should_clear:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Sale.objects.all().delete()
            Product.objects.all().delete()
            Customer.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        # Parse CSV
        rows = []
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)

        self.stdout.write(f'Found {len(rows)} records in CSV')

        # Step 1: Create Products
        self.stdout.write('\n--- Creating Products ---')
        products_created = 0
        product_cache = {}

        unique_products = set(r['Product'].strip() for r in rows)
        for product_name in unique_products:
            # Calculate average unit price for this product to set selling_price
            prices = [
                Decimal(r['Unit_Price_USD'].strip())
                for r in rows
                if r['Product'].strip() == product_name
            ]
            avg_price = sum(prices) / len(prices) if prices else Decimal('100.00')
            cost_price = avg_price * Decimal('0.6')  # Estimate cost as 60% of selling price

            category = PRODUCT_CATEGORIES.get(product_name, 'other')

            product, created = Product.objects.get_or_create(
                name=product_name,
                defaults={
                    'category': category,
                    'cost_price': cost_price.quantize(Decimal('0.01')),
                    'selling_price': avg_price.quantize(Decimal('0.01')),
                    'description': f'{product_name} - imported from sales data',
                }
            )

            product_cache[product_name] = product
            if created:
                products_created += 1
                self.stdout.write(f'  Created product: {product.name} ({category})')

        self.stdout.write(self.style.SUCCESS(f'Products: {products_created} created, {len(product_cache)} total'))

        # Step 2: Create Customers (one per region)
        self.stdout.write('\n--- Creating Customers ---')
        customers_created = 0
        customer_cache = {}

        for region, info in REGION_CUSTOMERS.items():
            customer, created = Customer.objects.get_or_create(
                email=info['email'],
                defaults={
                    'name': info['name'],
                    'city': info['city'],
                    'country': info['country'],
                    'segment': 'Standard',
                }
            )
            customer_cache[region] = customer
            if created:
                customers_created += 1
                self.stdout.write(f'  Created customer: {customer.name} ({region})')

        # Also create a few more random customers for variety
        extra_customers_data = [
            {'name': 'Mega Retail Inc', 'email': 'mega@example.com', 'city': 'Dallas', 'country': 'USA', 'segment': 'Premium'},
            {'name': 'Global Distributors', 'email': 'global@example.com', 'city': 'Seattle', 'country': 'USA', 'segment': 'Premium'},
            {'name': 'Value Mart', 'email': 'value@example.com', 'city': 'Miami', 'country': 'USA', 'segment': 'Standard'},
            {'name': 'Corner Shop', 'email': 'corner@example.com', 'city': 'Boston', 'country': 'USA', 'segment': 'Basic'},
            {'name': 'TechWorld Ltd', 'email': 'techworld@example.com', 'city': 'Austin', 'country': 'USA', 'segment': 'Premium'},
        ]
        for info in extra_customers_data:
            Customer.objects.get_or_create(
                email=info['email'],
                defaults={
                    'name': info['name'],
                    'city': info['city'],
                    'country': info['country'],
                    'segment': info['segment'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Customers: {Customer.objects.count()} total'))

        # Step 3: Create Sales
        self.stdout.write('\n--- Creating Sales ---')
        sales_created = 0
        batch_size = 200
        sale_objects = []

        all_customers = list(Customer.objects.all())

        for i, row in enumerate(rows):
            product_name = row['Product'].strip()
            region = row['Region'].strip()
            month_str = row['Month'].strip()
            units_sold = int(row['Units_Sold'].strip())
            unit_price = Decimal(row['Unit_Price_USD'].strip())
            discount_pct = Decimal(row['Discount_%'].strip())
            revenue = Decimal(row['Revenue_USD'].strip())

            # Calculate cost and profit
            product = product_cache[product_name]
            total_cost = product.cost_price * units_sold
            profit = revenue - total_cost

            # Parse date: assume all in 2024 for simplicity, use 15th as day
            month_num = MONTHS.get(month_str, 1)
            order_date = datetime(2024, month_num, 15, 12, 0, 0, tzinfo=timezone.utc)

            # Assign a customer - prefer region-based, then random
            if region in customer_cache:
                customer = customer_cache[region]
            else:
                customer = random.choice(all_customers)

            sale = Sale(
                customer=customer,
                product=product,
                quantity=units_sold,
                sales_amount=revenue,
                profit=profit,
                discount=discount_pct,
                region=region,
                order_date=order_date,
            )
            sale_objects.append(sale)

            # Batch create for performance
            if len(sale_objects) >= batch_size:
                Sale.objects.bulk_create(sale_objects, ignore_conflicts=True)
                sales_created += len(sale_objects)
                self.stdout.write(f'  Created {sales_created} sales records...')
                sale_objects = []

        # Create remaining
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
