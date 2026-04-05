import random

items_list = [
    2.3, 2.3,
    2.4, 2.4, 2.4, 2.4,
    2.45, 2.45, 2.45, 2.45, 2.45,
    2.5, 2.5, 2.5, 2.5,
    2.55, 2.55,
    2.6,
    2.67, 2.67,
    2.7, 2.7, 2.7,
    2.75,
    2.8, 2.8,
    2.85,
    2.9, 2.9,
    3.05,
    3.3, 3.3,
    3.4,
    3.45,
    3.5, 3.5
]
capacity = 10.8
cap_i = int(round(capacity * 100))
items_i = [int(round(x * 100)) for x in items_list]

def solve_ffd(items_to_pack):
    bins = []
    for item in items_to_pack:
        placed = False
        for b in bins:
            if sum(b) + item <= cap_i:
                b.append(item)
                placed = True
                break
        if not placed:
            bins.append([item])
    return bins

items_i.sort(reverse=True)
best_bins = solve_ffd(items_i)
best_len = len(best_bins)
# Optimize to concentrate waste on one or two rolls
best_score = sum((cap_i - sum(b))**3 for b in best_bins)

for _ in range(50000): 
    shuffled = items_i.copy()
    shuffled.sort(key=lambda x: x + random.uniform(-200, 200), reverse=True)
    bins = solve_ffd(shuffled)
    if len(bins) < best_len:
        best_len = len(bins)
        best_bins = bins
        best_score = sum((cap_i - sum(b))**3 for b in bins)
    elif len(bins) == best_len:
        score = sum((cap_i - sum(b))**3 for b in bins)
        if score > best_score:
            best_score = score
            best_bins = bins

print(f"TOTAL_BINS: {best_len}")
sorted_bins = sorted(best_bins, key=lambda b: sum(b), reverse=True)
for idx, b in enumerate(sorted_bins):
    s = sum(b)
    arr = [x/100.0 for x in b]
    print(f"Roll {idx+1}: {arr} | Used: {s/100.0:.2f} | Waste: {(cap_i - s)/100.0:.2f}")
