import json
import boto3
from typing import List
from ammy_inventory.apigateway import Response
from ammy_inventory.apis.models.records import update_records

def delete_record(payload):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyInventoryTable')

        response = table.get_item(Key={'id': payload['product_id']}, AttributesToGet = ['records'])
        product = response['Item']

        records: List[dict] = json.loads(product['records'])
        record = next(iter([index for (index, record) in enumerate(records) if record["id"] == payload['record_id']]), None)
        if record is None:
            return Response(status_code=404, body={'message': 'not found'})
        
        records.pop(record)
        records.sort(key=lambda x: (x['type'], x['date']))

        update_records(records, table, payload['product_id'])

        return Response(status_code=200, body={'message': 'OK'})

    except Exception as e:
        return Response(status_code=400, body={'message': 'Invalid Request'})