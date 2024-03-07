async function readableStreamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    let chunks = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks += new TextDecoder().decode(value);
    }

    return chunks;
}

