from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('clothing', 'Clothing'),
        ('home_garden', 'Home & Garden'),
        ('sports', 'Sports'),
        ('books', 'Books'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['name']

    @property
    def profit_margin(self):
        if self.selling_price:
            return ((self.selling_price - self.cost_price) / self.selling_price) * 100
        return 0

    def __str__(self):
        return self.name
