import math

def calculate_pallets(items):
    """
    計算疊疊樂所需的棧板位。
    
    規則：
    1. 高度 <= 31 吋：疊三粒 (3 items/pallet)
    2. 高度 > 31 吋：疊二粒 (2 items/pallet)
    
    items: list of tuples (height, count)
    """
    le_31_count = 0
    gt_31_count = 0
    
    for height, count in items:
        if height <= 31:
            le_31_count += count
        else:
            gt_31_count += count
            
    pallets_le_31 = math.ceil(le_31_count / 3)
    pallets_gt_31 = math.ceil(gt_31_count / 2)
    
    return {
        "le_31_items": le_31_count,
        "le_31_pallets": pallets_le_31,
        "gt_31_items": gt_31_count,
        "gt_31_pallets": pallets_gt_31,
        "total_pallets": pallets_le_31 + pallets_gt_31
    }

# 使用範例：
# items = [(27, 8), (31, 10), (33, 9), (48, 2)]
# print(calculate_pallets(items))
