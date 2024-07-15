#!/bin/bash

read_multiline_input() {
    local input=""
    local line=""
    while IFS= read -r -d $'\n' -s -n 1 char; do
        echo "$char"
        printf "$line"
        if [[ "$char" == $'\n' ]]; then
            input+=$'\n'
            continue
        fi
        if [[ "$char" == $'\x1d' ]]; then  # Ctrl+]
            break
        fi
        input+="$char"
    done
    echo "$input"
}
# read_multiline_input() {
#     local input=""
#     local line=""
#     while IFS= read -r -d $'\n' line; do
#         if [[ "${#line}" -eq 1 && $(printf "%d" "'$line") -eq 10 ]]; then
#             break
#         fi
#         input+="$line"$'\n'
#     done
#     echo "$input"
# }

while true; do
    # Prompt for user input
    echo "Enter your message (use CTRL+ENTER to send, or type 'exit' to quit):"
    user_input=$(read_multiline_input)

    # Trim trailing newline
    user_input="${user_input%$'\n'}"

    # Check if user wants to exit
    if [ "$user_input" = "exit" ]; then
        echo "Exiting..."
        break
    fi

    # Display user input
    echo "You entered:"
    echo "$user_input"

    # Make API call
    response=$(curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
         -H "Authorization: Bearer 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" \
         -H "Content-Type: application/json" \
         -d "{\"messages\": [{\"role\": \"user\", \"content\": $(jq -Rs . <<< "$user_input")}], \"model\": \"llama3-70b-8192\"}")

    # Extract and display only the message content
    message_content=$(echo "$response" | jq -r '.choices[0].message.content')
    echo "AI Response:"
    echo "$message_content"

    echo # Empty line for readability
done

