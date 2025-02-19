from flask import Flask, request, jsonify
import os
import json
import os
import re

app = Flask(__name__)

def get_metadata():
    # TODO
    pass

def get_episode(episode_name):
    # TODO
    pass

@app.route("/api/python")
def hello_world():
    return "<p>Zeg maar Willy.</p>"

@app.route("/api/episode_data/<episodeName>")
def episode_data(episodeName):
    # TODO 
    pass

@app.route("/api/episode_name")
def episode_name():
    # TODO
    pass

# Path to the transcript folder
TRANSCRIPT_FOLDER = "TODO"

@app.route('/api/search', methods=['GET'])
def search():
    # TODO 
    pass