
import json
import boto3
import urllib.request
from datetime import datetime
import os

# --- Configuration ---
EVENT_SKU = "RE-V5RC-25-0165" # Kalahari Classic Middle School
API_BASE_URL = "https://www.robotevents.com/api/v2"

# Verified Reference Point (from manual research)
# Match: R16 3-1 (3150N vs ...)
# Video URL: https://www.youtube.com/watch?v=k5bKDk28BQ8
# Video Timestamp: 16070s (4h 27m 50s)
REF_MATCH_NAME = "R16 #3-1" 
REF_VIDEO_ID = "k5bKDk28BQ8"
REF_VIDEO_TIMESTAMP = 16070 

def get_api_key():
    print("Fetching API Key from Secrets Manager...")
    try:
        session = boto3.Session(profile_name='rdp')
        client = session.client('secretsmanager', region_name='ca-central-1')
        secret = client.get_secret_value(SecretId='vex5hub/robotevents-api-key')
        return json.loads(secret['SecretString'])['api_key']
    except Exception as e:
        print(f"Error fetching API key: {e}")
        return None

import ssl

def fetch_matches(api_key, sku):
    # Setup SSL context
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # 1. Get Event ID
    print(f"Fetching Event ID for {sku}...")
    url = f"{API_BASE_URL}/events?sku[]={sku}"
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json',
        'User-Agent': 'Vex5Hub/1.0 (internal-tool)'
    })
    
    event_data = None
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            data = json.loads(resp.read().decode())
            if data['data']:
                event_data = data['data'][0]
                print(f"Found Event ID: {event_data['id']}")
                # print("Event Data:", json.dumps(event_data, indent=2))
            else:
                print(f"Event {sku} not found!")
                return [], None
    except Exception as e:
        print(f"Error fetching event: {e}")
        return [], None

    event_id = event_data['id']
    print(f"Fetching matches for event {event_id}...")
    matches = []
    page = 1
    
    # Try fetching matches directly using event ID
    while True:
        url = f"{API_BASE_URL}/events/{event_id}/matches?page={page}&per_page=250"
        req = urllib.request.Request(url, headers={
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json',
             'User-Agent': 'Vex5Hub/1.0 (internal-tool)'
        })
        try:
            with urllib.request.urlopen(req, context=ctx) as resp:
                data = json.loads(resp.read().decode())
                if not data['data']: break
                matches.extend(data['data'])
                print(f"Fetched page {page} ({len(data['data'])} matches)")
                last_page = data.get('meta', {}).get('last_page', 1)
                current_page = data.get('meta', {}).get('current_page', 1)
                if current_page >= last_page: break
                page += 1
        except Exception as e:
            print(f"Error fetching matches: {e}")
            break

    # If direct fetch fails (sometimes requires divisions), try iterating divisions
    if not matches:
        print("Direct match fetch failed or returned 0, trying via divisions from event data...")
        divisions = event_data.get('divisions', [])
        
        for div in divisions:
            div_id = div['id']
            print(f"Fetching matches for Division {div['name']} ({div_id})...")
            page = 1
            while True:
                url = f"{API_BASE_URL}/events/{event_id}/divisions/{div_id}/matches?page={page}&per_page=250"
                req = urllib.request.Request(url, headers={
                    'Authorization': f'Bearer {api_key}',
                    'Accept': 'application/json',
                     'User-Agent': 'Vex5Hub/1.0 (internal-tool)'
                })
                try:
                    with urllib.request.urlopen(req, context=ctx) as resp:
                        data = json.loads(resp.read().decode())
                        if not data['data']: break
                        matches.extend(data['data'])
                        print(f"Fetched page {page} ({len(data['data'])} matches)")
                        if data['meta']['current_page'] >= data['meta']['last_page']: break
                        page += 1
                except Exception as e:
                    print(f"Error fetching matches: {e}")
                    break                
    return matches, event_data

def generate_links():
    api_key = get_api_key()
    if not api_key: return

    matches, event_data = fetch_matches(api_key, EVENT_SKU)
    if not matches:
        print("No matches found.")
        return

    print(f"Total matches found: {len(matches)}")
    
    # Stream Configs
    STREAMS = {
        "2026-01-21": {
            "video_id": "uZLlramgfoQ",
            "ref_match_name": "Qualifier #1",
            "ref_timestamp": 695 
        },
        "2026-01-22": {
            "video_id": "k5bKDk28BQ8",
            "ref_match_name": "R16 #3-1",
            "ref_timestamp": 16070
        }
    }

    # Pre-calculate video starts
    video_starts = {}
    for date_str, cfg in STREAMS.items():
        ref_match = next((m for m in matches if m['name'] == cfg['ref_match_name']), None)
        if ref_match and ref_match.get('started'):
            ref_start_dt = datetime.fromisoformat(ref_match['started'].replace('Z', '+00:00'))
            video_starts[date_str] = ref_start_dt.timestamp() - cfg['ref_timestamp']
            print(f"Calculated Video Start for {date_str}: {video_starts[date_str]}")
        else:
            print(f"Warning: Reference match '{cfg['ref_match_name']}' not found for {date_str}")

    links = {}
    
    # 2. Calculate Links for All Matches
    for match in matches:
        if not match.get('started'): continue
        
        match_start_iso = match['started']
        match_start_dt = datetime.fromisoformat(match_start_iso.replace('Z', '+00:00'))
        date_str = match_start_dt.strftime('%Y-%m-%d')

        if date_str not in STREAMS or date_str not in video_starts:
            # print(f"Skipping match {match['name']} on {date_str} (no stream config)")
            continue
            
        cfg = STREAMS[date_str]
        video_start_ts = video_starts[date_str]
        
        # Calculate timestamp offset
        timestamp = int(match_start_dt.timestamp() - video_start_ts)
        
        # Sanity check: timestamp must be positive
        if timestamp < 0: continue
        
        video_url = f"https://www.youtube.com/watch?v={cfg['video_id']}&t={timestamp}s"
        
        links[match['id']] = {
            "match_id": match['id'],
            "match_name": match['name'],
            "video_url": video_url,
            "timestamp": timestamp,
            "alliances": match.get('alliances'),
            "round": match.get('round'),
            "instance": match.get('instance'),
            "matchnum": match.get('matchnum'),
            "division_id": match.get('division', {}).get('id'),
            "started": match.get('started'),
            "scheduled": match.get('scheduled'),
            "field": match.get('field'),
            "event": {
                "id": event_data['id'],
                "name": event_data['name'],
                "sku": event_data['sku']
            }
        }

    print(f"Generated links for {len(links)} matches.")
    
    # Save to file
    with open('match_links.json', 'w') as f:
        json.dump(links, f, indent=2)
    print("Saved to match_links.json")

if __name__ == "__main__":
    generate_links()
