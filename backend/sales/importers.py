import csv
import os
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal

from django.utils import timezone as tz_utils

from products.models import Product
from customers.models import Customer
from sales.models import Sale


PRODUCT_CATEGORIES = {
    'Headphones': 'electronics',
    'Laptop': 'electronics',
    'Monitor': 'electronics',
    'Keyboard': 'electronics',
    'Smartphone': 'electronics',
    'Tablet': 'electronics',
}

MONTHS = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12,
}

REGION_CUSTOMERS = {
    'North': {'name': 'Northern Corp', 'email': 'north@example.com', 'city': 'Chicago', 'country': 'USA'},
    'South': {'name': 'Southern Enterprises', 'email': 'south@example.com', 'city': 'Atlanta', 'country': 'USA'},
    'East': {'name': 'Eastern Trading Co', 'email': 'east@example.com', 'city': 'New York', 'country': 'USA'},
    'West': {'name': 'West Coast Solutions', 'email': 'west@example.com', 'city': 'San Francisco', 'country': 'USA'},
}


@dataclass
class ImportResult:
    products: int
    customers: int
    sales: int
    csv_records: int


class SalesDataImporter:
    """Reusable importer that populates Product, Customer, and Sale from the sales CSV."""

    @staticmethod
    def parse_csv_rows(csv_file):
        """csv_file: file-like object opened in text mode."""
        reader = csv.DictReader(csv_file)
        rows = []
        for row in reader:
            rows.append(row)
        return rows

    @staticmethod
    def import_from_rows(rows, *, clear=False) -> ImportResult:
        if clear:
            Sale.objects.all().delete()
            Product.objects.all().delete()
            Customer.objects.all().delete()

        # Step 1: Create Products
        unique_products = set((r['Product'] or '').strip() for r in rows)

        product_cache = {}
        products_created = 0

        for product_name in unique_products:
            prices = [
                Decimal((r['Unit_Price_USD'] or '').strip())
                for r in rows
                if (r.get('Product') or '').strip() == product_name
            ]
            avg_price = sum(prices) / len(prices) if prices else Decimal('100.00')
            cost_price = avg_price * Decimal('0.6')
            category = PRODUCT_CATEGORIES.get(product_name, 'other')

            product, created = Product.objects.get_or_create(
                name=product_name,
                defaults={
                    'category': category,
                    'cost_price': cost_price.quantize(Decimal('0.01')),
                    'selling_price': avg_price.quantize(Decimal('0.01')),
                    'description': f'{product_name} - imported from sales data',
                },
            )
            product_cache[product_name] = product
            if created:
                products_created += 1

        # Step 2: Create Customers (one per region)
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
                },
            )
            customer_cache[region] = customer
            if created:
                customers_created += 1

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
                },
            )

        # Step 3: Create Sales
        all_customers = list(Customer.objects.all())
        sales_created = 0

        batch_size = 200
        sale_objects = []

        for i, row in enumerate(rows):
            product_name = (row['Product'] or '').strip()
            region = (row['Region'] or '').strip()
            month_str = (row['Month'] or '').strip()
            units_sold = int((row['Units_Sold'] or '').strip())
            unit_price = Decimal((row['Unit_Price_USD'] or '').strip())
            discount_pct = Decimal((row['Discount_%'] or '').strip())
            revenue = Decimal((row['Revenue_USD'] or '').strip())

            product = product_cache[product_name]
            total_cost = product.cost_price * units_sold
            profit = revenue - total_cost

            now = tz_utils.now()
            month_num = MONTHS.get(month_str, 1)
            year = now.year
            if month_num > now.month:
                year -= 1
            order_date = datetime(year, month_num, 15, 12, 0, 0, tzinfo=timezone.utc)

            if region in customer_cache:
                customer = customer_cache[region]
            else:
                customer = random.choice(all_customers)

            sale_objects.append(
                Sale(
                    customer=customer,
                    product=product,
                    quantity=units_sold,
                    sales_amount=revenue,
                    profit=profit,
                    discount=discount_pct,
                    region=region,
                    order_date=order_date,
                )
            )

            if len(sale_objects) >= batch_size:
                Sale.objects.bulk_create(sale_objects, ignore_conflicts=True)
                sales_created += len(sale_objects)
                sale_objects = []

        if sale_objects:
            Sale.objects.bulk_create(sale_objects, ignore_conflicts=True)
            sales_created += len(sale_objects)

        return ImportResult(
            products=Product.objects.count(),
            customers=Customer.objects.count(),
            sales=Sale.objects.count(),
            csv_records=len(rows),
        )

