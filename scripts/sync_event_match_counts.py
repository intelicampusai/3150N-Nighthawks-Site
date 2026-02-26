
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AWS DynamoDB Configuration
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = 'vex5hub-data'
table = dynamodb.Table(TABLE_NAME)

def sync_event_match_counts():
    logger.info("Starting match count sync...")
    
    # 1. Fetch all events for season 197 to get their start dates and SKUs
    season_id = '197'
    events_resp = table.query(
        KeyConditionExpression=Key('PK').eq(f'SEASON#{season_id}') & Key('SK').begins_with('EVENT#')
    )
    events = events_resp.get('Items', [])
    logger.info(f"Fount {len(events)} events for season {season_id}")

    for event in events:
        sku = event.get('sku')
        start_date = event.get('start')
        if not sku or not start_date:
            continue
            
        logger.info(f"Processing SKU: {sku}")
        
        # 2. Count matches for this event
        match_query = table.query(
            KeyConditionExpression=Key('PK').eq(f'EVENT#{sku}') & Key('SK').begins_with('MATCH#'),
            Select='COUNT'
        )
        match_count = match_query.get('Count', 0)
        
        if match_count > 0:
            logger.info(f"Found {match_count} matches for {sku}. Updating record...")
            
            # 3. Update the seasonal event item
            table.update_item(
                Key={'PK': f'SEASON#{season_id}', 'SK': f'EVENT#{start_date}#{sku}'},
                UpdateExpression="SET match_count = :val",
                ExpressionAttributeValues={':val': Decimal(str(match_count))}
            )
            
            # 4. Update the metadata item
            try:
                table.update_item(
                    Key={'PK': f'EVENT#{sku}', 'SK': 'METADATA'},
                    UpdateExpression="SET match_count = :val",
                    ExpressionAttributeValues={':val': Decimal(str(match_count))}
                )
            except Exception as e:
                logger.warning(f"Metadata item not found for {sku} or update failed: {e}")
        else:
            logger.info(f"No matches for {sku}, skipping update.")

    logger.info("Match count sync complete.")

if __name__ == "__main__":
    sync_event_match_counts()
