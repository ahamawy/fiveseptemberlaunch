# Standard CSV Formats (Reference)

## Investor List (with discounts)

```csv
Investor Name,Email,Gross Capital,Structuring Discount %,Management Discount %,Admin Discount %
John Doe,john@example.com,100000,50,0,100
Jane Smith,jane@example.com,75000,0,0,0
```

## Fee Schedule (by component)

```csv
Component,Rate,Basis,Precedence
PREMIUM,3.77358,GROSS,1
STRUCTURING,4.0,GROSS,2
MANAGEMENT,2.0,GROSS,3
ADMIN,450,FIXED,4
```

## Transactions (example)

```csv
Transaction ID,Investor,Deal,Amount,Date,Type
1,John Doe,GRQAI,100000,2025-07-01,commitment
```
