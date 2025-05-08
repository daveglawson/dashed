function processText() {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output');
    const log = document.getElementById('log');
    
    // Clear previous output and log
    output.textContent = '';
    log.innerHTML = '';
    
    // Split text into lines to preserve line breaks
    const lines = input.split(/\r?\n/);
    let processedLines = [];
    let sentenceCount = 0;
    
    lines.forEach(line => {
        // Split each line into sentences
        const sentences = line.split(/(?<=[.!?])\s+/);
        let processedLine = '';
        sentences.forEach(sentence => {
            if (!sentence.trim()) return;
            sentenceCount++;
            // Count em-dashes in the sentence
            const emDashCount = (sentence.match(/—/g) || []).length;
            let processedSentence = sentence;
            if (emDashCount === 1) {
                processedSentence = sentence.replace(/—/g, '<span class="highlight-emdash"> - </span>');
            } else if (emDashCount === 2) {
                processedSentence = sentence.replace(/—/g, '<span class="highlight-emdash">, </span>');
            } else if (emDashCount >= 3) {
                processedSentence = sentence.replace(/—/g, '<span class="highlight-emdash">, </span>');
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry';
                logEntry.textContent = `Sentence ${sentenceCount}: More than two em dashes found—output may be degraded.`;
                log.appendChild(logEntry);
            }
            processedLine += processedSentence + ' ';
        });
        processedLine = processedLine.trim();
        // Apply quote rule once per line, highlighting moved punctuation in pastel orange
        processedLine = processedLine.replace(/("[^"]*)([.!?])"(?![.!?])/g, function(match, p1, punc) {
            return `"${p1}"<span class="highlight-punctmove">${punc}</span>`;
        });
        // Apply bracket rule once per line, highlighting moved punctuation in pastel orange
        processedLine = processedLine.replace(/\(([^()]*)([.!?])\)(?![.!?])/g, function(match, p1, punc) {
            return `(${p1})<span class="highlight-punctmove">${punc}</span>`;
        });
        processedLines.push(processedLine);
    });
    
    // Join lines with <br> to preserve original line breaks
    output.innerHTML = processedLines.join('<br>');
} 