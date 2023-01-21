import json
import boto3
import uuid

from ammy_inventory.apigateway import Response
from ammy_inventory.apis.models.records import RecordInput, update_records


def post_record(payload):
    try:
        payload: RecordInput = RecordInput.from_dict(payload)

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyInventoryTable')
        record_id = str(uuid.uuid1())
        newRecord = {"id": record_id, "date": payload.date, "count": payload.count,
                     "price": payload.price, "type": payload.type.value}

        response = table.get_item(
            Key={'id': payload.product_id}, AttributesToGet=['records'])
        product = response['Item']

        records = json.loads(product['records'])
        records.append(newRecord)

        records.sort(key=lambda x: (x['type'], x['date']))

        update_records(records, table, payload.product_id)

        return Response(status_code=200, body={'id': record_id})

    except Exception as e:
        return Response(status_code=400, body={'message': 'Invalid Request'})
