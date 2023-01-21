import json
import boto3
from typing import List
from ammy_inventory.apigateway import Response
from ammy_inventory.apis.models.records import RecordInput, update_records

def update_record(payload):
    try:
        payload: RecordInput = RecordInput.from_dict(payload)

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyInventoryTable')
        newRecord = {"date": payload.date, "count": payload.count,
                     "price": payload.price, "type": payload.type.value}

        response = table.get_item(Key={'id': payload.product_id}, AttributesToGet = ['records'])
        product = response['Item']

        records: List[dict] = json.loads(product['records'])
        record: dict = next(filter(lambda x: x['id'] == payload.record_id, records), None)
        if record is None:
            return Response(status_code=404, body={'message': 'not found'})
        
        record.update(newRecord)
        records.sort(key=lambda x: (x['type'], x['date']))

        update_records(records, table, payload.product_id)

        return Response(status_code=200, body={'message': 'OK'})

    except Exception as e:
        return Response(status_code=400, body={'message': 'Invalid Request'})