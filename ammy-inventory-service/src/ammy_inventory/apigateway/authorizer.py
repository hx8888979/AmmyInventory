import os
import jwt
from http.cookies import SimpleCookie

secret = os.environ.get('JWT_SECRET') or 'secret'

def lambda_handler(event, context):
    try:
        token = event['headers']['Cookie']
        cookies = SimpleCookie()
        cookies.load(token)
        if 'ACTOKEN' not in cookies:
            raise Exception('Unauthorized')
        token = cookies['ACTOKEN'].value
        payload = jwt.decode(token, secret, algorithms="HS256")
    except:
        raise Exception('Unauthorized')

    return {
        'principalId': payload['sub'],
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [{
                'Action': 'execute-api:Invoke',
                'Effect': 'Allow',
                'Resource': '*'
            }]
        }
    }
