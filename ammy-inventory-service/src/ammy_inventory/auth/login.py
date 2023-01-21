import boto3
import os
import jwt
import time

from ammy_inventory.apigateway import Response, Cookie, SameSite

secret = os.environ.get('JWT_SECRET') or 'secret'


def login(payload):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyUserTable')

        response = table.get_item(
            Key={'id': payload['username']}, AttributesToGet=['id', 'password'])

        if 'Item' in response:
            user = response['Item']
            if user['password'] == payload['password']:
                actoken = jwt.encode(
                    {
                        'sub': user['id'],
                        'iat': int(time.time()),
                    },
                    secret,
                    algorithm='HS256'
                )
                print(f'{user["id"]} logged in')
                return Response(
                    status_code=200,
                    body={'message': 'OK', 'expiry': int(
                        time.time()*1000) + 3600000},
                    cookies=[
                        Cookie('ACTOKEN', actoken, max_age=3600,
                               http_only=True, same_site=SameSite.NONE_MODE),
                    ])

        return Response(status_code=401, body={'message': 'Unauthorized'})
    except Exception:
        return Response(status_code=400, body={'message': 'Invalid Request'})
