/**
 * Robustly parses a JSON string, handling common LLM output issues 
 * like markdown code blocks and preamble/postamble text.
 */
export const safeJsonParse = (text: string, fallback: any = []) => {
    if (!text) return fallback;

    let trimmedText = text.trim();

    // Helper to fix common LLM JSON-in-JSON escaping errors (e.g., "dataJson": "[{"region":"North"}]")
    const fixNestedJson = (jsonStr: string) => {
        // Find patterns like "dataJson": "[{...}]" where inner quotes are not escaped
        // Greedily match until the last "]" followed by a quote and comma/brace
        return jsonStr.replace(/"(dataJson)":\s*"(\[[\s\S]*?\])"(?=\s*[,}])/g, (match, key, nested) => {
            // Escape any unescaped quotes inside the JSON string value
            const escaped = nested.replace(/(?<!\\)"/g, '\\"');
            return `"${key}": "${escaped}"`;
        });
    };

    try {
        // 1. Try direct parse
        return JSON.parse(trimmedText);
    } catch (e) {
        // 2. Try cleaning and fixing nested JSON
        try {
            // Remove markdown code blocks
            let cleaned = trimmedText.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();

            // Try fundamental fix for nested JSON strings
            cleaned = fixNestedJson(cleaned);

            // 1a. Try parse again after fixing nested JSON
            try {
                return JSON.parse(cleaned);
            } catch (innerE) { }

            // 3. Fallback to extraction-based parsing
            const firstCurly = cleaned.indexOf('{');
            const firstBracket = cleaned.indexOf('[');

            let startIndex = -1;
            let endIndex = -1;

            if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
                startIndex = firstCurly;
                endIndex = cleaned.lastIndexOf('}');
            } else if (firstBracket !== -1) {
                startIndex = firstBracket;
                endIndex = cleaned.lastIndexOf(']');
            }

            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const potentialJson = cleaned.substring(startIndex, endIndex + 1);
                return JSON.parse(potentialJson);
            }
        } catch (innerError) {
            console.error("[safeJsonParse] Deep cleaning failed:", innerError);
        }
    }

    console.warn("[safeJsonParse] All parsing attempts failed for input:", text.substring(0, 100) + "...");
    return fallback;
};
