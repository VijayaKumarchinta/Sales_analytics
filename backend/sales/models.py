from django.db import models


class Sale(models.Model):
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='sales')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='sales')
    quantity = models.IntegerField(default=1)
    sales_amount = models.DecimalField(max_digits=12, decimal_places=2)
    profit = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    region = models.CharField(max_length=100, db_index=True)
    order_date = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sales'
        ordering = ['-order_date']
        indexes = [
            models.Index(fields=['region', 'order_date']),
            models.Index(fields=['order_date']),
        ]

    def __str__(self):
        return f"Sale #{self.id} - {self.product.name} x {self.quantity}"
