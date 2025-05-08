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
                processedSentence = sentence.replace(/—/g, ' - ');
            } else if (emDashCount === 2) {
                processedSentence = sentence.replace(/—/g, ', ');
            } else if (emDashCount >= 3) {
                processedSentence = sentence.replace(/—/g, ', ');
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry';
                logEntry.textContent = `Sentence ${sentenceCount}: More than two em dashes found—output may be degraded.`;
                log.appendChild(logEntry);
            }

            processedLine += processedSentence + ' ';
        });
        processedLine = processedLine.trim();
        // Apply quote rule once per line
        processedLine = processedLine.replace(/("[^"]*[.!?])"(?![.!?])/g, function(match, p1) {
            const quoteContent = p1.slice(0, -1);
            const punctuation = p1.slice(-1);
            return `"${quoteContent}"${punctuation}`;
        });
        // Apply bracket rule once per line
        processedLine = processedLine.replace(/\(([^()]*[.!?])\)(?![.!?])/g, function(match, p1) {
            const bracketContent = p1.slice(0, -1);
            const punctuation = p1.slice(-1);
            return `(${bracketContent})${punctuation}`;
        });
        processedLines.push(processedLine);
    });
    
    // Join lines with <br> to preserve original line breaks
    output.innerHTML = processedLines.join('<br>');
} 