#!/usr/bin/env python3
#
# pip install openai
# ./spell-check-post.py src/3.x/intro.md
#
# Credits to: https://gist.github.com/t04glovern/df5c614810325579f7b39e3568a5eaec

import argparse
import os

from openai import OpenAI
# import frontmatter

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def stream_grammar_and_spelling(input_file_path):
    """Stream grammar and spelling checks of the blog post."""
    # Load markdown file
    with open(input_file_path, 'r') as file:
        # content = frontmatter.loads(file.read())
        content = file.read()
    
    # Construct the prompt for grammar and spelling check
    prompt = (
        "For the following markdown documentation page - "
        "I want you to spell and grammar check the documentation page, making small, "
        "low impact changes where necessary - I don't want sentences to be significantly rewritten, "
        "however 1-2 word changes, spelling fixes and minor grammar are fine. "
        "You should not modify any codeblocks, blocks that start with ```, nor should you modify the markdown header block (starting with a single hashtag) at the start of each page. "
        "You should output the same markdown with the changes applied. Do not reply with anything except for the final markdown.\n\n"
        # "" + frontmatter.dumps(content) + ""
        "" + content + ""
    )

    # Call OpenAI's API to process the markdown content with streaming
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo-16k",
        messages=[
            {"role": "user", "content": prompt}
        ],
        stream=True
    )

    return completion

def save_streamed_content(original_file_path, completion_stream):
    """Save the streamed content to a new file."""
    # new_file_path = original_file_path.replace(".md", ".new.md")
    new_file_path = original_file_path

    with open(new_file_path, 'w') as file:
        print("Follow the stream of content: ")
        print("tail -f " + new_file_path)
        for chunk in completion_stream:
            if hasattr(chunk.choices[0].delta, 'content'):
                content_chunk = chunk.choices[0].delta.content
                if content_chunk:
                    file.write(content_chunk)
                    file.flush()

def process_markdown_file_streaming(input_file_path):
    """Process the markdown file for grammar and spelling check using streaming."""
    completion_stream = stream_grammar_and_spelling(input_file_path)
    save_streamed_content(input_file_path, completion_stream)

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Spell and grammar check a markdown file.")
    parser.add_argument("file_path", help="Path to the markdown file to process")
    args = parser.parse_args()

    # Process the provided markdown file
    process_markdown_file_streaming(args.file_path)
