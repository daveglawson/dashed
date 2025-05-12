function processText() {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output');
    const log = document.getElementById('log');
    
    // Clear previous output and log
    output.textContent = '';
    log.innerHTML = '';
    
    // Warning phrase definitions
    const warningRules = [
        {
            name: 'Sentence Initial Conjugation',
            regex: /(?<=^|[.!?]\s)(And|But|So|Yet|However|Therefore|Consequently)\b/g,
            message: phrase => `Sentence initial conjunction detected: "${phrase}".`
        },
        {
            name: 'Summary Cliché',
            regex: /(In conclusion|To summarize|Overall|In summary)\b/gi,
            message: phrase => `Summary cliché detected: "${phrase}".`
        },
        {
            name: 'Hedging/Politeness',
            regex: /(Just|Simply|Perhaps|I believe|I think|It seems|If possible|At your earliest convenience)\b/gi,
            message: phrase => `Hedging or politeness phrase detected: "${phrase}".`
        },
        {
            name: 'Professional Overkill',
            regex: /(Hope this helps|Please let me know if you have any questions|Feel free to reach out|finds you well|hope)/gi,
            message: phrase => `Professional overkill phrase detected: "${phrase}".`
        }
    ];
    
    // Curly to straight quote map
    const curlyQuoteMap = {
        '“': '"',
        '”': '"',
        '‘': "'",
        '’': "'"
    };
    const curlyQuoteRegex = /[''""]/g;
    
    // Split text into lines to preserve line breaks
    const lines = input.split(/\r?\n/);
    let processedLines = [];
    let sentenceCount = 0;
    
    lines.forEach((line, lineIdx) => {
        // For display, replace curly quotes with highlighted straight quotes
        let displayLine = line.replace(curlyQuoteRegex, match => `<span class="highlight-straightquote">${curlyQuoteMap[match]}</span>`);
        // For processing/copy, replace curly quotes with straight quotes
        let plainLine = line.replace(curlyQuoteRegex, match => curlyQuoteMap[match]);

        // Split each line into sentences
        const sentences = plainLine.split(/(?<=[.!?])\s+/);
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
                logEntry.className = 'log-entry emdash';
                logEntry.textContent = `Sentence ${sentenceCount}: More than two em dashes found—output may be degraded.`;
                log.appendChild(logEntry);
            }
            processedLine += processedSentence + ' ';
        });
        processedLine = processedLine.trim();
        // Apply quote rule once per line, highlighting moved punctuation in pastel orange
        processedLine = processedLine.replace(/("[^"]*)([.!?])"(?![.!?])/g, function(match, p1, punc) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry punctuation';
            logEntry.textContent = `Line ${lineIdx + 1}: Moved punctuation outside quotation marks.`;
            log.appendChild(logEntry);
            return `"${p1}"<span class="highlight-punctmove">${punc}</span>`;
        });
        // Apply bracket rule once per line, highlighting moved punctuation in pastel orange
        processedLine = processedLine.replace(/\(([^()]*)([.!?])\)(?![.!?])/g, function(match, p1, punc) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry punctuation';
            logEntry.textContent = `Line ${lineIdx + 1}: Moved punctuation outside parentheses.`;
            log.appendChild(logEntry);
            return `(${p1})<span class="highlight-punctmove">${punc}</span>`;
        });
        // Apply warning rules (highlight and log, but do not change text)
        warningRules.forEach(rule => {
            processedLine = processedLine.replace(rule.regex, function(match) {
                // Log only once per phrase per line
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry warning';
                logEntry.textContent = `Line ${lineIdx + 1}: ${rule.message(match)}`;
                log.appendChild(logEntry);
                return `<span class="highlight-warning">${match}</span>`;
            });
        });
        
        // Check for straight quotes and log them
        const straightQuotes = plainLine.match(/["']/g);
        if (straightQuotes && straightQuotes.length > 0) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry quote';
            logEntry.textContent = `Line ${lineIdx + 1}: Straight quotes converted to typographic quotes.`;
            log.appendChild(logEntry);
        }
        
        // Now, merge the highlighted straight quotes from displayLine into processedLine
        // We'll do this by replacing straight quotes in processedLine with highlighted ones from displayLine, but only at positions where displayLine has a highlight span
        let mergedLine = '';
        let i = 0, j = 0;
        while (i < processedLine.length && j < displayLine.length) {
            if (displayLine.slice(j, j + 31) === '<span class="highlight-straightquote">') {
                // Find end of span
                let end = displayLine.indexOf('</span>', j);
                if (end !== -1) {
                    let span = displayLine.slice(j, end + 7);
                    // Only replace if processedLine at i is a straight quote
                    if (processedLine[i] === '"' || processedLine[i] === "'") {
                        mergedLine += span;
                        i += 1;
                        j = end + 7;
                        continue;
                    }
                }
            }
            mergedLine += processedLine[i];
            i += 1;
            j += 1;
        }
        // Append any remaining part of processedLine
        if (i < processedLine.length) mergedLine += processedLine.slice(i);
        processedLines.push(mergedLine);
    });
    
    // Join lines with <br> to preserve original line breaks
    output.innerHTML = processedLines.join('<br>');
} 