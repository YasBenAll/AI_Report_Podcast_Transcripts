from flask import Flask, jsonify, abort, request
import os
from urllib.parse import unquote
from flask_cors import CORS

app = Flask(__name__)
# Define the directory that holds the transcripts
TRANSCRIPTS_DIR = os.path.join(os.path.dirname(__file__), 'transcripts')

def is_safe_filename(filename):
    """
    Basic check to avoid path traversal. Returns True if filename does not include 
    dangerous patterns like '..' or leading '/'.
    """
    return not ('..' in filename or filename.startswith('/'))

@app.route('/api/transcript/episode_name', methods=['GET'])
def list_episodes():
    """
    Lists all transcript files in the TRANSCRIPTS_DIR.
    Returns a JSON list of objects containing the actual filename and a display name
    (filename without the .txt extension).
    """
    episodes = []
    for filename in os.listdir(TRANSCRIPTS_DIR):
        if filename.endswith('.txt'):
            # For display, you might strip the extension
            display_name = filename.rsplit('.', 1)[0]
            episodes.append({'filename': filename, 'name': display_name})
    return jsonify(episodes)

@app.route('/api/transcripts/<path:filename>', methods=['GET'])
def get_transcript(filename):
    """
    Returns the content of the specified transcript file.
    The filename is URL-decoded and checked for basic safety before being used.
    """
    decoded_filename = unquote(filename)
    if not is_safe_filename(decoded_filename):
        abort(400, description="Invalid filename")
    
    file_path = os.path.join(TRANSCRIPTS_DIR, decoded_filename)
    if not os.path.exists(file_path):
        abort(404, description="Transcript not found")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return jsonify({'content': content})

@app.route('/api/search', methods=['GET'])
def search_transcripts():
    query = request.args.get('query', '').lower()
    if not query:
        return jsonify([])

    results = []
    for filename in os.listdir(TRANSCRIPTS_DIR):
        if filename.endswith('.txt'):
            file_path = os.path.join(TRANSCRIPTS_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                youtube_code = None
                if 'Youtube video code:' in content:
                    for line in content.split('\n'):
                        if line.startswith('Youtube video code:'):
                            youtube_code = line.split(':')[1].strip()
                            break
                if query in content.lower():
                    snippets = []
                    lines = content.split('\n')
                    for line in lines:
                        if query in line.lower():
                            snippets.append(line.strip())
                    results.append({
                        'filename': filename,
                        'snippets': snippets,
                        'youtubeCode': youtube_code
                    })
    return jsonify(results)
