from dataclasses import dataclass
from dataclasses_json import dataclass_json
from typing import Optional

@dataclass_json
@dataclass
class Product:
    img: str
    sku: str
    name: str
    remark: str
    product_id: Optional[str] = None