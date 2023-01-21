import io
import imghdr
from base64 import b64decode

def update_image(img, product_id, boto_session):
    img = io.BytesIO(b64decode(img))
    extension = imghdr.what(img)
    imgName = f'{product_id}.{extension}'
    s3 = boto_session.resource('s3')
    s3.Bucket('ammy-image-bucket').put_object(
        Key=imgName,
        Body=img,
        ContentType=f'image/{extension}'
    )
    return imgName