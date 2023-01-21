import json
from dataclasses import dataclass
from dataclasses_json import dataclass_json
from typing import Optional
from ammy_inventory.apis.utils import JSONEnum

class OrderType(JSONEnum):
    Order = 0
    Sale = 1
    Change = 2

@dataclass_json
@dataclass
class RecordInput:
    product_id: str
    type: OrderType
    date: int
    count: int
    price: int
    record_id: Optional[str] = None

def update_records(records, table, product_id):
    inventoryLevel = 0
    orderValue = 0
    orderCount = 0
    for record in records:
        inventoryLevel += record['count']
        if record['type'] == OrderType.Order.value:
            orderValue += record['count'] * record['price']
            orderCount += record['count']
    inventoryValue = (round(orderValue / orderCount) * inventoryLevel) if orderCount > 0 else 0
    inventoryStatus = (0 if inventoryLevel / orderCount > 0.25 else 1) if orderCount > 0 else 0

    table.update_item(
        Key={'id': product_id},
        UpdateExpression="set records = :records, inventory_status = :inventory_status, inventory_level = :inventory_level, inventory_value = :inventory_value",
        ExpressionAttributeValues={':records': json.dumps(records), ':inventory_status': inventoryStatus, ':inventory_level': inventoryLevel, ':inventory_value': inventoryValue})
