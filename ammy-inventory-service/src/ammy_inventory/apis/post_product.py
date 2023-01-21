import io
import boto3
import uuid
import imghdr
from base64 import b64decode
from ammy_inventory.apigateway import Response
from ammy_inventory.apis.models.images import update_image
from ammy_inventory.apis.models.products import Product


def post_product(payload):
    try:
        payload: Product = Product.from_dict(payload)

        new_id = str(uuid.uuid1())
        imgName = update_image(payload.img, new_id, boto3.session.Session())

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyInventoryTable')

        item = {
            'id': new_id,
            'sku': payload.sku,
            'product_name': payload.name,
            'img': imgName,
            'records': '[]',
            'inventory_status': 0,
            'inventory_level': 0,
            'inventory_value': 0,
            'remark': payload.remark,
        }

        table.put_item(Item=item)

        return Response(status_code=200, body={'id': item['id']})

    except Exception as e:
        return Response(status_code=400, body={'message': 'Invalid Request'})
