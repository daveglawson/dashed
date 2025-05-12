function processText() {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output');
    const log = document.getElementById('log');
    const copyButton = document.getElementById('copyButton');
    
    // Clear previous output and log
    output.textContent = '';
    log.innerHTML = '';
    
    // Disable copy button initially
    copyButton.disabled = true;
    
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
    
    // Curly to straight quote map - using escaped unicode to avoid syntax issues
    const curlyQuoteMap = {
        '\u201C': '"', // Left double quote
        '\u201D': '"', // Right double quote
        '\u2018': "'", // Left single quote
        '\u2019': "'"  // Right single quote
    };
    const curlyQuoteRegex = /[\u2018\u2019\u201C\u201D]/g;
    
    // Split text into lines to preserve line breaks
    const lines = input.split(/\r?\n/);
    let processedLines = [];
    let plainTextLines = [];
    let sentenceCount = 0;
    
    lines.forEach((line, lineIdx) => {
        // For display, replace curly quotes with highlighted straight quotes
        let displayLine = line.replace(curlyQuoteRegex, match => `<span class="highlight-straightquote">${curlyQuoteMap[match]}</span>`);
        // For processing/copy, replace curly quotes with straight quotes
        let plainLine = line.replace(curlyQuoteRegex, match => curlyQuoteMap[match]);
        
        // Store a clean version for copying
        let plainTextLine = plainLine;

        // Split each line into sentences
        const sentences = plainLine.split(/(?<=[.!?])\s+/);
        let processedLine = '';
        sentences.forEach(sentence => {
            if (!sentence.trim()) return;
            sentenceCount++;
            // Count em-dashes in the sentence
            const emDashCount = (sentence.match(/\u2014/g) || []).length;
            let processedSentence = sentence;
            if (emDashCount === 1) {
                processedSentence = sentence.replace(/\u2014/g, '<span class="highlight-emdash"> - </span>');
                plainTextLine = plainTextLine.replace(/\u2014/g, ' - ');
            } else if (emDashCount === 2) {
                processedSentence = sentence.replace(/\u2014/g, '<span class="highlight-emdash">, </span>');
                plainTextLine = plainTextLine.replace(/\u2014/g, ', ');
            } else if (emDashCount >= 3) {
                processedSentence = sentence.replace(/\u2014/g, '<span class="highlight-emdash">, </span>');
                plainTextLine = plainTextLine.replace(/\u2014/g, ', ');
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry emdash';
                logEntry.textContent = `Sentence ${sentenceCount}: More than two em dashes found\u2014output may be degraded.`;
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
            
            // Also update the plain text version
            plainTextLine = plainTextLine.replace(/("[^"]*)([.!?])"(?![.!?])/g, `"$1"$2`);
            
            return `"${p1}"<span class="highlight-punctmove">${punc}</span>`;
        });
        
        // Apply bracket rule once per line, highlighting moved punctuation in pastel orange
        processedLine = processedLine.replace(/\(([^()]*)([.!?])\)(?![.!?])/g, function(match, p1, punc) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry punctuation';
            logEntry.textContent = `Line ${lineIdx + 1}: Moved punctuation outside parentheses.`;
            log.appendChild(logEntry);
            
            // Also update the plain text version
            plainTextLine = plainTextLine.replace(/\(([^()]*)([.!?])\)(?![.!?])/g, `($1)$2`);
            
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
        
        // Now, merge the highlighted straight quotes from displayLine into processedLine
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
        plainTextLines.push(plainTextLine);
    });
    
    // Join lines with <br> to preserve original line breaks
    output.innerHTML = processedLines.join('<br>');
    
    // Store the plain text version for copying
    output.setAttribute('data-plain-text', plainTextLines.join('\n'));
    
    // Enable copy button if there's output
    if (processedLines.length > 0) {
        copyButton.disabled = false;
    }
}

function copyOutput() {
    // Get the plain text version stored in the data attribute
    const plainText = document.getElementById('output').getAttribute('data-plain-text');
    
    // Use the clipboard API to copy the text
    navigator.clipboard.writeText(plainText).then(
        function() {
            // Success feedback - temporarily change button text
            const copyButton = document.getElementById('copyButton');
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = '<span class="material-icons">check</span>Copied!';
            
            // Reset button after 2 seconds
            setTimeout(function() {
                copyButton.innerHTML = originalHTML;
            }, 2000);
        },
        function() {
            // Error feedback
            alert('Failed to copy text. Please try again.');
        }
    );
} 