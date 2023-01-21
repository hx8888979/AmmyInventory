import json
from enum import Enum

class JSONEnum(Enum):
    def toJson(self):
        return json.dumps(self, default=lambda o: o.value)