import whisper
import time
import os 
import re
import datetime 
# track time

# open file in folder test
files = os.listdir("poki")

# load whisper model on gpu
model = whisper.load_model("turbo", device="cuda")

for file in files:
    start = time.time()
    # filename = files[0]
    filename = file
    # input(filename)\
    print("filename: ", filename)
    youtube_url = re.search(r"\[(\w+)\]\.wav", filename).group(1)
    print("youtube_url: ", youtube_url)
    youtube_title = re.search(r"^(.*?)\s*\[\w+\]\.wav", filename).group(1)
    # input(f"youtube.com/watch?v={youtube_url}")

    # Get the modification time
    mod_time = os.path.getmtime(os.path.join("poki", filename))
    mod_datetime = datetime.datetime.fromtimestamp(mod_time)


    print("youtube_title: ", youtube_title)

    result = model.transcribe(f"{os.path.join('poki', filename)}", word_timestamps=False)

    # Write the result to a file
    with open(f"{filename}.txt", "w", encoding="utf-8") as f:
        f.write(f"Video title: {youtube_title}\n")
        f.write(f"Youtube video code: {youtube_url}\n")
        f.write(f"Last modified time: {mod_datetime}\n")
        f.write(f"\n------------------ \n\n")
        for segment in result["segments"]:
            start_time = segment["start"]
            end_time = segment["end"]
            text = segment["text"]
            f.write(f"[{start_time:.2f} --> {end_time:.2f}] {text}\n")

    # Track time
    end = time.time()
    print(f"Transcribed in {end - start:.2f} seconds")

# save info to a file
# Episode name
# Date
# youtube url