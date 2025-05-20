import json
import os
import re
from datetime import datetime

def update_transcript_dates(home_directory):
    """
    Updates the 'Last modified time' in transcript files based on release dates
    from poki-metadata.json.

    Args:
        home_directory (str): The path to the user's home directory
                              where 'transcripts' and 'poki-metadata.json' are located.
    """

    transcripts_folder = os.path.join(home_directory, 'transcripts_test')
    metadata_file = os.path.join(home_directory, 'poki-metadata.json')

    if not os.path.exists(transcripts_folder):
        print(f"Error: Transcripts folder not found at {transcripts_folder}")
        return
    if not os.path.exists(metadata_file):
        print(f"Error: Metadata file not found at {metadata_file}")
        return

    # Load metadata from poki-metadata.json
    with open(metadata_file, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    # Create a dictionary for quick lookup of release dates by title
    release_dates = {item['title']: item['release_date'] for item in metadata}

    # Iterate through each file in the transcripts folder
    for filename in os.listdir(transcripts_folder):
        if filename.endswith(".txt"):  # Assuming transcript files are .txt
            filepath = os.path.join(transcripts_folder, filename)

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract current title and check if it exists in metadata
            title_match = re.search(r"Video title: (.+)", content)
            if title_match:
                current_title = title_match.group(1).strip()
                if current_title in release_dates:
                    new_date_str = release_dates[current_title]
                    # Convert release date to desired format "YYYY-MM-DD HH:MM:SS"
                    # Assuming release_date is "YYYY-MM-DD"
                    new_datetime_obj = datetime.strptime(new_date_str, "%b %d, %Y")
                    # Using a dummy time for now, you can adjust this if needed
                    formatted_new_date = new_datetime_obj.strftime("%Y-%m-%d %H:%M:%S")

                    # Replace the Last modified time
                    updated_content = re.sub(
                        r"Last modified time: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}",
                        f"Last modified time: {formatted_new_date}",
                        content
                    )

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"Updated '{filename}': Last modified time set to {formatted_new_date}")
                else:
                    print(f"Warning: No release date found for '{current_title}' in metadata.")
            else:
                print(f"Warning: Could not find 'Video title' in {filename}.")

# To run the script, replace '~/transcripts' with the actual path to your home directory if needed.
# For example, on Linux/macOS, it might be '/home/yourusername/' or on Windows 'C:/Users/yourusername/'
# For demonstration, I'll use a placeholder for the home directory.
# You will need to replace this with the actual path on your system before running.
# Example: home_dir = os.path.expanduser("~") # This gets the user's home directory
# For the purpose of this example, I will assume a generic home path.

# Assuming the current working directory is the home folder for this execution
home_dir = os.getcwd() # Or specify your actual home path if it's different.

# Run the update function
update_transcript_dates(home_dir)

print("\nTo run the script:")
print("1. Copy the Python code above into a `.py` file (e.g., `update_transcripts.py`).")
print("2. Make sure the `transcripts` folder and `poki-metadata.json` are in the same directory where you run the script, or update `home_dir` variable in the script to point to the correct home directory.")
print("3. Run the script from your terminal using `python update_transcripts.py`.")