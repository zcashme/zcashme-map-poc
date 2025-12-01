import pandas as pd
import random

# Load CSV
df = pd.read_csv("zks_users_with_cities.csv")

def build_url(row):
    base = "https://zcash.me/"
    name = row["name"]

    # Use lowercase name if it's alphabetic; otherwise use id
    if isinstance(name, str) and name.isalpha():
        return base + name.lower()
    else:
        return base + str(row["id"])

df["profileurl"] = df.apply(build_url, axis=1)

# Random category assignment
categories = ["Business", "Personal", "Organization"]
df["categories"] = [random.choice(categories) for _ in range(len(df))]

# Save result
df.to_csv("zks_users_with_cities.csv", index=False)

print(df)
